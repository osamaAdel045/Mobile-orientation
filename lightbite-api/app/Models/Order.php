<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'uuid',
        'order_number',
        'customer_id',
        'restaurant_id',
        'driver_id',
        'status',
        'subtotal_fils',
        'delivery_fee_fils',
        'tax_fils',
        'total_fils',
        'commission_fils',
        'driver_earnings_fils',
        'idempotency_key',
        'delivery_address_snapshot',
        'estimated_delivery_min',
        'actual_delivery_min',
        'customer_note',
        'lock_version',
        'dispatch_attempts',
        'dispatched_driver_ids',
        'dispatch_started_at',
        'dispatch_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'delivery_address_snapshot' => 'array',
            'dispatched_driver_ids' => 'array',
            'dispatch_started_at' => 'datetime',
            'dispatch_expires_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusLog(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class)->orderBy('created_at');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function rating(): HasOne
    {
        return $this->hasOne(Rating::class);
    }

    public function dispute(): HasOne
    {
        return $this->hasOne(Dispute::class);
    }
}
