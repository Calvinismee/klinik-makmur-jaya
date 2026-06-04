<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\MidtransPaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    protected $cartService;
    protected $checkoutService;
    protected $midtransPaymentService;

    public function __construct(CartService $cartService, CheckoutService $checkoutService, MidtransPaymentService $midtransPaymentService)
    {
        $this->cartService = $cartService;
        $this->checkoutService = $checkoutService;
        $this->midtransPaymentService = $midtransPaymentService;
    }

    public function index()
    {
        $cart = $this->cartService->getCart();

        if (empty($cart)) {
            return redirect()->route('customer.catalog.index');
        }

        $subtotal = $this->cartService->getSubtotal();
        $hasPrescriptionItems = false;
        foreach ($cart as $item) {
            if ($item['requires_prescription']) {
                $hasPrescriptionItems = true;
                break;
            }
        }

        return Inertia::render('Customer/Checkout/Index', [
            'cart' => array_values($cart),
            'subtotal' => $subtotal,
            'hasPrescriptionItems' => $hasPrescriptionItems,
        ]);
    }

    public function store(Request $request)
    {
        $cart = $this->cartService->getCart();
        $hasPrescriptionItems = false;
        foreach ($cart as $item) {
            if ($item['requires_prescription']) {
                $hasPrescriptionItems = true;
                break;
            }
        }

        $rules = [
            'notes' => 'nullable|string',
        ];

        if ($hasPrescriptionItems) {
            $rules['prescription_image'] = 'required|image|max:5120'; // max 5MB
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('prescription_image')) {
            $validated['prescription_image'] = $request->file('prescription_image')->store('prescriptions', 'public');
        }

        try {
            $order = $this->checkoutService->processCheckout(auth()->id(), $validated);

            if ($order->order_status === 'waiting_payment') {
                $this->midtransPaymentService->createSnapTransaction($order);

                return redirect()
                    ->route('customer.orders.show', ['order' => $order->id, 'pay' => 1])
                    ->with('success', 'Pesanan dibuat. Silakan lanjutkan pembayaran.');
            }

            return redirect()->route('customer.orders.show', $order->id)->with('success', 'Order created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}
