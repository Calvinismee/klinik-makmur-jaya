<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\ErrorLog;
use App\Models\User;
use App\Notifications\AppErrorNotification;
use Illuminate\Support\Facades\Request;
use Throwable;

class AuditLogService
{
    public static function log(string $action, string $module, ?string $description = null, ?int $userId = null)
    {
        try {
            AuditLog::create([
                'user_id' => $userId ?? auth()->id(),
                'action' => $action,
                'module' => $module,
                'description' => $description,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        } catch (\Exception $e) {
            // Silently fail if log fails so it doesn't break the app, or log to file
            \Log::error('Failed to write audit log: '.$e->getMessage());
        }
    }

    public static function logException(Throwable $exception): ?ErrorLog
    {
        try {
            $errorLog = ErrorLog::create([
                'severity' => self::severity($exception),
                'message' => $exception->getMessage() ?: $exception::class,
                'file' => $exception->getFile(),
                'line' => (string) $exception->getLine(),
                'trace_summary' => collect($exception->getTrace())->take(5)->map(function (array $trace) {
                    return ($trace['file'] ?? 'unknown').':'.($trace['line'] ?? '-').' '.($trace['function'] ?? '');
                })->implode("\n"),
                'user_id' => auth()->id(),
                'url' => request()?->fullUrl(),
                'method' => request()?->method(),
            ]);

            User::role('admin')->get()->each(function (User $admin) use ($errorLog) {
                $admin->notify(new AppErrorNotification($errorLog));
            });

            return $errorLog;
        } catch (Throwable $loggingException) {
            \Log::error('Failed to write application error log: '.$loggingException->getMessage());

            return null;
        }
    }

    private static function severity(Throwable $exception): string
    {
        $class = $exception::class;

        if (str_contains($class, 'Authentication') || str_contains($class, 'Authorization') || str_contains($class, 'Validation')) {
            return 'info';
        }

        if (str_contains($class, 'NotFound') || str_contains($class, 'TokenMismatch')) {
            return 'warning';
        }

        return 'critical';
    }
}
