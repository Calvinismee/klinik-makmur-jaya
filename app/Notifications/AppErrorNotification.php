<?php

namespace App\Notifications;

use App\Models\ErrorLog;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppErrorNotification extends Notification
{
    use Queueable;

    public function __construct(private ErrorLog $errorLog)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'app_error',
            'title' => "Error {$this->errorLog->severity}",
            'error_log_id' => $this->errorLog->id,
            'severity' => $this->errorLog->severity,
            'dedupe_key' => "app_error:{$this->errorLog->id}",
            'message' => $this->errorLog->message,
            'url' => '/admin/error-logs',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Error Aplikasi: {$this->errorLog->severity}")
            ->line($this->errorLog->message)
            ->line($this->errorLog->file ? "{$this->errorLog->file}:{$this->errorLog->line}" : 'Lokasi error tidak tersedia.')
            ->action('Lihat Error Logs', url('/admin/error-logs'));
    }
}
