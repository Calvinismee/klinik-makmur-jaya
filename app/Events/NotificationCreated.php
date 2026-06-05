<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $userId,
        public array $notification
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("user-notifications.{$this->userId}")];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public static function fromUser(User $user, array $notification): self
    {
        return new self($user->id, $notification);
    }
}
