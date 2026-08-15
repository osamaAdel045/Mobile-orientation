<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-expire pending orders every 60 seconds
Schedule::command('orders:expire-pending')->everyMinute();

// Advance driver dispatch: move timed-out offers to the next driver and cancel
// orders that cannot find a driver. Runs every 30 seconds for snappy handoffs.
Schedule::command('orders:process-dispatch')->everyThirtySeconds();
