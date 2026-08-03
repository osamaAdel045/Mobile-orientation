<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\DisputeStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    protected $fillable = [
        'uuid', 'order_id', 'customer_id', 'reason',
        'description', 'photos', 'status', 'resolution_note', 'resolved_by',
    ];

    protected function casts(): array
    {
        return ['photos' => 'array', 'status' => DisputeStatus::class];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
