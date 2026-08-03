<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('menu_categories');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('price_fils');
            $table->string('image_path', 500)->nullable();
            $table->boolean('is_available')->default(true);
            $table->integer('prep_time_minutes')->default(15);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['restaurant_id', 'category_id']);
            $table->index(['restaurant_id', 'is_available']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE menu_items ADD FULLTEXT INDEX ft_menu_search (name, description)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
