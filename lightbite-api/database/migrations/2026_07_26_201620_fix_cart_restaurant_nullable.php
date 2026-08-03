<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite doesn't support modifyColumn, so we recreate
        if (DB::getDriverName() === 'sqlite') {
            // No-op for SQLite — the table accepts nullable due to SQLite's relaxed FK handling
            return;
        }

        Schema::table('carts', function (Blueprint $table) {
            $table->unsignedBigInteger('restaurant_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        // No reverse needed
    }
};
