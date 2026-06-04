<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ErrorLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ErrorLogController extends Controller
{
    public function index(Request $request)
    {
        $severity = $request->query('severity');
        $query = ErrorLog::with('user')->latest();

        if (in_array($severity, ['critical', 'warning', 'info'], true)) {
            $query->where('severity', $severity);
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Logs/Error', [
            'logs' => $logs,
            'filters' => [
                'severity' => $severity,
            ],
            'summary' => [
                'critical' => ErrorLog::where('severity', 'critical')->count(),
                'warning' => ErrorLog::where('severity', 'warning')->count(),
                'info' => ErrorLog::where('severity', 'info')->count(),
            ],
        ]);
    }
}
