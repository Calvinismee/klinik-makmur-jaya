<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Concerns\ChoosesNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPrescriptionOrderNotification extends Notification
{
    use ChoosesNotificationChannels, Queueable;

    public function __construct(private Order $order) {}

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'prescription_verification',
            'title' => 'Resep baru perlu diverifikasi',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'severity' => 'warning',
            'dedupe_key' => "prescription_verification:{$this->order->id}",
            'message' => "Pesanan #{$this->order->order_number} menunggu verifikasi resep.",
            'url' => '/pharmacist/prescriptions',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Resep Baru Perlu Diverifikasi')
            ->line("Pesanan #{$this->order->order_number} menunggu verifikasi resep.")
            ->action('Buka Verifikasi Resep', url('/pharmacist/prescriptions'));
    }
}
