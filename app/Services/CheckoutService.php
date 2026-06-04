<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\NewPrescriptionOrderNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutService
{
    protected $cartService;
    protected $stockService;

    public function __construct(CartService $cartService, StockService $stockService)
    {
        $this->cartService = $cartService;
        $this->stockService = $stockService;
    }

    public function processCheckout(int $userId, array $data)
    {
        $cart = $this->cartService->getCart();

        if (empty($cart)) {
            throw new \Exception('Cart is empty.');
        }

        $subtotal = $this->cartService->getSubtotal();
        $hasPrescriptionItem = false;

        foreach ($cart as $item) {
            if ($item['requires_prescription']) {
                $hasPrescriptionItem = true;
            }
            $availableStock = $this->stockService->getTotalStock($item['id']);
            if ($availableStock < $item['quantity']) {
                throw new \Exception("Insufficient stock for {$item['name']}");
            }
        }

        if ($hasPrescriptionItem && empty($data['prescription_image'])) {
            throw new \Exception('Prescription image is required for some medicines in your cart.');
        }

        return DB::transaction(function () use ($userId, $data, $cart, $subtotal, $hasPrescriptionItem) {
            $orderNumber = 'ORD-' . strtoupper(Str::random(10));

            $order = Order::create([
                'user_id' => $userId,
                'order_number' => $orderNumber,
                'total_amount' => $subtotal,
                'order_status' => $hasPrescriptionItem ? 'waiting_prescription_verification' : 'waiting_payment',
                'payment_status' => 'unpaid',
                'payment_provider' => 'midtrans',
                'prescription_status' => $hasPrescriptionItem ? 'pending' : null,
                'prescription_image' => $data['prescription_image'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'medicine_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }

            $this->cartService->clearCart();

            if ($hasPrescriptionItem) {
                User::role('apoteker')->get()->each(function (User $apoteker) use ($order) {
                    NotificationDispatchService::sendOnce(
                        $apoteker,
                        new NewPrescriptionOrderNotification($order),
                        "prescription_verification:{$order->id}"
                    );
                });
            }

            return $order;
        });
    }

    public function processOfflineCheckout(int $cashierId, array $cart, array $data)
    {
        if (empty($cart)) {
            throw new \Exception('Cart is empty.');
        }

        $subtotal = 0;
        foreach ($cart as $item) {
            $subtotal += $item['price'] * $item['quantity'];
            $availableStock = $this->stockService->getTotalStock($item['id']);
            if ($availableStock < $item['quantity']) {
                throw new \Exception("Insufficient stock for {$item['name']}");
            }
        }

        return DB::transaction(function () use ($cashierId, $data, $cart, $subtotal) {
            $orderNumber = 'POS-' . strtoupper(Str::random(10));

            $order = Order::create([
                'user_id' => $cashierId, // Use cashier's ID for offline orders or create a dummy user
                'order_number' => $orderNumber,
                'total_amount' => $subtotal,
                'order_status' => 'completed',
                'payment_status' => 'paid',
                'prescription_status' => null,
                'notes' => 'Offline POS Order. ' . ($data['notes'] ?? ''),
            ]);

            foreach ($cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'medicine_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);

                // Deduct stock immediately
                $this->stockService->deductStock(
                    $item['id'],
                    $item['quantity'],
                    'offline_sale',
                    $order->id,
                    "POS Order #{$orderNumber}",
                    $cashierId
                );
            }

            return $order;
        });
    }
}
