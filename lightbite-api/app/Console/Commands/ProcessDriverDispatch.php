<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\DriverService;
use Illuminate\Console\Command;

class ProcessDriverDispatch extends Command
{
    protected $signature = 'orders:process-dispatch';
    protected $description = 'Advance driver dispatch for ready orders (timeouts, declines, no-driver cancellation)';

    public function handle(DriverService $driverService): int
    {
        $processed = 0;

        // Orders waiting on a driver whose current offer has expired.
        $stale = Order::where('status', OrderStatus::Ready)
            ->whereNotNull('dispatch_expires_at')
            ->where('dispatch_expires_at', '<=', now())
            ->get();

        // Safety net: ready orders that never had dispatch kick off (e.g. restored
        // to ready by an admin unassign) — pick them up on the next tick.
        $undispatched = Order::where('status', OrderStatus::Ready)
            ->whereNull('dispatch_started_at')
            ->get();

        foreach ($stale->merge($undispatched) as $order) {
            try {
                $driverService->processStaleDispatch($order);
                $processed++;
            } catch (\RuntimeException $e) {
                $this->warn("Could not process dispatch for {$order->order_number}: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$processed} ready order dispatch(es).");

        return self::SUCCESS;
    }
}
