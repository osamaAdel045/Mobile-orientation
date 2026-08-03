<?php

declare(strict_types=1);

namespace App\Enums;

enum DisputeStatus: string
{
    case Open = 'open';
    case UnderReview = 'under_review';
    case ResolvedRefunded = 'resolved_refunded';
    case ResolvedNoRefund = 'resolved_no_refund';
    case Denied = 'denied';
}
