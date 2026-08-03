<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverAssigned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("private-orders.{$this->order->customer_id}"),
            new Channel("private-orders.{$this->order->restaurant->owner_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'driver.assigned';
    }

    public function broadcastWith(): array
    {
        return ['order_uuid' => $this->order->uuid, 'driver_name' => $this->order->driver->name];
    }
}
