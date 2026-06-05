<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $categories = [
            ['name' => 'Analgesik', 'description' => 'Obat pereda nyeri'],
            ['name' => 'Antibiotik', 'description' => 'Obat untuk infeksi bakteri'],
            ['name' => 'Vitamin', 'description' => 'Suplemen dan vitamin'],
            ['name' => 'Obat Bebas', 'description' => 'Obat yang bisa dibeli tanpa resep dokter'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['name' => $cat['name']], $cat);
        }

        // 2. Suppliers
        $suppliers = [
            [
                'name' => 'PT. Kimia Farma Trading',
                'phone' => '081234567890',
                'address' => 'Jl. Kebon Jeruk No. 12, Jakarta',
                'email' => 'sales@kimiafarma.test',
            ],
            [
                'name' => 'PT. Dexa Medica',
                'phone' => '089876543210',
                'address' => 'Jl. Merdeka No. 45, Bandung',
                'email' => 'info@dexamedica.test',
            ],
        ];

        foreach ($suppliers as $sup) {
            Supplier::firstOrCreate(['name' => $sup['name']], $sup);
        }

        // 3. Medicines
        $analgesik = Category::where('name', 'Analgesik')->first();
        $antibiotik = Category::where('name', 'Antibiotik')->first();
        $vitamin = Category::where('name', 'Vitamin')->first();

        $supplier1 = Supplier::where('name', 'PT. Kimia Farma Trading')->first();
        $supplier2 = Supplier::where('name', 'PT. Dexa Medica')->first();

        $medicines = [
            [
                'category_id' => $analgesik->id,
                'supplier_id' => $supplier1->id,
                'name' => 'Paracetamol 500mg',
                'code' => 'MED-001',
                'description' => 'Obat pereda demam dan nyeri ringan.',
                'price' => 5000,
                'is_active' => true,
                'requires_prescription' => false,
                'image' => 'medicines/med_001.svg',
            ],
            [
                'category_id' => $antibiotik->id,
                'supplier_id' => $supplier2->id,
                'name' => 'Amoxicillin 500mg',
                'code' => 'MED-002',
                'description' => 'Antibiotik spektrum luas.',
                'price' => 12000,
                'is_active' => true,
                'requires_prescription' => true,
                'image' => 'medicines/med_002.svg',
            ],
            [
                'category_id' => $vitamin->id,
                'supplier_id' => $supplier1->id,
                'name' => 'Vitamin C 1000mg',
                'code' => 'MED-003',
                'description' => 'Suplemen vitamin C untuk daya tahan tubuh.',
                'price' => 25000,
                'is_active' => true,
                'requires_prescription' => false,
                'image' => 'medicines/med_003.svg',
            ],
            // Low stock medicine
            [
                'category_id' => $analgesik->id,
                'supplier_id' => $supplier2->id,
                'name' => 'Ibuprofen 400mg',
                'code' => 'MED-004',
                'description' => 'Obat antiinflamasi nonsteroid.',
                'price' => 8000,
                'is_active' => true,
                'requires_prescription' => true,
                'image' => 'medicines/med_004.svg',
            ],
        ];

        foreach ($medicines as $med) {
            Medicine::firstOrCreate(['code' => $med['code']], $med);
        }

        // 4. Batches & Stock
        $apoteker = User::role('apoteker')->first();

        $med1 = Medicine::where('code', 'MED-001')->first();
        $med2 = Medicine::where('code', 'MED-002')->first();
        $med3 = Medicine::where('code', 'MED-003')->first();
        $med4 = Medicine::where('code', 'MED-004')->first();

        $batches = [
            [
                'medicine_id' => $med1->id,
                'batch_number' => 'BATCH-A001',
                'quantity' => 100,
                'remaining_quantity' => 100,
                'expired_at' => Carbon::now()->addYear(),
            ],
            [
                'medicine_id' => $med2->id,
                'batch_number' => 'BATCH-B001',
                'quantity' => 50,
                'remaining_quantity' => 50,
                'expired_at' => Carbon::now()->addMonths(6),
            ],
            // Expiring batch (next 30 days)
            [
                'medicine_id' => $med3->id,
                'batch_number' => 'BATCH-C001',
                'quantity' => 200,
                'remaining_quantity' => 200,
                'expired_at' => Carbon::now()->addDays(15),
            ],
            // Low stock batch (< 20)
            [
                'medicine_id' => $med4->id,
                'batch_number' => 'BATCH-D001',
                'quantity' => 10,
                'remaining_quantity' => 10,
                'expired_at' => Carbon::now()->addYear(),
            ],
        ];

        foreach ($batches as $batch) {
            $createdBatch = MedicineBatch::firstOrCreate(
                ['batch_number' => $batch['batch_number']],
                $batch
            );

            // Create initial stock movement
            if ($createdBatch->wasRecentlyCreated) {
                StockMovement::create([
                    'medicine_id' => $createdBatch->medicine_id,
                    'medicine_batch_id' => $createdBatch->id,
                    'created_by' => $apoteker->id ?? 1,
                    'movement_type' => 'in',
                    'quantity' => $createdBatch->quantity,
                    'reference_type' => 'initial_seeding',
                    'notes' => 'Initial stock seeding',
                ]);
            }
        }
    }
}
