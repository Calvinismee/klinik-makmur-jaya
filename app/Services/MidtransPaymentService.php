<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class MidtransPaymentService
{
    public function createSnapTransaction(Order $order): Order
    {
        $order->loadMissing(['user', 'items.medicine']);

        if ($order->payment_status === 'paid') {
            throw new RuntimeException('Pesanan sudah dibayar.');
        }

        if ($order->order_status !== 'waiting_payment') {
            throw new RuntimeException('Pesanan belum siap untuk pembayaran online.');
        }

        if ($order->midtrans_redirect_url && $order->payment_status !== 'failed') {
            return $order;
        }

        $serverKey = $this->serverKey();
        $response = Http::withBasicAuth($serverKey, '')
            ->acceptJson()
            ->asJson()
            ->post($this->snapEndpoint(), $this->payload($order));

        if (!$response->successful()) {
            throw new RuntimeException('Gagal membuat transaksi Midtrans: ' . $response->body());
        }

        $data = $response->json();

        $order->forceFill([
            'payment_provider' => 'midtrans',
            'payment_status' => 'pending',
            'midtrans_snap_token' => $data['token'] ?? null,
            'midtrans_redirect_url' => $data['redirect_url'] ?? null,
            'midtrans_transaction_status' => 'pending',
        ])->save();

        return $order;
    }

    public function validSignature(array $payload): bool
    {
        $signature = $payload['signature_key'] ?? null;

        if (!$signature) {
            return false;
        }

        $expected = hash(
            'sha512',
            ($payload['order_id'] ?? '') .
            ($payload['status_code'] ?? '') .
            ($payload['gross_amount'] ?? '') .
            $this->serverKey()
        );

        return hash_equals($expected, $signature);
    }

    public function getTransactionStatus(Order $order): array
    {
        $response = Http::withBasicAuth($this->serverKey(), '')
            ->acceptJson()
            ->get($this->statusEndpoint($order));

        if (!$response->successful()) {
            throw new RuntimeException('Gagal mengecek status transaksi Midtrans: ' . $response->body());
        }

        return $response->json();
    }

    private function payload(Order $order): array
    {
        return [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) round($order->total_amount),
            ],
            'customer_details' => [
                'first_name' => $order->user?->name,
                'email' => $order->user?->email,
            ],
            'item_details' => $order->items->map(fn ($item) => [
                'id' => (string) $item->medicine_id,
                'price' => (int) round($item->price),
                'quantity' => (int) $item->quantity,
                'name' => Str::limit($item->medicine?->name ?? 'Obat', 45, ''),
            ])->values()->all(),
            'callbacks' => [
                'finish' => route('customer.orders.show', $order),
            ],
        ];
    }

    private function snapEndpoint(): string
    {
        return config('services.midtrans.is_production')
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    private function statusEndpoint(Order $order): string
    {
        $baseUrl = config('services.midtrans.is_production')
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';

        return $baseUrl . '/' . rawurlencode($order->order_number) . '/status';
    }

    private function serverKey(): string
    {
        $serverKey = config('services.midtrans.server_key');

        if (!$serverKey) {
            throw new RuntimeException('MIDTRANS_SERVER_KEY belum dikonfigurasi.');
        }

        if (str_starts_with($serverKey, 'Mid-client-')) {
            throw new RuntimeException('MIDTRANS_SERVER_KEY saat ini berisi Client Key. Gunakan Server Key dari dashboard Midtrans.');
        }

        return $serverKey;
    }
}
