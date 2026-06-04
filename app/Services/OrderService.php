<?php

namespace App\Services;

use App\Models\Order;
use App\Notifications\OrderStatusNotification;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderService
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function verifyPrescription(int $orderId, string $status, string $reason = null)
    {
        $order = Order::findOrFail($orderId);

        if ($order->prescription_status !== 'pending') {
            throw new Exception("Prescription is not in pending state.");
        }

        return DB::transaction(function () use ($order, $status, $reason) {
            $order->prescription_status = $status;
            
            if ($status === 'approved') {
                $order->order_status = 'waiting_payment';
            } elseif ($status === 'rejected') {
                $order->order_status = 'prescription_rejected';
                $order->notes = $order->notes ? $order->notes . "\nRejection Reason: " . $reason : "Rejection Reason: " . $reason;
            }

            $order->save();
            $this->markPrescriptionVerificationNotificationsRead($order);
            $this->notifyCustomer($order);
            return $order;
        });
    }

    public function processOrder(int $orderId)
    {
        $order = Order::with('items')->findOrFail($orderId);

        if ($order->payment_status !== 'paid') {
            throw new Exception("Order must be paid before it can be processed.");
        }

        if (!in_array($order->order_status, ['waiting_payment', 'paid'])) {
            throw new Exception("Order cannot be processed from current state.");
        }

        return DB::transaction(function () use ($order) {
            // Deduct stock for all items
            foreach ($order->items as $item) {
                $this->stockService->deductStock(
                    $item->medicine_id,
                    $item->quantity,
                    'order',
                    $order->id,
                    "Order #{$order->order_number} processed",
                    auth()->id()
                );
            }

            $order->order_status = 'processing';
            $order->save();
            $this->notifyCustomer($order);

            return $order;
        });
    }

    public function completeOnlinePayment(int $orderId)
    {
        return DB::transaction(function () use ($orderId) {
            $order = Order::whereKey($orderId)->lockForUpdate()->firstOrFail();
            $order->load('items');

            if ($order->payment_status === 'paid') {
                throw new Exception("Order is already paid.");
            }

            if ($order->order_status !== 'waiting_payment') {
                throw new Exception("Order cannot be paid from current state.");
            }

            foreach ($order->items as $item) {
                $this->stockService->deductStock(
                    $item->medicine_id,
                    $item->quantity,
                    'order',
                    $order->id,
                    "Order #{$order->order_number} paid",
                    auth()->id()
                );
            }

            $order->payment_status = 'paid';
            $order->order_status = 'processing';
            $order->paid_at = now();
            $order->save();
            $this->notifyCustomer($order);

            return $order;
        });
    }

    public function applyMidtransNotification(string $orderNumber, array $payload)
    {
        return DB::transaction(function () use ($orderNumber, $payload) {
            $order = Order::where('order_number', $orderNumber)->lockForUpdate()->firstOrFail();
            $order->load('items');

            $transactionStatus = $payload['transaction_status'] ?? null;
            $fraudStatus = $payload['fraud_status'] ?? null;

            $order->forceFill([
                'payment_provider' => 'midtrans',
                'payment_method' => $payload['payment_type'] ?? $order->payment_method,
                'midtrans_transaction_id' => $payload['transaction_id'] ?? $order->midtrans_transaction_id,
                'midtrans_transaction_status' => $transactionStatus,
                'midtrans_fraud_status' => $fraudStatus,
            ]);

            if ($this->isMidtransPaid($transactionStatus, $fraudStatus)) {
                if ($order->order_status !== 'waiting_payment' && $order->payment_status !== 'paid') {
                    throw new Exception("Order cannot be paid from current state.");
                }

                if (!$this->grossAmountMatches($order, $payload['gross_amount'] ?? null)) {
                    throw new Exception("Midtrans gross amount does not match order total.");
                }

                $isNewPayment = $order->payment_status !== 'paid';

                if ($isNewPayment) {
                    foreach ($order->items as $item) {
                        $this->stockService->deductStock(
                            $item->medicine_id,
                            $item->quantity,
                            'order',
                            $order->id,
                            "Order #{$order->order_number} paid via Midtrans",
                            null
                        );
                    }

                    $order->order_status = 'processing';
                    $order->paid_at = now();
                }

                $order->payment_status = 'paid';

                if ($isNewPayment) {
                    $this->notifyCustomer($order);
                }
            } elseif ($transactionStatus === 'pending') {
                if ($order->payment_status !== 'paid') {
                    $order->payment_status = 'pending';
                }
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure'], true)) {
                if ($order->payment_status !== 'paid') {
                    $order->payment_status = 'failed';
                    $order->order_status = 'cancelled';
                }
            }

            $order->save();

            return $order;
        });
    }

    private function isMidtransPaid(?string $transactionStatus, ?string $fraudStatus): bool
    {
        if ($transactionStatus === 'settlement') {
            return true;
        }

        return $transactionStatus === 'capture' && in_array($fraudStatus, [null, 'accept'], true);
    }

    private function grossAmountMatches(Order $order, mixed $grossAmount): bool
    {
        if ($grossAmount === null) {
            return false;
        }

        return (int) round((float) $grossAmount) === (int) round((float) $order->total_amount);
    }

    public function completeOrder(int $orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->order_status !== 'ready_to_pickup') {
            throw new Exception("Order must be ready before it can be completed.");
        }

        $order->order_status = 'completed';
        $order->save();
        $this->notifyCustomer($order);

        return $order;
    }

    public function markReadyToPickup(int $orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->payment_status !== 'paid') {
            throw new Exception("Order must be paid before it can be marked ready.");
        }

        if ($order->order_status !== 'processing') {
            throw new Exception("Order must be processing before it can be marked ready.");
        }

        $order->order_status = 'ready_to_pickup';
        $order->save();
        $this->notifyCustomer($order);

        return $order;
    }

    public function cancelOrder(int $orderId)
    {
        $order = Order::findOrFail($orderId);

        if (in_array($order->order_status, ['completed', 'cancelled'])) {
            throw new Exception("Order is already completed or cancelled.");
        }

        $order->order_status = 'cancelled';
        $order->save();
        $this->notifyCustomer($order);

        return $order;
    }

    private function notifyCustomer(Order $order, ?string $label = null, ?string $message = null): void
    {
        $order->loadMissing('user');

        if (!$order->user || !$order->user->hasRole('pasien')) {
            return;
        }

        [$defaultLabel, $defaultMessage] = $this->customerStatusMessage($order);

        NotificationDispatchService::sendOnce(
            $order->user,
            new OrderStatusNotification($order, $label ?? $defaultLabel, $message ?? $defaultMessage),
            "order_status:{$order->id}:{$order->order_status}:{$order->payment_status}"
        );
    }

    private function markPrescriptionVerificationNotificationsRead(Order $order): void
    {
        DB::table('notifications')
            ->where('data', 'like', '%"dedupe_key":"prescription_verification:' . $order->id . '"%')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    private function customerStatusMessage(Order $order): array
    {
        return match ($order->order_status) {
            'waiting_payment' => [
                'Dikonfirmasi',
                "Pesanan #{$order->order_number} sudah dikonfirmasi. Silakan lanjutkan pembayaran.",
            ],
            'processing' => [
                'Diproses',
                "Pesanan #{$order->order_number} sedang diproses oleh tim apotek.",
            ],
            'ready_to_pickup' => [
                'Siap Diambil/Dikirim',
                "Pesanan #{$order->order_number} sudah siap diambil atau dikirim.",
            ],
            'completed' => [
                'Selesai',
                "Pesanan #{$order->order_number} sudah selesai.",
            ],
            'prescription_rejected' => [
                'Prescription ditolak',
                "Resep untuk pesanan #{$order->order_number} ditolak. Silakan cek catatan pesanan.",
            ],
            'cancelled' => [
                'Dibatalkan',
                "Pesanan #{$order->order_number} dibatalkan.",
            ],
            default => [
                'Diperbarui',
                "Status pesanan #{$order->order_number} diperbarui menjadi {$order->order_status}.",
            ],
        };
    }
}
