<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define permissions
        $permissions = [
            'manage-users',
            'manage-roles',
            'manage-medicines',
            'manage-categories',
            'manage-suppliers',
            'manage-customers',
            'manage-stock',
            'verify-prescriptions',
            'process-online-orders',
            'process-offline-sales',
            'view-reports',
            'export-reports',
            'view-audit-logs',
            'view-error-logs',
            'manage-system-config',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Define Roles and assign permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $apotekerRole = Role::firstOrCreate(['name' => 'apoteker']);
        $apotekerRole->givePermissionTo([
            'manage-stock',
            'verify-prescriptions',
            'process-online-orders',
        ]);

        $kasirRole = Role::firstOrCreate(['name' => 'kasir']);
        $kasirRole->givePermissionTo([
            'process-offline-sales',
        ]);

        $pasienRole = Role::firstOrCreate(['name' => 'pasien']);
        // Pasien default doesn't need much explicit admin permission
    }
}
