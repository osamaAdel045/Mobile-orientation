<?php

namespace App\Providers;

use App\Events\OrderStatusChanged;
use App\Listeners\BroadcastDriverJob;
use App\Listeners\SendOrderNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        OrderStatusChanged::class => [
            SendOrderNotification::class,
            BroadcastDriverJob::class,
        ],
    ];

    /**
     * Register the application's event listeners.
     *
     * Laravel also auto-registers a base EventServiceProvider that discovers every
     * listener in app/Listeners by convention. Without disabling that discovery the
     * listeners declared in $listen above would be registered a second time, so each
     * one would fire twice. We keep the explicit mappings here (single source of
     * truth) and turn the convention-based discovery off.
     */
    public function register(): void
    {
        ServiceProvider::disableEventDiscovery();

        parent::register();
    }
}
