<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicine::with('category')->withSum('batches', 'remaining_quantity')->where('is_active', true);

        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        $medicines = $query->paginate(12)->withQueryString();
        $categories = Category::all();

        return Inertia::render('Customer/Catalog/Index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function show(Medicine $medicine)
    {
        if (!$medicine->is_active) {
            abort(404);
        }

        $medicine->load(['category', 'supplier']);
        $medicine->loadSum('batches', 'remaining_quantity');

        return Inertia::render('Customer/Catalog/Show', [
            'medicine' => $medicine,
        ]);
    }
}
