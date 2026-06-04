<?php

namespace App\Http\Controllers\Apoteker;

use App\Http\Controllers\Controller;
use App\Models\MedicineBatch;
use App\Models\Medicine;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineBatchController extends Controller
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index()
    {
        $batches = MedicineBatch::with('medicine')->latest()->get();
        $medicines = Medicine::where('is_active', true)->get();

        return Inertia::render('Pharmacist/Batches/Index', [
            'batches' => $batches,
            'medicines' => $medicines,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'batch_number' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'expired_at' => 'required|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'received_at' => 'nullable|date',
        ]);

        $this->stockService->addBatch($validated);

        return back()->with('success', 'Medicine batch added successfully.');
    }
}
