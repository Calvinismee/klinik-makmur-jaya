<?php

namespace App\Notifications;

use App\Notifications\Concerns\ChoosesNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SystemJobStatusNotification extends Notification
{
    use ChoosesNotificationChannels, Queueable;

    public function __construct(
        private string $title,
        private string $message,
        private string $severity = 'info',
        private ?string $url = null,
        private ?string $dedupeKey = null
    ) {}

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'system_job',
            'title' => $this->title,
            'severity' => $this->severity,
            'message' => $this->message,
            'url' => $this->url,
            'dedupe_key' => $this->dedupeKey ?? 'system_job:'.md5($this->title.$this->message.now()->timestamp),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->title)
            ->line($this->message);

        if ($this->url) {
            $mail->action('Lihat Detail', url($this->url));
        }

        return $mail;
    }
}
