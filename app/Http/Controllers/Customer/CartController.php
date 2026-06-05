<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    protected $cartService;

    protected $stockService;

    public function __construct(CartService $cartService, StockService $stockService)
    {
        $this->cartService = $cartService;
        $this->stockService = $stockService;
    }

    public function index()
    {
        $cart = $this->cartService->getCart();
        $subtotal = $this->cartService->getSubtotal();

        // Check stock availability
        foreach ($cart as &$item) {
            $availableStock = $this->stockService->getTotalStock($item['id']);
            $item['available_stock'] = $availableStock;
            $item['in_stock'] = $availableStock >= $item['quantity'];
        }

        return Inertia::render('Customer/Cart/Index', [
            'cart' => array_values($cart),
            'subtotal' => $subtotal,
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $availableStock = $this->stockService->getTotalStock($request->medicine_id);

        $currentCart = $this->cartService->getCart();
        $currentQty = isset($currentCart[$request->medicine_id]) ? $currentCart[$request->medicine_id]['quantity'] : 0;

        if ($availableStock < ($currentQty + $request->quantity)) {
            return back()->withErrors(['message' => 'Insufficient stock.']);
        }

        $this->cartService->addToCart($request->medicine_id, $request->quantity);

        return back()->with('success', 'Medicine added to cart.');
    }

    public function update(Request $request)
    {
        $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:0',
        ]);

        if ($request->quantity > 0) {
            $availableStock = $this->stockService->getTotalStock($request->medicine_id);
            if ($availableStock < $request->quantity) {
                return back()->withErrors(['message' => 'Insufficient stock for requested quantity.']);
            }
        }

        $this->cartService->updateQuantity($request->medicine_id, $request->quantity);

        return back()->with('success', 'Cart updated.');
    }

    public function remove(Request $request)
    {
        $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
        ]);

        $this->cartService->removeFromCart($request->medicine_id);

        return back()->with('success', 'Item removed from cart.');
    }
}
