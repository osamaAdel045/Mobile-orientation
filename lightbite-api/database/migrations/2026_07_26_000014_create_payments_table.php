<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->foreignId('order_id')->nullable()->constrained();
            $table->string('stripe_payment_intent_id', 100)->nullable()->unique();
            $table->integer('amount_fils');
            $table->string('status'); // pre_authorized, captured, voided, refunded, partially_refunded, failed
            $table->integer('refund_amount_fils')->default(0);
            $table->string('refund_reason', 500)->nullable();
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
