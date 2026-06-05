<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Concerns\ChoosesNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewProcessingOrderNotification extends Notification
{
    use Queueable, ChoosesNotificationChannels;

    public function __construct(private Order $order)
    {
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'processing_order',
            'title' => 'Pesanan perlu disiapkan',
            'severity' => 'info',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'dedupe_key' => "processing_order:{$this->order->id}",
            'message' => "Pesanan #{$this->order->order_number} sudah dibayar dan perlu disiapkan.",
            'url' => '/pharmacist/orders',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pesanan Perlu Disiapkan')
            ->line("Pesanan #{$this->order->order_number} sudah dibayar dan masuk antrean apoteker.")
            ->action('Lihat Pesanan', url('/pharmacist/orders'));
    }
}
