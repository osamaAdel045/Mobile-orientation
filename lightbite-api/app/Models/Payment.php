<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'uuid', 'order_id', 'stripe_payment_intent_id',
        'amount_fils', 'status', 'refund_amount_fils', 'refund_reason',
    ];

    protected function casts(): array
    {
        return ['status' => PaymentStatus::class];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
