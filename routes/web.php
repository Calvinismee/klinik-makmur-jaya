<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        $user = auth()->user();
        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }
        if ($user->hasRole('apoteker')) {
            return redirect()->route('pharmacist.dashboard');
        }
        if ($user->hasRole('kasir')) {
            return redirect()->route('cashier.dashboard');
        }

        return redirect()->route('customer.dashboard');
    }

    return redirect()->route('login');
})->name('home');

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\NotificationController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

Route::post('payments/midtrans/notification', [MidtransWebhookController::class, 'handle'])
    ->name('payments.midtrans.notification');

Route::middleware('guest')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store']);
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
});

Route::get('email/verify', function () {
    if (auth()->user()->hasVerifiedEmail()) {
        return redirect()->route('home');
    }

    return Inertia::render('Auth/VerifyEmail');
})->middleware('auth')->name('verification.notice');

Route::get('email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect()->route('home')
        ->with('success', 'Email berhasil diverifikasi.');
})->middleware(['auth', 'signed', 'throttle:6,1'])->name('verification.verify');

Route::post('email/verification-notification', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return redirect()->route('home');
    }

    $request->user()->sendEmailVerificationNotification();

    return back()->with('success', 'Link verifikasi baru sudah dikirim ke email Anda.');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

Route::post('logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');
Route::post('session/keep-alive', fn () => back()->with('success', 'Session diperpanjang.'))
    ->middleware('auth')
    ->name('session.keep-alive');
Route::post('notifications/read-all', [NotificationController::class, 'readAll'])
    ->middleware('auth')
    ->name('notifications.read-all');

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ErrorLogController;
use App\Http\Controllers\Admin\MedicineController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\UserController;

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [ReportController::class, 'dashboard'])->name('dashboard');

    Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
    Route::resource('suppliers', SupplierController::class)->except(['create', 'show', 'edit']);
    Route::post('medicines/import', [MedicineController::class, 'import'])->name('medicines.import');
    Route::resource('medicines', MedicineController::class)->except(['create', 'show', 'edit']);
    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    Route::get('orders/export', [AdminOrderController::class, 'export'])->name('orders.export');
    Route::post('orders/export/excel/background', [AdminOrderController::class, 'generateExcel'])->name('orders.export-excel-background');
    Route::get('orders/export/pdf', [AdminOrderController::class, 'exportPdf'])->name('orders.export-pdf');
    Route::post('orders/export/pdf/background', [AdminOrderController::class, 'generatePdf'])->name('orders.export-pdf-background');
    Route::get('reports/{reportJob}/status', [AdminOrderController::class, 'reportStatus'])->name('reports.status');
    Route::get('reports/download/{filename}', [AdminOrderController::class, 'downloadReport'])->name('reports.download');
    Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');

    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('error-logs', [ErrorLogController::class, 'index'])->name('error-logs.index');
});

use App\Http\Controllers\Apoteker\DashboardController as ApotekerDashboardController;
use App\Http\Controllers\Apoteker\MedicineBatchController;
use App\Http\Controllers\Apoteker\OrderController as ApotekerOrderController;
use App\Http\Controllers\Apoteker\PrescriptionController;
use App\Http\Controllers\Apoteker\StockMovementController;

Route::middleware(['auth', 'role:apoteker'])->prefix('pharmacist')->name('pharmacist.')->group(function () {
    Route::get('/dashboard', [ApotekerDashboardController::class, 'index'])->name('dashboard');

    Route::resource('batches', MedicineBatchController::class)->only(['index', 'store']);
    Route::get('movements', [StockMovementController::class, 'index'])->name('movements.index');

    Route::get('orders', [ApotekerOrderController::class, 'index'])->name('orders.index');
    Route::post('orders/bulk-ready', [ApotekerOrderController::class, 'bulkReady'])->name('orders.bulk-ready');
    Route::post('orders/{order}/ready', [ApotekerOrderController::class, 'ready'])->name('orders.ready');
    Route::get('prescription-history', [PrescriptionController::class, 'history'])->name('prescriptions.history');
    Route::get('prescriptions', [PrescriptionController::class, 'index'])->name('prescriptions.index');
    Route::post('prescriptions/{order}/verify', [PrescriptionController::class, 'verify'])->name('prescriptions.verify');
});

use App\Http\Controllers\Cashier\PaymentController as CashierPaymentController;
use App\Http\Controllers\Cashier\PosController;

Route::middleware(['auth', 'role:kasir'])->prefix('cashier')->name('cashier.')->group(function () {
    Route::get('/dashboard', function () {
        $today = Carbon::today();

        $stats = [
            'transaksi_hari_ini' => Order::whereDate('created_at', $today)
                ->where('order_number', 'like', 'POS-%')
                ->count(),
            'penerimaan_hari_ini' => Order::whereDate('updated_at', $today)
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
            'total_transaksi_selesai' => Order::where('payment_status', 'paid')->count(),
            'pembayaran_online_menunggu' => Order::where('order_number', 'like', 'ORD-%')
                ->where('payment_provider', 'midtrans')
                ->whereIn('payment_status', ['unpaid', 'pending'])
                ->count(),
            'pembayaran_online_hari_ini' => Order::where('order_number', 'like', 'ORD-%')
                ->where('payment_provider', 'midtrans')
                ->where('payment_status', 'paid')
                ->whereDate('paid_at', $today)
                ->count(),
        ];

        $recentTransactions = Order::whereIn('payment_status', ['paid', 'unpaid'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Cashier/Dashboard', [
            'stats' => $stats,
            'recentTransactions' => $recentTransactions,
        ]);
    })->name('dashboard');

    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/add', [PosController::class, 'addToCart'])->name('pos.add');
    Route::post('/pos/update', [PosController::class, 'updateCart'])->name('pos.update');
    Route::post('/pos/clear', [PosController::class, 'clearCart'])->name('pos.clear');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');

    Route::get('/payments', [CashierPaymentController::class, 'index'])->name('payments.index');
});

use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CatalogController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\OrderController;
use App\Models\Order;
use Carbon\Carbon;

Route::middleware(['auth', 'verified', 'role:pasien'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $orders = Order::where('user_id', $user->id)->get();

        return Inertia::render('Customer/Dashboard', [
            'stats' => [
                'totalOrders' => $orders->count(),
                'activeOrders' => $orders->whereIn('order_status', ['waiting_payment', 'paid', 'processing', 'ready_to_pickup', 'waiting_prescription_verification'])->count(),
                'completedOrders' => $orders->where('order_status', 'completed')->count(),
                'totalSpent' => $orders->where('order_status', 'completed')->sum('total_amount'),
            ],
            'recentOrders' => Order::where('user_id', $user->id)
                ->latest()
                ->take(5)
                ->get(),
        ]);
    })->name('dashboard');

    Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
    Route::get('/catalog/autocomplete', [CatalogController::class, 'autocomplete'])->name('catalog.autocomplete');
    Route::get('/catalog/{medicine}', [CatalogController::class, 'show'])->name('catalog.show');

    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
    Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders/{order:order_number}/pay', [OrderController::class, 'pay'])->name('orders.pay');
    Route::get('/orders/{order:order_number}', [OrderController::class, 'show'])->name('orders.show');
});
