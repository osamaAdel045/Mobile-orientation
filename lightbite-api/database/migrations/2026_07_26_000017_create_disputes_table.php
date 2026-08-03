<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->foreignId('order_id')->constrained();
            $table->foreignId('customer_id')->constrained('users');
            $table->string('reason'); // not_delivered, wrong_items, missing_items, quality, driver_behavior, other
            $table->string('description', 1000);
            $table->json('photos')->nullable(); // Array of storage paths (max 3)
            $table->string('status')->default('open');
            $table->string('resolution_note', 500)->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index('order_id');
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
