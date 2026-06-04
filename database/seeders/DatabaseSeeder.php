<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(RolePermissionSeeder::class);

        $admin = User::firstOrCreate([
            'email' => 'admin@klinik.test',
        ], [
            'name' => 'Administrator',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole('admin');

        $apoteker = User::firstOrCreate([
            'email' => 'apoteker@klinik.test',
        ], [
            'name' => 'Apoteker',
            'password' => bcrypt('password'),
        ]);
        $apoteker->assignRole('apoteker');

        $kasir = User::firstOrCreate([
            'email' => 'kasir@klinik.test',
        ], [
            'name' => 'Kasir',
            'password' => bcrypt('password'),
        ]);
        $kasir->assignRole('kasir');

        $pasien = User::firstOrCreate([
            'email' => 'pasien@klinik.test',
        ], [
            'name' => 'Pasien',
            'password' => bcrypt('password'),
        ]);
        $pasien->assignRole('pasien');

        $this->call(MasterDataSeeder::class);
    }
}
