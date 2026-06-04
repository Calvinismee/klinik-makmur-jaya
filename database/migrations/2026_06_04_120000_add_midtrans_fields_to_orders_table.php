<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_provider')->nullable()->after('payment_status');
            $table->string('payment_method')->nullable()->after('payment_provider');
            $table->string('midtrans_transaction_id')->nullable()->after('payment_method');
            $table->string('midtrans_transaction_status')->nullable()->after('midtrans_transaction_id');
            $table->string('midtrans_fraud_status')->nullable()->after('midtrans_transaction_status');
            $table->string('midtrans_snap_token')->nullable()->after('midtrans_fraud_status');
            $table->text('midtrans_redirect_url')->nullable()->after('midtrans_snap_token');
            $table->timestamp('paid_at')->nullable()->after('midtrans_redirect_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_provider',
                'payment_method',
                'midtrans_transaction_id',
                'midtrans_transaction_status',
                'midtrans_fraud_status',
                'midtrans_snap_token',
                'midtrans_redirect_url',
                'paid_at',
            ]);
        });
    }
};
