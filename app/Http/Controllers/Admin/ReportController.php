<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function dashboard()
    {
        // 1. Total Sales Today & This Month
        $todaySales = Order::where('payment_status', 'paid')
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');

        $monthSales = Order::where('payment_status', 'paid')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('total_amount');

        // 2. Orders count
        $pendingOrders = Order::where('order_status', 'waiting_payment')->count();
        $completedOrders = Order::where('order_status', 'completed')->count();

        // 3. Top 5 Medicines
        $topMedicines = DB::table('order_items')
            ->join('medicines', 'order_items.medicine_id', '=', 'medicines.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->select('medicines.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('medicines.id', 'medicines.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $allMedicinesStock = Medicine::select('medicines.id', 'medicines.name', 'medicines.code', 'medicines.minimum_stock')
            ->selectRaw('COALESCE(SUM(medicine_batches.remaining_quantity), 0) as total_stock')
            ->leftJoin('medicine_batches', 'medicines.id', '=', 'medicine_batches.medicine_id')
            ->groupBy('medicines.id', 'medicines.name', 'medicines.code', 'medicines.minimum_stock')
            ->orderByDesc('total_stock')
            ->get();

        // 4. Low Stock Medicines (Total stock < configured minimum threshold, fallback 20)
        $lowStockMedicines = $allMedicinesStock
            ->filter(fn ($medicine) => (int) $medicine->total_stock < (int) ($medicine->minimum_stock ?: 20))
            ->values();

        // 5. Expiring Batches (Expires within 30 days)
        $expiringBatches = MedicineBatch::with('medicine')
            ->where('remaining_quantity', '>', 0)
            ->where('expired_at', '<=', Carbon::now()->addDays(30))
            ->orderBy('expired_at', 'asc')
            ->get();

        $stockChart = $allMedicinesStock
            ->sortBy('total_stock')
            ->take(8)
            ->map(fn ($medicine) => [
                'id' => $medicine->id,
                'label' => $medicine->name,
                'code' => $medicine->code,
                'stock' => (int) $medicine->total_stock,
                'minimumStock' => (int) ($medicine->minimum_stock ?: 20),
            ])
            ->values();

        $stockSummary = [
            'totalMedicines' => $allMedicinesStock->count(),
            'totalUnits' => (int) $allMedicinesStock->sum('total_stock'),
            'critical' => $lowStockMedicines->count(),
            'empty' => $allMedicinesStock->filter(fn ($medicine) => (int) $medicine->total_stock <= 0)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'todaySales' => $todaySales,
                'monthSales' => $monthSales,
                'pendingOrders' => $pendingOrders,
                'completedOrders' => $completedOrders,
            ],
            'topMedicines' => $topMedicines,
            'expiringBatches' => $expiringBatches,
            'allMedicinesStock' => $allMedicinesStock,
            'chart' => [
                'periods' => [
                    'daily' => $this->buildSalesSeries('daily'),
                    'weekly' => $this->buildSalesSeries('weekly'),
                    'monthly' => $this->buildSalesSeries('monthly'),
                ],
                'stock' => [
                    'summary' => $stockSummary,
                    'items' => $stockChart,
                ],
            ],
        ]);
    }

    private function buildSalesSeries(string $period): array
    {
        $items = [];

        $ranges = match ($period) {
            'weekly' => collect(range(5, 0))->map(function (int $week) {
                $start = Carbon::today()->subWeeks($week)->startOfWeek();
                $end = (clone $start)->endOfWeek();

                return [
                    'start' => $start,
                    'end' => $end,
                    'label' => $start->format('d M').' - '.$end->format('d M'),
                ];
            }),
            'monthly' => collect(range(5, 0))->map(function (int $month) {
                $start = Carbon::today()->subMonths($month)->startOfMonth();
                $end = (clone $start)->endOfMonth();

                return [
                    'start' => $start,
                    'end' => $end,
                    'label' => $start->format('M Y'),
                ];
            }),
            default => collect(range(6, 0))->map(function (int $day) {
                $date = Carbon::today()->subDays($day);

                return [
                    'start' => (clone $date)->startOfDay(),
                    'end' => (clone $date)->endOfDay(),
                    'label' => $date->format('M d'),
                ];
            }),
        };

        foreach ($ranges as $range) {
            $baseQuery = Order::where('payment_status', 'paid')
                ->whereBetween('created_at', [$range['start'], $range['end']]);

            $offlineQuery = (clone $baseQuery)->where('order_number', 'like', 'POS-%');
            $onlineQuery = (clone $baseQuery)->where('order_number', 'not like', 'POS-%');

            $items[] = [
                'date' => $range['start']->toDateString(),
                'label' => $range['label'],
                'total' => (float) (clone $baseQuery)->sum('total_amount'),
                'transactions' => (clone $baseQuery)->count(),
                'offlineTotal' => (float) (clone $offlineQuery)->sum('total_amount'),
                'offlineTransactions' => (clone $offlineQuery)->count(),
                'onlineTotal' => (float) (clone $onlineQuery)->sum('total_amount'),
                'onlineTransactions' => (clone $onlineQuery)->count(),
            ];
        }

        return $items;
    }
}
