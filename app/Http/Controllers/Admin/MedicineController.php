<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class MedicineController extends Controller
{
    public function index()
    {
        $medicines = Medicine::with(['category', 'supplier'])->withSum('batches', 'remaining_quantity')->latest()->get();
        $categories = Category::all();
        $suppliers = Supplier::all();

        return Inertia::render('Admin/Medicines/Index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'code' => 'required|string|unique:medicines,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'composition' => 'nullable|string',
            'dosage' => 'nullable|string',
            'side_effects' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'requires_prescription' => 'boolean',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('medicines', 'public');
        }

        Medicine::create($validated);
        return back()->with('success', 'Medicine created successfully.');
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'code' => 'required|string|unique:medicines,code,' . $medicine->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'composition' => 'nullable|string',
            'dosage' => 'nullable|string',
            'side_effects' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'requires_prescription' => 'boolean',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            if ($medicine->image) {
                Storage::disk('public')->delete($medicine->image);
            }
            $validated['image'] = $request->file('image')->store('medicines', 'public');
        }

        $medicine->update($validated);
        return back()->with('success', 'Medicine updated successfully.');
    }

    public function destroy(Medicine $medicine)
    {
        if ($medicine->image) {
            Storage::disk('public')->delete($medicine->image);
        }
        $medicine->delete();
        return back()->with('success', 'Medicine deleted successfully.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,xls,xlsx'
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\MedicinesImport, $request->file('file'));
            return back()->with('success', 'Medicines imported successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Error importing file: ' . $e->getMessage()]);
        }
    }
}
