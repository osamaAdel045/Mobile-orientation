<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\AppConfig;
use Closure;
use Illuminate\Http\Request;

class AdminIpWhitelist
{
    public function handle(Request $request, Closure $next)
    {
        $whitelist = AppConfig::get('admin_ip_whitelist', []);

        // If whitelist is empty, allow all IPs
        if (empty($whitelist)) {
            return $next($request);
        }

        $clientIp = $request->ip();

        if (in_array($clientIp, $whitelist, true)) {
            return $next($request);
        }

        abort(403, 'Admin access not allowed from this IP address.');
    }
}
