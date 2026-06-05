<?php

namespace App\Jobs;

use App\Imports\MedicinesImport;
use App\Models\User;
use App\Notifications\SystemJobStatusNotification;
use App\Services\AuditLogService;
use App\Services\NotificationDispatchService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class ImportMedicinesJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public function __construct(
        private string $path,
        private int $userId
    ) {
    }

    public function handle(): void
    {
        $user = User::find($this->userId);
        $fullPath = Storage::disk('local')->path($this->path);

        try {
            Excel::import(new MedicinesImport, $fullPath);
            Storage::disk('local')->delete($this->path);

            AuditLogService::log('IMPORT_COMPLETED', 'admin.medicines.import', "Medicine import finished for {$this->path}.", $this->userId);

            if ($user) {
                NotificationDispatchService::sendOnce(
                    $user,
                    new SystemJobStatusNotification(
                        'Import obat selesai',
                        'File obat berhasil diproses dan katalog sudah diperbarui.',
                        'info',
                        '/admin/medicines',
                        "medicine_import:{$this->path}:completed"
                    ),
                    "medicine_import:{$this->path}:completed"
                );
            }
        } catch (Throwable $exception) {
            AuditLogService::logException($exception);

            if ($user) {
                NotificationDispatchService::sendOnce(
                    $user,
                    new SystemJobStatusNotification(
                        'Import obat gagal',
                        'File obat gagal diproses: ' . $exception->getMessage(),
                        'critical',
                        '/admin/medicines',
                        "medicine_import:{$this->path}:failed"
                    ),
                    "medicine_import:{$this->path}:failed"
                );
            }

            throw $exception;
        }
    }
}
