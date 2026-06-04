<?php

namespace App\Http\Controllers\Apoteker;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    public function index()
    {
        $movements = StockMovement::with(['medicine', 'batch'])->latest()->paginate(20);

        return Inertia::render('Pharmacist/Movements/Index', [
            'movements' => $movements,
        ]);
    }
}
