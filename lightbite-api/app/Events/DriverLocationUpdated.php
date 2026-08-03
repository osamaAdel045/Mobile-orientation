<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\DriverLocation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public DriverLocation $location, public string $orderUuid) {}

    public function broadcastOn(): array
    {
        return [new Channel("private-delivery.{$this->orderUuid}")];
    }

    public function broadcastAs(): string
    {
        return 'driver.location_update';
    }

    public function broadcastWith(): array
    {
        return ['lat' => $this->location->lat, 'lng' => $this->location->lng, 'bearing' => $this->location->bearing];
    }
}
