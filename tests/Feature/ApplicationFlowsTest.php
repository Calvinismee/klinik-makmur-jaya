<?php

use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Order;
use App\Models\Supplier;
use App\Models\User;
use App\Services\StockService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    Config::set('services.notifications.mail_enabled', false);
    Config::set('services.midtrans.server_key', 'Mid-server-test-key');
    Config::set('services.midtrans.client_key', 'Mid-client-test-key');
    Config::set('services.midtrans.is_production', false);
});

function userWithRole(string $role): User
{
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $user->assignRole($role);

    return $user;
}

function medicineWithStock(array $overrides = [], array $batchOverrides = []): Medicine
{
    $category = Category::create([
        'name' => 'Analgesik',
    ]);

    $supplier = Supplier::create([
        'name' => 'Supplier Test',
    ]);

    $medicine = Medicine::create([
        'category_id' => $category->id,
        'supplier_id' => $supplier->id,
        'code' => $overrides['code'] ?? 'MED-'.fake()->unique()->numberBetween(1000, 9999),
        'name' => $overrides['name'] ?? 'Paracetamol Test',
        'description' => $overrides['description'] ?? 'Obat uji',
        'composition' => $overrides['composition'] ?? 'Paracetamol',
        'dosage' => $overrides['dosage'] ?? '3x sehari',
        'side_effects' => $overrides['side_effects'] ?? null,
        'price' => $overrides['price'] ?? 10000,
        'minimum_stock' => $overrides['minimum_stock'] ?? 5,
        'requires_prescription' => $overrides['requires_prescription'] ?? false,
        'is_active' => $overrides['is_active'] ?? true,
        'image' => $overrides['image'] ?? null,
    ]);

    MedicineBatch::create([
        'medicine_id' => $medicine->id,
        'batch_number' => $batchOverrides['batch_number'] ?? 'BATCH-'.fake()->unique()->numberBetween(1000, 9999),
        'quantity' => $batchOverrides['quantity'] ?? 10,
        'remaining_quantity' => $batchOverrides['remaining_quantity'] ?? ($batchOverrides['quantity'] ?? 10),
        'expired_at' => $batchOverrides['expired_at'] ?? now()->addYear()->toDateString(),
        'purchase_price' => $batchOverrides['purchase_price'] ?? 5000,
        'received_at' => $batchOverrides['received_at'] ?? now()->toDateString(),
    ]);

    return $medicine;
}

test('auth routes users to the correct role dashboard and protects admin pages', function () {
    $admin = userWithRole('admin');
    $pasien = userWithRole('pasien');

    $this->get(route('home'))
        ->assertRedirect(route('login'));

    $this->post(route('login'), [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.dashboard'));

    $this->actingAs($pasien)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('customer registration creates a verified-pending pasien account', function () {
    $this->post(route('register'), [
        'name' => 'Pasien Baru',
        'email' => 'pasien-baru@example.test',
        'phone' => '081234567890',
        'identity_number' => '1234567890123456',
        'date_of_birth' => now()->subYears(25)->toDateString(),
        'gender' => 'male',
        'address' => 'Jalan Test Nomor 123',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertRedirect(route('verification.notice'));

    $user = User::where('email', 'pasien-baru@example.test')->firstOrFail();

    expect($user->hasRole('pasien'))->toBeTrue()
        ->and($user->email_verified_at)->toBeNull();
});

test('admin can create medicine master data', function () {
    $admin = userWithRole('admin');
    $category = Category::create(['name' => 'Antibiotik']);
    $supplier = Supplier::create(['name' => 'Supplier Admin']);

    $this->actingAs($admin)
        ->post(route('admin.medicines.store'), [
            'category_id' => $category->id,
            'supplier_id' => $supplier->id,
            'code' => 'AMOX-500',
            'name' => 'Amoxicillin 500mg',
            'description' => 'Antibiotik',
            'composition' => 'Amoxicillin',
            'dosage' => 'Sesuai resep',
            'price' => 25000,
            'minimum_stock' => 10,
            'requires_prescription' => true,
            'is_active' => true,
        ])->assertSessionHas('success');

    $this->assertDatabaseHas('medicines', [
        'code' => 'AMOX-500',
        'requires_prescription' => true,
    ]);
});

test('catalog autocomplete only returns active matching medicines', function () {
    $pasien = userWithRole('pasien');
    medicineWithStock(['code' => 'PARA-001', 'name' => 'Paracetamol Anak']);
    medicineWithStock(['code' => 'PARA-OLD', 'name' => 'Paracetamol Nonaktif', 'is_active' => false]);

    $response = $this->actingAs($pasien)
        ->getJson(route('customer.catalog.autocomplete', ['search' => 'para']));

    $response->assertOk()
        ->assertJsonFragment(['code' => 'PARA-001'])
        ->assertJsonMissing(['code' => 'PARA-OLD']);
});

test('customer cart accepts available stock and rejects excessive quantity', function () {
    $pasien = userWithRole('pasien');
    $medicine = medicineWithStock([], ['quantity' => 3]);

    $this->actingAs($pasien)
        ->post(route('customer.cart.add'), [
            'medicine_id' => $medicine->id,
            'quantity' => 2,
        ])->assertSessionHas('success');

    expect(session('cart_items')[$medicine->id]['quantity'])->toBe(2);

    $this->actingAs($pasien)
        ->post(route('customer.cart.add'), [
            'medicine_id' => $medicine->id,
            'quantity' => 2,
        ])->assertSessionHasErrors('message');
});

test('checkout creates prescription orders and notifies pharmacists', function () {
    Storage::fake('public');

    $pasien = userWithRole('pasien');
    $apoteker = userWithRole('apoteker');
    $medicine = medicineWithStock([
        'requires_prescription' => true,
        'price' => 15000,
    ]);

    $this->actingAs($pasien)
        ->post(route('customer.cart.add'), [
            'medicine_id' => $medicine->id,
            'quantity' => 1,
        ]);

    $this->actingAs($pasien)
        ->post(route('customer.checkout.store'), [
            'notes' => 'Mohon diproses',
            'prescription_image' => UploadedFile::fake()->image('resep.jpg'),
        ])->assertRedirect();

    $order = Order::where('user_id', $pasien->id)->firstOrFail();

    expect($order->order_status)->toBe('waiting_prescription_verification')
        ->and($order->prescription_status)->toBe('pending')
        ->and($order->items)->toHaveCount(1);

    $this->assertDatabaseHas('notifications', [
        'notifiable_id' => $apoteker->id,
    ]);
});

test('pharmacist can approve and reject prescription orders', function () {
    $pasien = userWithRole('pasien');
    $apoteker = userWithRole('apoteker');

    $approvedOrder = Order::create([
        'user_id' => $pasien->id,
        'order_number' => 'ORD-APPROVE',
        'total_amount' => 10000,
        'order_status' => 'waiting_prescription_verification',
        'payment_status' => 'unpaid',
        'prescription_status' => 'pending',
    ]);

    $this->actingAs($apoteker)
        ->post(route('pharmacist.prescriptions.verify', $approvedOrder), [
            'status' => 'approved',
        ])->assertSessionHas('success');

    expect($approvedOrder->refresh()->order_status)->toBe('waiting_payment')
        ->and($approvedOrder->prescription_status)->toBe('approved');

    $rejectedOrder = Order::create([
        'user_id' => $pasien->id,
        'order_number' => 'ORD-REJECT',
        'total_amount' => 10000,
        'order_status' => 'waiting_prescription_verification',
        'payment_status' => 'unpaid',
        'prescription_status' => 'pending',
    ]);

    $this->actingAs($apoteker)
        ->post(route('pharmacist.prescriptions.verify', $rejectedOrder), [
            'status' => 'rejected',
            'reason' => 'Resep tidak terbaca',
        ])->assertSessionHas('success');

    expect($rejectedOrder->refresh()->order_status)->toBe('prescription_rejected')
        ->and($rejectedOrder->prescription_status)->toBe('rejected')
        ->and($rejectedOrder->notes)->toContain('Resep tidak terbaca');
});

test('stock service deducts stock with FIFO batch ordering', function () {
    $medicine = medicineWithStock(['code' => 'FIFO-001'], [
        'batch_number' => 'OLDER',
        'quantity' => 3,
        'expired_at' => now()->addMonth()->toDateString(),
    ]);

    $newerBatch = MedicineBatch::create([
        'medicine_id' => $medicine->id,
        'batch_number' => 'NEWER',
        'quantity' => 5,
        'remaining_quantity' => 5,
        'expired_at' => now()->addMonths(6)->toDateString(),
        'purchase_price' => 5000,
        'received_at' => now()->toDateString(),
    ]);

    app(StockService::class)->deductStock($medicine->id, 4, 'test', 1, 'FIFO test');

    expect(MedicineBatch::where('batch_number', 'OLDER')->first()->remaining_quantity)->toBe(0)
        ->and($newerBatch->refresh()->remaining_quantity)->toBe(4);

    $this->assertDatabaseCount('stock_movements', 2);
});

test('cashier POS checkout creates completed order and deducts stock', function () {
    $cashier = userWithRole('kasir');
    $medicine = medicineWithStock(['price' => 12000], ['quantity' => 5]);

    $this->actingAs($cashier)
        ->post(route('cashier.pos.add'), [
            'medicine_id' => $medicine->id,
            'quantity' => 2,
        ]);

    $this->actingAs($cashier)
        ->post(route('cashier.pos.checkout'), [
            'notes' => 'Pembayaran tunai',
        ])->assertSessionHas('success');

    $order = Order::where('order_number', 'like', 'POS-%')->firstOrFail();

    expect($order->order_status)->toBe('completed')
        ->and($order->payment_status)->toBe('paid')
        ->and($order->total_amount)->toEqual(24000)
        ->and((int) MedicineBatch::where('medicine_id', $medicine->id)->sum('remaining_quantity'))->toBe(3);

    $this->assertDatabaseHas('stock_movements', [
        'medicine_id' => $medicine->id,
        'movement_type' => 'out',
        'reference_type' => 'offline_sale',
        'quantity' => 2,
    ]);
});

test('midtrans webhook validates signature, marks order paid, and deducts stock', function () {
    $pasien = userWithRole('pasien');
    $medicine = medicineWithStock(['price' => 20000], ['quantity' => 4]);

    $order = Order::create([
        'user_id' => $pasien->id,
        'order_number' => 'ORD-MIDTRANS',
        'total_amount' => 40000,
        'order_status' => 'waiting_payment',
        'payment_status' => 'unpaid',
        'payment_provider' => 'midtrans',
    ]);

    $order->items()->create([
        'medicine_id' => $medicine->id,
        'quantity' => 2,
        'price' => 20000,
        'subtotal' => 40000,
    ]);

    $payload = [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => '40000.00',
        'transaction_status' => 'settlement',
        'fraud_status' => 'accept',
        'payment_type' => 'bank_transfer',
        'transaction_id' => 'midtrans-transaction-id',
    ];
    $payload['signature_key'] = hash(
        'sha512',
        $payload['order_id'].$payload['status_code'].$payload['gross_amount'].config('services.midtrans.server_key')
    );

    $this->postJson(route('payments.midtrans.notification'), $payload)
        ->assertOk()
        ->assertJson(['message' => 'Notification queued.']);

    expect($order->refresh()->payment_status)->toBe('paid')
        ->and($order->order_status)->toBe('processing')
        ->and((int) MedicineBatch::where('medicine_id', $medicine->id)->sum('remaining_quantity'))->toBe(2);
});

test('non-prescription checkout creates Midtrans transaction before payment', function () {
    Http::fake([
        'app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
            'token' => 'snap-token',
            'redirect_url' => 'https://snap.example.test/pay',
        ]),
    ]);

    $pasien = userWithRole('pasien');
    $medicine = medicineWithStock(['price' => 18000], ['quantity' => 3]);

    $this->actingAs($pasien)
        ->post(route('customer.cart.add'), [
            'medicine_id' => $medicine->id,
            'quantity' => 1,
        ]);

    $this->actingAs($pasien)
        ->post(route('customer.checkout.store'), [
            'notes' => 'Tanpa resep',
        ])->assertRedirect();

    $order = Order::where('user_id', $pasien->id)->firstOrFail();

    expect($order->order_status)->toBe('waiting_payment')
        ->and($order->payment_status)->toBe('pending')
        ->and($order->midtrans_snap_token)->toBe('snap-token');
});

test('reverb broadcasting is configured and private notification channel is authorized', function () {
    Config::set('broadcasting.default', 'reverb');
    Config::set('broadcasting.connections.reverb.key', 'test-key');
    Config::set('broadcasting.connections.reverb.secret', 'test-secret');
    Config::set('broadcasting.connections.reverb.app_id', 'test-app');
    Broadcast::setDefaultDriver('reverb');
    Broadcast::purge('null');
    Broadcast::purge('reverb');
    Broadcast::channel('user-notifications.{userId}', function ($user, int $userId) {
        return (int) $user->id === $userId;
    });

    $pasien = userWithRole('pasien');
    $otherUser = userWithRole('pasien');

    expect(config('broadcasting.connections.reverb.driver'))->toBe('reverb')
        ->and(config('reverb.apps.apps.0.options.host'))->not->toBeNull();

    $this->actingAs($pasien)
        ->post('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => "private-user-notifications.{$pasien->id}",
        ])->assertOk()
        ->assertJsonStructure(['auth']);

    $this->actingAs($otherUser)
        ->post('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => "private-user-notifications.{$pasien->id}",
        ])->assertForbidden();
});

test('frontend echo wiring is present for realtime notifications', function () {
    expect(file_get_contents(resource_path('js/echo.ts')))->toContain(
        "broadcaster: 'reverb'",
        'VITE_REVERB_APP_KEY'
    );

    expect(file_get_contents(resource_path('js/app.tsx')))->toContain("import './echo';");

    expect(file_get_contents(resource_path('js/Layouts/AppLayout.tsx')))->toContain(
        'user-notifications.${auth.user.id}',
        "channel.listen('.notification.created'"
    );

    expect(json_decode(file_get_contents(base_path('package.json')), true)['dependencies'])
        ->toHaveKeys(['laravel-echo', 'pusher-js']);
});
