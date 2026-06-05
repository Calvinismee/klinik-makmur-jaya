<?php

namespace App\Imports;

use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MedicinesImport implements ToModel, WithHeadingRow, WithChunkReading
{
    public function model(array $row)
    {
        $name = trim((string) ($row['name'] ?? $row['nama'] ?? $row['medicine_name'] ?? ''));

        if ($name === '') {
            return null;
        }

        $code = trim((string) ($row['code'] ?? $row['kode'] ?? ''));
        if ($code === '') {
            $code = 'MED-' . strtoupper(Str::random(6));
        }

        if (Medicine::where('code', $code)->exists()) {
            return null;
        }

        $categoryName = trim((string) ($row['category'] ?? $row['kategori'] ?? ''));
        $supplierName = trim((string) ($row['supplier'] ?? ''));

        $category = $categoryName !== '' ? Category::firstOrCreate(['name' => $categoryName]) : null;
        $supplier = $supplierName !== '' ? Supplier::firstOrCreate(['name' => $supplierName]) : null;

        return new Medicine([
            'category_id' => $category ? $category->id : null,
            'supplier_id' => $supplier ? $supplier->id : null,
            'name' => $name,
            'code' => $code,
            'description' => $row['description'] ?? $row['deskripsi'] ?? null,
            'price' => $row['price'] ?? $row['harga'] ?? 0,
            'composition' => $row['composition'] ?? $row['komposisi'] ?? null,
            'dosage' => $row['dosage'] ?? $row['dosis'] ?? null,
            'requires_prescription' => filter_var($row['requires_prescription'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'is_active' => filter_var($row['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    public function chunkSize(): int
    {
        return 250;
    }
}
