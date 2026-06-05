<?php

namespace App\Jobs;

use App\Exports\OrdersExport;
use App\Models\ReportJob;
use App\Models\User;
use App\Notifications\SystemJobStatusNotification;
use App\Services\AuditLogService;
use App\Services\NotificationDispatchService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class GenerateSalesReportExcelJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    private int $reportJobId;

    public function __construct(int $reportJobId)
    {
        $this->reportJobId = $reportJobId;
    }

    public function handle(): void
    {
        $reportJob = ReportJob::findOrFail($this->reportJobId);
        $user = User::find($reportJob->user_id);
        $filename = 'sales-report-'.now()->format('Ymd-His').'-'.$reportJob->user_id.'.xlsx';
        $path = "reports/{$filename}";

        try {
            $this->updateProgress($reportJob, 'processing', 15, 'Menyiapkan data Excel.', ['started_at' => now()]);
            $this->updateProgress($reportJob, 'processing', 55, 'Membuat workbook Excel.');

            Excel::store(new OrdersExport, $path, 'local');

            $this->updateProgress($reportJob, 'completed', 100, 'Laporan Excel siap diunduh.', [
                'file_path' => $path,
                'file_name' => $filename,
                'finished_at' => now(),
            ]);

            AuditLogService::log('REPORT_GENERATED', 'admin.orders.export-excel-background', "Sales Excel generated: {$path}", $reportJob->user_id);

            if ($user) {
                NotificationDispatchService::sendOnce(
                    $user,
                    new SystemJobStatusNotification(
                        'Laporan Excel siap diunduh',
                        'Laporan penjualan Excel selesai dibuat di background.',
                        'info',
                        route('admin.reports.download', ['filename' => $filename], false),
                        "sales_report_excel:{$reportJob->id}"
                    ),
                    "sales_report_excel:{$reportJob->id}"
                );
            }
        } catch (Throwable $exception) {
            $this->updateProgress($reportJob, 'failed', 100, 'Gagal membuat laporan Excel: '.$exception->getMessage(), [
                'finished_at' => now(),
            ]);

            AuditLogService::logException($exception);
            throw $exception;
        }
    }

    private function updateProgress(ReportJob $reportJob, string $status, int $progress, string $message, array $extra = []): void
    {
        $reportJob->forceFill([
            'status' => $status,
            'progress' => min(max($progress, 0), 100),
            'message' => $message,
            ...$extra,
        ])->save();
    }
}
