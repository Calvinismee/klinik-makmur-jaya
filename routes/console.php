<?php

use App\Jobs\CheckCriticalStockJob;
use App\Jobs\CheckExpiringMedicineJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new CheckCriticalStockJob)->dailyAt('07:00');
Schedule::job(new CheckExpiringMedicineJob)->dailyAt('07:10');
