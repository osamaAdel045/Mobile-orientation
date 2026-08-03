<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewDriverJob implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order, public int $driverId) {}

    public function broadcastOn(): array
    {
        return [new Channel("private-driver.{$this->driverId}")];
    }

    public function broadcastAs(): string
    {
        return 'driver.new_job';
    }

    public function broadcastWith(): array
    {
        return [
            'order_uuid' => $this->order->uuid,
            'restaurant_name' => $this->order->restaurant->name,
            'estimated_earnings' => number_format(($this->order->driver_earnings_fils ?? 800) / 100, 2),
            'timeout_seconds' => 30,
        ];
    }
}
