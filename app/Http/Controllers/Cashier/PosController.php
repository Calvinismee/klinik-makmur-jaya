<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Category;
use App\Services\CheckoutService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Session;

class PosController extends Controller
{
    private $sessionKey = 'pos_cart';
    protected $checkoutService;
    protected $stockService;

    public function __construct(CheckoutService $checkoutService, StockService $stockService)
    {
        $this->checkoutService = $checkoutService;
        $this->stockService = $stockService;
    }

    public function index(Request $request)
    {
        $query = Medicine::with('category')->where('is_active', true);

        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        $medicines = $query->paginate(12)->withQueryString();
        $cart = Session::get($this->sessionKey, []);

        // Attach stock to medicines to help cashier
        $medicines->getCollection()->transform(function ($medicine) {
            $medicine->available_stock = $this->stockService->getTotalStock($medicine->id);
            return $medicine;
        });

        $subtotal = 0;
        foreach ($cart as &$item) {
            $availableStock = $this->stockService->getTotalStock($item['id']);
            $item['available_stock'] = $availableStock;
            $item['in_stock'] = $availableStock >= $item['quantity'];
            $subtotal += $item['price'] * $item['quantity'];
        }

        return Inertia::render('Cashier/POS/Index', [
            'medicines' => $medicines,
            'cart' => array_values($cart),
            'subtotal' => $subtotal,
            'filters' => $request->only(['search']),
        ]);
    }

    public function addToCart(Request $request)
    {
        $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $availableStock = $this->stockService->getTotalStock($request->medicine_id);
        $cart = Session::get($this->sessionKey, []);
        $currentQty = isset($cart[$request->medicine_id]) ? $cart[$request->medicine_id]['quantity'] : 0;
        
        if ($availableStock < ($currentQty + $request->quantity)) {
            return back()->withErrors(['message' => 'Insufficient stock.']);
        }

        $medicine = Medicine::find($request->medicine_id);

        if ($medicine->requires_prescription) {
            return back()->withErrors(['message' => "{$medicine->name} memerlukan resep. Harap pelanggan melakukan pemesanan via sistem untuk verifikasi Apoteker."]);
        }

        if (isset($cart[$medicine->id])) {
            $cart[$medicine->id]['quantity'] += $request->quantity;
        } else {
            $cart[$medicine->id] = [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'price' => $medicine->price,
                'quantity' => $request->quantity,
                'requires_prescription' => $medicine->requires_prescription,
            ];
        }

        Session::put($this->sessionKey, $cart);

        return back();
    }

    public function updateCart(Request $request)
    {
        $request->validate([
            'medicine_id' => 'required',
            'quantity' => 'required|integer|min:0',
        ]);

        $cart = Session::get($this->sessionKey, []);

        if (isset($cart[$request->medicine_id])) {
            if ($request->quantity <= 0) {
                unset($cart[$request->medicine_id]);
            } else {
                $availableStock = $this->stockService->getTotalStock($request->medicine_id);
                if ($availableStock < $request->quantity) {
                    return back()->withErrors(['message' => 'Insufficient stock.']);
                }
                $cart[$request->medicine_id]['quantity'] = $request->quantity;
            }
            Session::put($this->sessionKey, $cart);
        }

        return back();
    }

    public function checkout(Request $request)
    {
        $cart = Session::get($this->sessionKey, []);

        try {
            $order = $this->checkoutService->processOfflineCheckout(auth()->id(), $cart, $request->only('notes'));
            Session::forget($this->sessionKey);
            return back()->with('success', "Order {$order->order_number} completed successfully!");
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}
