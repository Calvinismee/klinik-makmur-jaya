<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Concerns\ChoosesNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusNotification extends Notification
{
    use ChoosesNotificationChannels, Queueable;

    public function __construct(
        private Order $order,
        private string $statusLabel,
        private string $message
    ) {}

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'order_status',
            'title' => "Pesanan {$this->statusLabel}",
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'severity' => 'info',
            'dedupe_key' => "order_status:{$this->order->id}:{$this->order->order_status}:{$this->order->payment_status}",
            'message' => $this->message,
            'url' => route('customer.orders.show', ['order' => $this->order->order_number], false),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Status Pesanan {$this->order->order_number}: {$this->statusLabel}")
            ->line($this->message)
            ->action('Lihat Pesanan', url(route('customer.orders.show', ['order' => $this->order->order_number], false)));
    }
}
