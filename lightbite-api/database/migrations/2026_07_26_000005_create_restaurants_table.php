<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->foreignId('owner_id')->constrained('users');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('logo_path', 500)->nullable();
            $table->string('cover_path', 500)->nullable();
            $table->json('cuisine_types');
            $table->string('phone', 20);
            $table->string('address', 500);
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->string('status')->default('pending_verification');
            $table->decimal('commission_rate', 4, 3)->default(0.120);
            $table->boolean('is_accepting_orders')->default(true);
            $table->integer('prep_avg_time_min')->default(20);
            $table->string('trade_license_path', 500)->nullable();
            $table->string('food_safety_cert_path', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'lat', 'lng']);
            $table->index('owner_id');
        });

        // Spatial and fulltext indexes (MySQL only)
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE restaurants ADD location_point POINT NOT NULL');
            DB::statement('ALTER TABLE restaurants ADD SPATIAL INDEX idx_location (location_point)');
            DB::statement('ALTER TABLE restaurants ADD FULLTEXT INDEX ft_restaurant_search (name)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
