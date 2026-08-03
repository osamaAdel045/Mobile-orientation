<?php

declare(strict_types=1);

namespace App\Enums;

enum UserStatus: string
{
    case PendingVerification = 'pending_verification';
    case Verified = 'verified';
    case Active = 'active';
    case Rejected = 'rejected';
    case Suspended = 'suspended';
    case Deactivated = 'deactivated';
}
