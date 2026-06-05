<?php

namespace App\Notifications\Concerns;

trait ChoosesNotificationChannels
{
    public function via(object $notifiable): array
    {
        if (!config('services.notifications.mail_enabled')) {
            return ['database'];
        }

        return ['database', 'mail'];
    }
}
