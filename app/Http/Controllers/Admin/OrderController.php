<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateSalesReportExcelJob;
use App\Jobs\GenerateSalesReportPdfJob;
use App\Models\Order;
use App\Models\ReportJob;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\OrdersExport;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['user', 'items.medicine'])->latest()->get();
        $reportJobs = ReportJob::where('user_id', auth()->id())
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (ReportJob $reportJob) => $this->serializeReportJob($reportJob));

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'reportJobs' => $reportJobs,
        ]);
    }

    public function export()
    {
        return Excel::download(new OrdersExport, 'orders.xlsx');
    }

    public function exportPdf()
    {
        $data = GenerateSalesReportPdfJob::buildReportData();

        return Pdf::loadView('reports.sales', $data)
            ->setPaper('a4', 'landscape')
            ->download('laporan-penjualan.pdf');
    }

    public function generatePdf()
    {
        $reportJob = ReportJob::create([
            'user_id' => auth()->id(),
            'type' => 'sales_pdf',
            'status' => 'queued',
            'progress' => 0,
            'message' => 'Menunggu antrean worker.',
        ]);

        GenerateSalesReportPdfJob::dispatch($reportJob->id);

        return back()->with('success', 'Laporan PDF sedang dibuat di background. Progress bisa dilihat di panel laporan.');
    }

    public function generateExcel()
    {
        $reportJob = ReportJob::create([
            'user_id' => auth()->id(),
            'type' => 'sales_excel',
            'status' => 'queued',
            'progress' => 0,
            'message' => 'Menunggu antrean worker.',
        ]);

        GenerateSalesReportExcelJob::dispatch($reportJob->id);

        return back()->with('success', 'Laporan Excel sedang dibuat di background. Progress bisa dilihat di panel laporan.');
    }

    public function reportStatus(ReportJob $reportJob): JsonResponse
    {
        abort_unless($reportJob->user_id === auth()->id(), 403);

        return response()->json($this->serializeReportJob($reportJob->fresh()));
    }

    public function downloadReport(string $filename)
    {
        abort_unless(preg_match('/^sales-report-[A-Za-z0-9\\-]+\\.(pdf|xlsx)$/', $filename), 404);

        $path = "reports/{$filename}";
        abort_unless(Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download($path, $filename);
    }

    private function serializeReportJob(ReportJob $reportJob): array
    {
        return [
            'id' => $reportJob->id,
            'type' => $reportJob->type,
            'status' => $reportJob->status,
            'progress' => $reportJob->progress,
            'message' => $reportJob->message,
            'download_url' => $reportJob->downloadUrl(),
            'created_at' => $reportJob->created_at?->diffForHumans(),
            'finished_at' => $reportJob->finished_at?->diffForHumans(),
        ];
    }
}
