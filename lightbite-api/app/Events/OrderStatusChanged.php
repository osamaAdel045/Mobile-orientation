<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order, public string $fromStatus, public string $toStatus, public ?string $note = null) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("private-orders.{$this->order->customer_id}"),
            new Channel("private-orders.{$this->order->restaurant->owner_id}"),
            new Channel('private-admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.status_update';
    }

    public function broadcastWith(): array
    {
        return [
            'order_uuid'      => $this->order->uuid,
            'order_number'    => $this->order->order_number,
            'from_status'     => $this->fromStatus,
            'to_status'       => $this->toStatus,
            'note'            => $this->note,
            'customer_name'   => $this->order->customer?->name,
            'restaurant_name' => $this->order->restaurant?->name,
            'total'           => number_format($this->order->total_fils / 100, 2),
            'updated_at'      => $this->order->updated_at->toISOString(),
        ];
    }
}
