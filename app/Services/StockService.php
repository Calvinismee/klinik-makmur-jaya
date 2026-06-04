<?php

namespace App\Services;

use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Exception;

class StockService
{
    /**
     * Add new stock batch.
     */
    public function addBatch(array $data, int $userId = null)
    {
        return DB::transaction(function () use ($data, $userId) {
            $batch = MedicineBatch::create([
                'medicine_id' => $data['medicine_id'],
                'batch_number' => $data['batch_number'],
                'quantity' => $data['quantity'],
                'remaining_quantity' => $data['quantity'],
                'expired_at' => $data['expired_at'],
                'purchase_price' => $data['purchase_price'] ?? null,
                'received_at' => $data['received_at'] ?? now(),
            ]);

            StockMovement::create([
                'medicine_id' => $data['medicine_id'],
                'medicine_batch_id' => $batch->id,
                'movement_type' => 'in',
                'quantity' => $data['quantity'],
                'reference_type' => 'adjustment',
                'notes' => 'New batch added',
                'created_by' => $userId ?? auth()->id(),
            ]);

            return $batch;
        });
    }

    /**
     * Deduct stock using FIFO logic based on expired_at ascending.
     */
    public function deductStock(int $medicineId, int $quantityToDeduct, string $referenceType, int $referenceId, string $notes = '', int $userId = null)
    {
        return DB::transaction(function () use ($medicineId, $quantityToDeduct, $referenceType, $referenceId, $notes, $userId) {
            $remainingToDeduct = $quantityToDeduct;

            // Get batches ordered by expiration date (FIFO) that have remaining stock
            $batches = MedicineBatch::where('medicine_id', $medicineId)
                ->where('remaining_quantity', '>', 0)
                ->orderBy('expired_at', 'asc')
                ->lockForUpdate() // Lock rows to prevent race conditions
                ->get();

            $totalAvailable = $batches->sum('remaining_quantity');

            if ($totalAvailable < $quantityToDeduct) {
                throw new Exception("Insufficient stock for medicine ID {$medicineId}. Required: {$quantityToDeduct}, Available: {$totalAvailable}");
            }

            foreach ($batches as $batch) {
                if ($remainingToDeduct <= 0) {
                    break;
                }

                $deductFromBatch = min($batch->remaining_quantity, $remainingToDeduct);
                
                $batch->remaining_quantity -= $deductFromBatch;
                $batch->save();

                StockMovement::create([
                    'medicine_id' => $medicineId,
                    'medicine_batch_id' => $batch->id,
                    'movement_type' => 'out',
                    'quantity' => $deductFromBatch,
                    'reference_type' => $referenceType,
                    'reference_id' => $referenceId,
                    'notes' => $notes,
                    'created_by' => $userId ?? auth()->id(),
                ]);

                $remainingToDeduct -= $deductFromBatch;
            }

            return true;
        });
    }

    /**
     * Get current total stock for a medicine.
     */
    public function getTotalStock(int $medicineId)
    {
        return MedicineBatch::where('medicine_id', $medicineId)->sum('remaining_quantity');
    }
}
