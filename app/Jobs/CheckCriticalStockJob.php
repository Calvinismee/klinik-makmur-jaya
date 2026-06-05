<?php

namespace App\Jobs;

use App\Models\Medicine;
use App\Models\User;
use App\Notifications\CriticalStockNotification;
use App\Services\NotificationDispatchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckCriticalStockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $medicines = Medicine::withSum('batches', 'remaining_quantity')->where('is_active', true)->get();
        $apotekers = User::role('apoteker')->get();

        foreach ($medicines as $medicine) {
            $currentStock = (int) ($medicine->batches_sum_remaining_quantity ?? 0);
            $minimumStock = (int) ($medicine->minimum_stock ?: 20);

            if ($currentStock >= $minimumStock) {
                continue;
            }

            foreach ($apotekers as $apoteker) {
                NotificationDispatchService::sendOnce(
                    $apoteker,
                    new CriticalStockNotification($medicine, $currentStock, $minimumStock),
                    "critical_stock:{$medicine->id}:{$minimumStock}"
                );
            }
        }
    }
}
