<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\ReportJob;
use App\Models\User;
use App\Notifications\SystemJobStatusNotification;
use App\Services\AuditLogService;
use App\Services\NotificationDispatchService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GenerateSalesReportPdfJob implements ShouldQueue
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
        $reportJobId = $this->reportJobId ?? null;

        if (!$reportJobId) {
            $reportJob = ReportJob::create([
                'user_id' => auth()->id() ?? User::role('admin')->value('id') ?? User::value('id'),
                'type' => 'sales_pdf',
                'status' => 'queued',
                'progress' => 0,
                'message' => 'Job lama dilanjutkan setelah update sistem.',
            ]);
            $this->reportJobId = $reportJob->id;
        } else {
            $reportJob = ReportJob::findOrFail($reportJobId);
        }
        $user = User::find($reportJob->user_id);
        $filename = 'sales-report-' . now()->format('Ymd-His') . '-' . $reportJob->user_id . '.pdf';
        $path = "reports/{$filename}";

        try {
            $this->updateProgress($reportJob, 'processing', 10, 'Menyiapkan data laporan.', ['started_at' => now()]);

            $data = self::buildReportData();

            $this->updateProgress($reportJob, 'processing', 45, 'Membuat visual PDF.');

            $pdf = Pdf::loadView('reports.sales', $data)->setPaper('a4', 'landscape');

            $this->updateProgress($reportJob, 'processing', 75, 'Menyimpan file laporan.');

            Storage::disk('local')->put($path, $pdf->output());

            $this->updateProgress($reportJob, 'completed', 100, 'Laporan PDF siap diunduh.', [
                'file_path' => $path,
                'file_name' => $filename,
                'finished_at' => now(),
            ]);

            AuditLogService::log('REPORT_GENERATED', 'admin.orders.export-pdf-background', "Sales PDF generated: {$path}", $reportJob->user_id);

            if ($user) {
                NotificationDispatchService::sendOnce(
                    $user,
                    new SystemJobStatusNotification(
                        'Laporan PDF siap diunduh',
                        'Laporan penjualan besar selesai dibuat di background.',
                        'info',
                        route('admin.reports.download', ['filename' => $filename], false),
                        "sales_report_pdf:{$reportJob->id}"
                    ),
                    "sales_report_pdf:{$reportJob->id}"
                );
            }
        } catch (Throwable $exception) {
            $this->updateProgress($reportJob, 'failed', 100, 'Gagal membuat laporan: ' . $exception->getMessage(), [
                'finished_at' => now(),
            ]);

            AuditLogService::logException($exception);

            if ($user) {
                NotificationDispatchService::sendOnce(
                    $user,
                    new SystemJobStatusNotification(
                        'Generate laporan PDF gagal',
                        'Sistem gagal membuat laporan PDF: ' . $exception->getMessage(),
                        'critical',
                        '/admin/orders',
                        "sales_report_pdf:failed:{$reportJob->id}"
                    ),
                    "sales_report_pdf:failed:{$reportJob->id}"
                );
            }

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

    public static function buildReportData(): array
    {
        $orders = Order::with(['user', 'items.medicine'])
            ->where('payment_status', 'paid')
            ->latest()
            ->get();

        $dailySales = $orders
            ->groupBy(fn (Order $order) => $order->created_at->format('Y-m-d'))
            ->map(fn ($items, $date) => [
                'date' => $date,
                'total' => $items->sum('total_amount'),
                'transactions' => $items->count(),
            ])
            ->values();

        $maxDailySales = max((float) $dailySales->max('total'), 1);

        return [
            'generatedAt' => now(),
            'orders' => $orders,
            'summary' => [
                'total_sales' => $orders->sum('total_amount'),
                'total_orders' => $orders->count(),
                'online_orders' => $orders->filter(fn (Order $order) => !str_starts_with($order->order_number, 'POS-'))->count(),
                'offline_orders' => $orders->filter(fn (Order $order) => str_starts_with($order->order_number, 'POS-'))->count(),
            ],
            'dailySales' => $dailySales,
            'maxDailySales' => $maxDailySales,
        ];
    }

}
