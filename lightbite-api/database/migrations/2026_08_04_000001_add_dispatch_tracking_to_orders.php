<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add driver-dispatch state tracking to orders.
     *
     * These columns back the end-to-end driver dispatch flow:
     *  - dispatch_attempts      : how many distinct drivers have been offered the job
     *  - dispatched_driver_ids  : drivers already offered (so we never double-offer)
     *  - dispatch_started_at    : when dispatch first began (15-minute "no driver" cap)
     *  - dispatch_expires_at    : when the current offer expires (moves to next driver)
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedTinyInteger('dispatch_attempts')->default(0)->after('driver_earnings_fils');
            $table->json('dispatched_driver_ids')->nullable()->after('dispatch_attempts');
            $table->timestamp('dispatch_started_at')->nullable()->after('dispatched_driver_ids');
            $table->timestamp('dispatch_expires_at')->nullable()->after('dispatch_started_at');

            $table->index(['status', 'dispatch_expires_at']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status', 'dispatch_expires_at']);
            $table->dropColumn(['dispatch_attempts', 'dispatched_driver_ids', 'dispatch_started_at', 'dispatch_expires_at']);
        });
    }
};
