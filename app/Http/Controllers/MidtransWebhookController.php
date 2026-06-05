<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessMidtransNotificationJob;
use App\Services\MidtransPaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MidtransWebhookController extends Controller
{
    public function __construct(
        private MidtransPaymentService $midtransPaymentService
    ) {
    }

    public function handle(Request $request)
    {
        $payload = $request->all();

        if (!$this->midtransPaymentService->validSignature($payload)) {
            return response()->json(['message' => 'Invalid signature.'], Response::HTTP_FORBIDDEN);
        }

        $orderId = $payload['order_id'] ?? null;

        if (!$orderId) {
            return response()->json(['message' => 'Missing order_id.'], Response::HTTP_BAD_REQUEST);
        }

        ProcessMidtransNotificationJob::dispatch($orderId, $payload);

        return response()->json(['message' => 'Notification queued.']);
    }
}
