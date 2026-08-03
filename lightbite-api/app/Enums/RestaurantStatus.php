<?php

declare(strict_types=1);

namespace App\Enums;

enum RestaurantStatus: string
{
    case PendingVerification = 'pending_verification';
    case Verified = 'verified';
    case Active = 'active';
    case Rejected = 'rejected';
    case Inactive = 'inactive';
    case Closed = 'closed';
    case Suspended = 'suspended';
    case PermanentlyClosed = 'permanently_closed';

    public function canAcceptOrders(): bool
    {
        return $this === self::Active;
    }

    public function isVisible(): bool
    {
        return in_array($this, [self::Active, self::Closed], true);
    }
}
