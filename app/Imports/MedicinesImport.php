<?php

namespace App\Imports;

use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MedicinesImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Simple import mapping
        // Assumes category_id and supplier_id are provided, or we can look up by name
        
        $category = isset($row['category']) ? Category::firstOrCreate(['name' => $row['category']]) : null;
        $supplier = isset($row['supplier']) ? Supplier::firstOrCreate(['name' => $row['supplier']]) : null;

        return new Medicine([
            'category_id' => $category ? $category->id : null,
            'supplier_id' => $supplier ? $supplier->id : null,
            'name' => $row['name'],
            'code' => $row['code'],
            'description' => $row['description'] ?? null,
            'price' => $row['price'] ?? 0,
            'composition' => $row['composition'] ?? null,
            'dosage' => $row['dosage'] ?? null,
            'requires_prescription' => filter_var($row['requires_prescription'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'is_active' => filter_var($row['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
