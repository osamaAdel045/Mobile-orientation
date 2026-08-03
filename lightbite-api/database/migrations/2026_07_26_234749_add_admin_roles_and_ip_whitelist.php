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
            $table->string('admin_role')->nullable()->after('role'); // super_admin, admin, support, read_only
        });

        // Seed IP whitelist config entry
        \App\Models\AppConfig::firstOrCreate(
            ['key' => 'admin_ip_whitelist'],
            ['value' => [], 'description' => 'Allowed IP addresses for admin access (empty = any IP)']
        );
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('admin_role');
        });
        \App\Models\AppConfig::where('key', 'admin_ip_whitelist')->delete();
    }
};
