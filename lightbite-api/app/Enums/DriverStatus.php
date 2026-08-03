<?php

declare(strict_types=1);

namespace App\Enums;

enum DriverStatus: string
{
    case PendingVerification = 'pending_verification';
    case Verified = 'verified';
    case Online = 'online';
    case Offline = 'offline';
    case OnDelivery = 'on_delivery';
    case Suspended = 'suspended';
    case Deactivated = 'deactivated';
}
