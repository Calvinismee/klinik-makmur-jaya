<?php

namespace App\Jobs;

use App\Services\AuditLogService;
use App\Services\OrderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessMidtransNotificationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        private string $orderNumber,
        private array $payload
    ) {
    }

    public function handle(OrderService $orderService): void
    {
        try {
            $orderService->applyMidtransNotification($this->orderNumber, $this->payload);
            AuditLogService::log('MIDTRANS_NOTIFICATION_PROCESSED', 'payments.midtrans.notification', "Midtrans notification processed for {$this->orderNumber}.");
        } catch (Throwable $exception) {
            AuditLogService::logException($exception);
            throw $exception;
        }
    }
}
