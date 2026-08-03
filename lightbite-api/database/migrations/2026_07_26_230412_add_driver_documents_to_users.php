<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('license_path', 500)->nullable()->after('photo_path');
            $table->string('vehicle_registration_path', 500)->nullable()->after('license_path');
            $table->string('insurance_path', 500)->nullable()->after('vehicle_registration_path');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['license_path', 'vehicle_registration_path', 'insurance_path']);
        });
    }
};
