<?php

namespace App\Notifications;

use App\Models\Medicine;
use App\Notifications\Concerns\ChoosesNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CriticalStockNotification extends Notification
{
    use Queueable, ChoosesNotificationChannels;

    protected $medicine;
    protected int $currentStock;
    protected int $minimumStock;

    public function __construct(Medicine $medicine, int $currentStock, int $minimumStock)
    {
        $this->medicine = $medicine;
        $this->currentStock = $currentStock;
        $this->minimumStock = $minimumStock;
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'critical_stock',
            'title' => 'Stok obat kritis',
            'medicine_id' => $this->medicine->id,
            'severity' => 'warning',
            'dedupe_key' => "critical_stock:{$this->medicine->id}:{$this->minimumStock}",
            'message' => "Stok {$this->medicine->name} tersisa {$this->currentStock}, di bawah minimum {$this->minimumStock}.",
            'url' => '/pharmacist/batches',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Stok Obat Kritis')
            ->line("Stok {$this->medicine->name} tersisa {$this->currentStock}.")
            ->line("Minimum stok yang ditetapkan: {$this->minimumStock}.")
            ->action('Lihat Stok & Batch', url('/pharmacist/batches'));
    }
}
