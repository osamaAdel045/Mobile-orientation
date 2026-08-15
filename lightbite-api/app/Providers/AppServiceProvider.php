<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // The framework registers the default /broadcasting/auth route (with the
        // session `web` guard) from withBroadcasting() in a booted callback. By
        // registering our own version from this provider's register() phase, our
        // booted callback runs afterwards and the JWT `api` guard takes over
        // channel authorization — required for the mobile + admin clients that
        // authenticate with bearer tokens.
        $this->app->booted(function () {
            Broadcast::routes(['middleware' => ['auth:api']]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
