<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\MedicineBatch;
use App\Models\User;
use App\Notifications\ExpiringBatchNotification;
use App\Services\NotificationDispatchService;
use Carbon\Carbon;

class CheckExpiringMedicineJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $today = Carbon::today();

        $expiringBatches = MedicineBatch::with('medicine')
            ->where('remaining_quantity', '>', 0)
            ->whereBetween('expired_at', [$today, $today->copy()->addDays(90)])
            ->get();

        $apotekers = User::role('apoteker')->get();

        foreach ($expiringBatches as $batch) {
            $daysUntilExpired = (int) floor($today->diffInDays($batch->expired_at, false));
            $threshold = collect([30, 60, 90])->first(fn (int $days) => $daysUntilExpired <= $days);

            if (!$threshold) {
                continue;
            }

            foreach ($apotekers as $apoteker) {
                NotificationDispatchService::sendOnce(
                    $apoteker,
                    new ExpiringBatchNotification($batch, $threshold),
                    "expiring_batch:{$batch->id}:{$threshold}"
                );
            }
        }
    }
}
