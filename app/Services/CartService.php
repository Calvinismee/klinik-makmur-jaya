<?php

namespace App\Services;

use App\Models\Medicine;
use Illuminate\Support\Facades\Session;

class CartService
{
    private $sessionKey = 'cart_items';

    public function getCart()
    {
        return Session::get($this->sessionKey, []);
    }

    public function addToCart(int $medicineId, int $quantity)
    {
        $cart = $this->getCart();
        $medicine = Medicine::findOrFail($medicineId);

        if (isset($cart[$medicineId])) {
            $cart[$medicineId]['quantity'] += $quantity;
        } else {
            $cart[$medicineId] = [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'price' => $medicine->price,
                'quantity' => $quantity,
                'image' => $medicine->image,
                'requires_prescription' => $medicine->requires_prescription,
            ];
        }

        Session::put($this->sessionKey, $cart);

        return $cart;
    }

    public function updateQuantity(int $medicineId, int $quantity)
    {
        $cart = $this->getCart();

        if (isset($cart[$medicineId])) {
            if ($quantity <= 0) {
                unset($cart[$medicineId]);
            } else {
                $cart[$medicineId]['quantity'] = $quantity;
            }
            Session::put($this->sessionKey, $cart);
        }

        return $cart;
    }

    public function removeFromCart(int $medicineId)
    {
        $cart = $this->getCart();

        if (isset($cart[$medicineId])) {
            unset($cart[$medicineId]);
            Session::put($this->sessionKey, $cart);
        }

        return $cart;
    }

    public function clearCart()
    {
        Session::forget($this->sessionKey);
    }

    public function getSubtotal()
    {
        $cart = $this->getCart();
        $subtotal = 0;

        foreach ($cart as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        return $subtotal;
    }
}
