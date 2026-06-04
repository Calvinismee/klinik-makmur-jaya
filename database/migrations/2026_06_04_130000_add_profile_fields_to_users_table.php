<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('identity_number', 16)->nullable()->after('phone');
            $table->date('date_of_birth')->nullable()->after('identity_number');
            $table->string('gender', 20)->nullable()->after('date_of_birth');
            $table->text('address')->nullable()->after('gender');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'identity_number',
                'date_of_birth',
                'gender',
                'address',
            ]);
        });
    }
};
