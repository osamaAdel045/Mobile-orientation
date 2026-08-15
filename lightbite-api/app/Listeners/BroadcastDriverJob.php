<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderStatusChanged;
use App\Services\DriverService;

class BroadcastDriverJob
{
    public function __construct(private DriverService $driverService) {}

    /**
     * When an order becomes ready, broadcast a NewDriverJob to the nearest drivers.
     *
     * The DriverService handles the full dispatch lifecycle: picking the nearest
     * unoffered driver, tracking attempts, and enforcing timeouts/declines.
     */
    public function handle(OrderStatusChanged $event): void
    {
        if ($event->toStatus !== OrderStatus::Ready->value) {
            return;
        }

        $this->driverService->dispatchOrder($event->order);
    }
}
