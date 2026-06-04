<?php

namespace App\Http\Controllers;

use App\Services\MidtransPaymentService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MidtransWebhookController extends Controller
{
    public function __construct(
        private MidtransPaymentService $midtransPaymentService,
        private OrderService $orderService
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

        $this->orderService->applyMidtransNotification($orderId, $payload);

        return response()->json(['message' => 'Notification processed.']);
    }
}
