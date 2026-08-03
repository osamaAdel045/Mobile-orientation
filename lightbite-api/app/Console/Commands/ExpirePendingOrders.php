<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Console\Command;

class ExpirePendingOrders extends Command
{
    protected $signature = 'orders:expire-pending';
    protected $description = 'Auto-expire pending orders that have not been responded to within 2 minutes';

    public function handle(OrderService $orderService): int
    {
        $cutoff = now()->subMinutes(2);

        $expired = Order::where('status', OrderStatus::Pending)
            ->where('created_at', '<', $cutoff)
            ->get();

        foreach ($expired as $order) {
            try {
                $orderService->expire($order);
                $this->info("Expired order {$order->order_number}");
            } catch (\RuntimeException $e) {
                $this->warn("Could not expire {$order->order_number}: {$e->getMessage()}");
            }
        }

        $count = $expired->count();
        $this->info("Expired {$count} pending order(s).");

        return self::SUCCESS;
    }
}
