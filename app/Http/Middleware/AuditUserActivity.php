<?php

namespace App\Http\Middleware;

use App\Services\AuditLogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->user()?->id;
        $response = $next($request);

        if ($userId && $this->shouldAudit($request, $response)) {
            AuditLogService::log(
                $request->method(),
                $this->moduleName($request),
                $this->description($request, $response),
                $userId
            );
        }

        return $response;
    }

    private function shouldAudit(Request $request, Response $response): bool
    {
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return false;
        }

        if ($request->is('notifications/read-all')) {
            return false;
        }

        if ($request->route()?->getName() === 'logout') {
            return false;
        }

        return $response->getStatusCode() < 500;
    }

    private function moduleName(Request $request): string
    {
        return $request->route()?->getName()
            ?? trim($request->path(), '/')
            ?: 'home';
    }

    private function description(Request $request, Response $response): string
    {
        $payload = collect($request->except([
            'password',
            'password_confirmation',
            'current_password',
            '_token',
            '_method',
            'file',
            'image',
            'prescription_image',
        ]))->map(fn ($value) => is_scalar($value) ? $value : '[complex]');

        $summary = $payload->isEmpty()
            ? 'No request payload.'
            : 'Payload: ' . $payload->take(8)->map(fn ($value, $key) => "{$key}={$value}")->implode(', ');

        return "{$request->method()} {$request->path()} returned {$response->getStatusCode()}. {$summary}";
    }
}
