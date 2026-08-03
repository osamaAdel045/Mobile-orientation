<?php

declare(strict_types=1);

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Preparing = 'preparing';
    case Ready = 'ready';
    case Assigned = 'assigned';
    case PickedUp = 'picked_up';
    case Delivering = 'delivering';
    case Delivered = 'delivered';
    case Rejected = 'rejected';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
    case Disputed = 'disputed';
    case Resolved = 'resolved';
    case Refunded = 'refunded';

    /** States where the customer can cancel. */
    public function isCancellable(): bool
    {
        return $this === self::Pending;
    }

    /** States where the order is still active (not terminal). */
    public function isActive(): bool
    {
        return ! in_array($this, [
            self::Delivered,
            self::Rejected,
            self::Expired,
            self::Cancelled,
            self::Refunded,
        ], true);
    }

    /** Terminal states — order processing is complete. */
    public function isTerminal(): bool
    {
        return ! $this->isActive();
    }
}
