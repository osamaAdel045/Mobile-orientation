<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RestaurantStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Restaurant extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (Restaurant $restaurant) {
            // location_point is a MySQL-only spatial column (added in the migration
            // only for the mysql driver). Guard the write so other drivers (e.g.
            // sqlite used by the test suite) do not attempt to insert a column
            // that does not exist.
            if (DB::getDriverName() === 'mysql' && $restaurant->isDirty(['lat', 'lng'])) {
                $restaurant->location_point = DB::raw("POINT({$restaurant->lat}, {$restaurant->lng})");
            }
        });
    }

    protected $fillable = [
        'uuid',
        'owner_id',
        'name',
        'description',
        'logo_path',
        'cover_path',
        'cuisine_types',
        'phone',
        'address',
        'lat',
        'lng',
        'status',
        'commission_rate',
        'is_accepting_orders',
        'prep_avg_time_min',
        'trade_license_path',
        'food_safety_cert_path',
    ];

    protected function casts(): array
    {
        return [
            'cuisine_types' => 'array',
            'status' => RestaurantStatus::class,
            'commission_rate' => 'decimal:3',
            'is_accepting_orders' => 'boolean',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function hours(): HasMany
    {
        return $this->hasMany(RestaurantHour::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(MenuCategory::class)->orderBy('sort_order');
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function canAcceptOrders(): bool
    {
        return $this->status === RestaurantStatus::Active && $this->is_accepting_orders;
    }

    public function scopeActive($query)
    {
        return $query->where('status', RestaurantStatus::Active->value);
    }

    public function scopeAcceptingOrders($query)
    {
        return $query->where('is_accepting_orders', true);
    }
}
