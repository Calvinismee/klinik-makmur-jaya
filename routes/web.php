<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        $user = auth()->user();
        if ($user->hasRole('admin')) return redirect()->route('admin.dashboard');
        if ($user->hasRole('apoteker')) return redirect()->route('pharmacist.dashboard');
        if ($user->hasRole('kasir')) return redirect()->route('cashier.dashboard');
        return redirect()->route('customer.dashboard');
    }
    return redirect()->route('login');
})->name('home');

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\NotificationController;

Route::post('payments/midtrans/notification', [MidtransWebhookController::class, 'handle'])
    ->name('payments.midtrans.notification');

Route::middleware('guest')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store']);
});

Route::post('logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');
Route::post('notifications/read-all', [NotificationController::class, 'readAll'])
    ->middleware('auth')
    ->name('notifications.read-all');

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\MedicineController;
use App\Http\Controllers\Admin\UserController;

use App\Http\Controllers\Admin\OrderController as AdminOrderController;

use App\Http\Controllers\Admin\ReportController;

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\ErrorLogController;

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [ReportController::class, 'dashboard'])->name('dashboard');

    Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
    Route::resource('suppliers', SupplierController::class)->except(['create', 'show', 'edit']);
    Route::post('medicines/import', [MedicineController::class, 'import'])->name('medicines.import');
    Route::resource('medicines', MedicineController::class)->except(['create', 'show', 'edit']);
    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    Route::get('orders/export', [AdminOrderController::class, 'export'])->name('orders.export');
    Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
    
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('error-logs', [ErrorLogController::class, 'index'])->name('error-logs.index');
});

use App\Http\Controllers\Apoteker\MedicineBatchController;
use App\Http\Controllers\Apoteker\StockMovementController;

use App\Http\Controllers\Apoteker\PrescriptionController;
use App\Http\Controllers\Apoteker\OrderController as ApotekerOrderController;

use App\Http\Controllers\Apoteker\DashboardController as ApotekerDashboardController;

Route::middleware(['auth', 'role:apoteker'])->prefix('pharmacist')->name('pharmacist.')->group(function () {
    Route::get('/dashboard', [ApotekerDashboardController::class, 'index'])->name('dashboard');

    Route::resource('batches', MedicineBatchController::class)->only(['index', 'store']);
    Route::get('movements', [StockMovementController::class, 'index'])->name('movements.index');

    Route::get('prescription-history', [PrescriptionController::class, 'history'])->name('prescriptions.history');
    Route::get('prescriptions', [PrescriptionController::class, 'index'])->name('prescriptions.index');
    Route::post('prescriptions/{order}/verify', [PrescriptionController::class, 'verify'])->name('prescriptions.verify');
});

use App\Http\Controllers\Cashier\PosController;
use App\Http\Controllers\Cashier\PaymentController;

Route::middleware(['auth', 'role:kasir'])->prefix('cashier')->name('cashier.')->group(function () {
    Route::get('/dashboard', function () {
        $today = \Carbon\Carbon::today();
        
        $stats = [
            'transaksi_hari_ini' => \App\Models\Order::whereDate('created_at', $today)
                ->where('order_number', 'like', 'POS-%')
                ->count(),
            'menunggu_pembayaran' => \App\Models\Order::where('order_number', 'like', 'ORD-%')
                ->where(function ($query) {
                    $query->where(function ($manualPayment) {
                        $manualPayment->where('order_status', 'waiting_payment')
                            ->whereNull('payment_provider');
                    })->orWhereIn('order_status', ['processing', 'ready_to_pickup']);
                })
                ->count(),
            'penerimaan_hari_ini' => \App\Models\Order::whereDate('updated_at', $today)
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'total_transaksi_selesai' => \App\Models\Order::where('payment_status', 'paid')->count(),
        ];

        $recentTransactions = \App\Models\Order::whereIn('payment_status', ['paid', 'unpaid'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Cashier/Dashboard', [
            'stats' => $stats,
            'recentTransactions' => $recentTransactions
        ]);
    })->name('dashboard');

    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/add', [PosController::class, 'addToCart'])->name('pos.add');
    Route::post('/pos/update', [PosController::class, 'updateCart'])->name('pos.update');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');

    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments/{order}', [PaymentController::class, 'process'])->name('payments.process');
    Route::post('/payments/{order}/ready', [PaymentController::class, 'ready'])->name('payments.ready');
    Route::post('/payments/{order}/complete', [PaymentController::class, 'complete'])->name('payments.complete');
    Route::post('/payments/{order}/cancel', [PaymentController::class, 'cancel'])->name('payments.cancel');
});

use App\Http\Controllers\Customer\CatalogController;
use App\Http\Controllers\Customer\CartController;

use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\OrderController;

Route::middleware(['auth', 'role:pasien'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $orders = \App\Models\Order::where('user_id', $user->id)->get();

        return Inertia::render('Customer/Dashboard', [
            'stats' => [
                'totalOrders' => $orders->count(),
                'activeOrders' => $orders->whereIn('order_status', ['waiting_payment', 'paid', 'processing', 'ready_to_pickup', 'waiting_prescription_verification'])->count(),
                'completedOrders' => $orders->where('order_status', 'completed')->count(),
                'totalSpent' => $orders->where('order_status', 'completed')->sum('total_amount'),
            ],
            'recentOrders' => \App\Models\Order::where('user_id', $user->id)
                ->latest()
                ->take(5)
                ->get(),
        ]);
    })->name('dashboard');

    Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
    Route::get('/catalog/{medicine}', [CatalogController::class, 'show'])->name('catalog.show');

    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
    Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders/{order}/pay', [OrderController::class, 'pay'])->name('orders.pay');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
});
