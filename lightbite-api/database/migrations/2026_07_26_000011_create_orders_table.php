<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->string('order_number', 22)->unique(); // LB-YYYYMMDD-XXXXX
            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('restaurant_id')->constrained('restaurants');
            $table->foreignId('driver_id')->nullable()->constrained('users');
            $table->string('status')->default('pending');
            $table->integer('subtotal_fils');
            $table->integer('delivery_fee_fils');
            $table->integer('tax_fils');
            $table->integer('total_fils');
            $table->integer('commission_fils')->default(0);
            $table->integer('driver_earnings_fils')->nullable();
            $table->uuid('idempotency_key')->unique();
            $table->json('delivery_address_snapshot');
            $table->integer('estimated_delivery_min')->nullable();
            $table->integer('actual_delivery_min')->nullable();
            $table->string('customer_note', 500)->nullable();
            $table->integer('lock_version')->default(1);
            $table->timestamps();

            $table->index(['customer_id', 'status', 'created_at']);
            $table->index(['restaurant_id', 'status', 'created_at']);
            $table->index(['driver_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
