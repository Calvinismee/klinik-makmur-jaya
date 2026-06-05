<?php

namespace App\Notifications;

use App\Models\MedicineBatch;
use App\Notifications\Concerns\ChoosesNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExpiringBatchNotification extends Notification
{
    use Queueable, ChoosesNotificationChannels;

    protected $batch;
    protected int $daysBefore;

    public function __construct(MedicineBatch $batch, int $daysBefore = 30)
    {
        $this->batch = $batch;
        $this->daysBefore = $daysBefore;
    }

    public function toDatabase(object $notifiable): array
    {
        $medicineName = $this->batch->medicine?->name ?? 'Obat';

        return [
            'type' => 'expiring_batch',
            'title' => "Batch mendekati kadaluarsa {$this->daysBefore} hari",
            'batch_id' => $this->batch->id,
            'severity' => $this->daysBefore <= 30 ? 'critical' : 'warning',
            'dedupe_key' => "expiring_batch:{$this->batch->id}:{$this->daysBefore}",
            'message' => "{$medicineName} batch {$this->batch->batch_number} akan kadaluarsa pada {$this->batch->expired_at->format('d/m/Y')}.",
            'url' => '/pharmacist/batches',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $medicineName = $this->batch->medicine?->name ?? 'Obat';

        return (new MailMessage)
            ->subject("Batch Obat Mendekati Kadaluarsa {$this->daysBefore} Hari")
            ->line("{$medicineName} batch {$this->batch->batch_number} akan kadaluarsa pada {$this->batch->expired_at->format('d/m/Y')}.")
            ->line("Sisa stok batch: {$this->batch->remaining_quantity}.")
            ->action('Lihat Stok & Batch', url('/pharmacist/batches'));
    }
}
