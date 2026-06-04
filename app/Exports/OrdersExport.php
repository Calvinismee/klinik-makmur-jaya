<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdersExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Order::with('user')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Order Number',
            'Customer',
            'Total Amount',
            'Order Status',
            'Payment Status',
            'Date',
        ];
    }

    public function map($order): array
    {
        return [
            $order->id,
            $order->order_number,
            $order->user ? $order->user->name : 'N/A',
            $order->total_amount,
            $order->order_status,
            $order->payment_status,
            $order->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
