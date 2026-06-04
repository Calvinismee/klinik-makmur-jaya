<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class NotificationDispatchService
{
    public static function sendOnce(User $user, Notification $notification, string $dedupeKey): void
    {
        $exists = DB::table('notifications')
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $user->id)
            ->where('data', 'like', '%"dedupe_key":"' . addcslashes($dedupeKey, '%_\\') . '"%')
            ->exists();

        if ($exists) {
            return;
        }

        $user->notify($notification);
    }
}
