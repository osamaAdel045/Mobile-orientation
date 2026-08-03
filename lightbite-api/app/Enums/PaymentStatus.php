<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentStatus: string
{
    case PreAuthorized = 'pre_authorized';
    case Captured = 'captured';
    case Voided = 'voided';
    case Refunded = 'refunded';
    case PartiallyRefunded = 'partially_refunded';
    case Failed = 'failed';
}
