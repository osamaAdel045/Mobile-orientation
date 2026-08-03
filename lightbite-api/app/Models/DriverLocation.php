<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverLocation extends Model
{
    public $timestamps = false;

    protected $fillable = ['driver_id', 'lat', 'lng', 'bearing', 'is_online'];

    protected function casts(): array
    {
        return ['is_online' => 'boolean', 'lat' => 'decimal:7', 'lng' => 'decimal:7', 'updated_at' => 'datetime'];
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
