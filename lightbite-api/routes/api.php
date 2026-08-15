<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AdminThemeController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\DriverController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\RestaurantController;
use App\Http\Controllers\Api\V1\RestaurantDashboardController;
use App\Http\Controllers\Api\V1\ScreenController;
use App\Http\Controllers\Api\V1\ThemeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // ─── Public ────────────────────────────────────────────
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:5,15');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,15');
    Route::post('auth/refresh', [AuthController::class, 'refresh']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::put('auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('restaurants', [RestaurantController::class, 'index']);
    Route::get('theme', [ThemeController::class, 'show']);
    Route::get('theme/config', [ThemeController::class, 'show']);
    Route::get('health', fn () => response()->json(['status' => 'ok', 'timestamp' => now()->toISOString(), 'services' => ['database' => 'ok', 'cache' => 'ok']]));

    // ─── Authenticated ────────────────────────────────────
    Route::middleware('auth:api')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Screen Data (single-call bundles for each role)
        Route::get('home', [ScreenController::class, 'customerHome']);
        Route::get('driver/home', [ScreenController::class, 'driverHome']);
        Route::get('restaurants/dashboard/home', [ScreenController::class, 'restaurantDashboardHome']);

        // Admin
        Route::prefix('admin')->middleware('admin.ip')->group(function () {
            Route::get('dashboard', [ScreenController::class, 'adminDashboard']);
            Route::post('broadcast-auth', [AdminController::class, 'broadcastAuth']);
            Route::get('dashboard/revenue-chart', [AdminController::class, 'revenueChart']);
            Route::get('dashboard/order-volume', [AdminController::class, 'orderVolume']);
            Route::get('dashboard/top-restaurants', [AdminController::class, 'topRestaurants']);
            Route::get('dashboard/recent-activity', [AdminController::class, 'recentActivity']);
            Route::get('restaurants/pending', [AdminController::class, 'pendingRestaurants']);
            Route::post('restaurants/{uuid}/verify', [AdminController::class, 'verifyRestaurant']);
            Route::get('drivers/pending', [AdminController::class, 'pendingDrivers']);
            Route::post('drivers/{uuid}/verify', [AdminController::class, 'verifyDriver']);
            Route::get('disputes', [AdminController::class, 'disputes']);
            Route::post('disputes/{uuid}/resolve', [AdminController::class, 'resolveDispute']);
            // Order Management
            Route::get('orders', [AdminController::class, 'orders']);
            Route::get('orders/{uuid}', [AdminController::class, 'orderDetail']);
            Route::post('orders/{uuid}/cancel', [AdminController::class, 'cancelOrder']);
            Route::post('orders/{uuid}/refund', [AdminController::class, 'refundOrder']);
            Route::post('orders/{uuid}/reassign', [AdminController::class, 'reassignOrder']);
            Route::post('orders/{uuid}/note', [AdminController::class, 'addOrderNote']);
            // User Management
            Route::get('users', [AdminController::class, 'users']);
            Route::get('users/{uuid}', [AdminController::class, 'userDetail']);
            Route::post('users/{uuid}/suspend', [AdminController::class, 'suspendUser']);
            Route::post('users/{uuid}/unsuspend', [AdminController::class, 'unsuspendUser']);
            Route::post('users/{uuid}/deactivate', [AdminController::class, 'deactivateUser']);
            // Restaurant Management (all)
            Route::get('restaurants', [AdminController::class, 'allRestaurants']);
            Route::get('restaurants/{uuid}', [AdminController::class, 'restaurantDetail']);
            Route::patch('restaurants/{uuid}', [AdminController::class, 'updateRestaurant']);
            Route::post('restaurants/{uuid}/suspend', [AdminController::class, 'suspendRestaurant']);
            Route::post('restaurants/{uuid}/unsuspend', [AdminController::class, 'unsuspendRestaurant']);
            // Driver Management (all)
            Route::get('drivers', [AdminController::class, 'allDrivers']);
            // Audit Log
            Route::get('audit-logs', [AdminController::class, 'auditLogs']);
            // Dispute Detail
            Route::get('disputes/{uuid}', [AdminController::class, 'disputeDetail']);
            // Cart Monitoring
            Route::get('carts/active', [AdminController::class, 'activeCarts']);
            Route::get('carts/abandoned', [AdminController::class, 'abandonedCarts']);
            // System Health
            Route::get('system/health', [AdminController::class, 'systemHealth']);
            // Analytics
            Route::get('analytics', [AdminController::class, 'analytics']);
            // Admin Users & Security
            Route::get('admins', [AdminController::class, 'adminUsers']);
            Route::post('admins', [AdminController::class, 'createAdminUser']);
            Route::patch('admins/{uuid}', [AdminController::class, 'updateAdminUser']);
            Route::get('security/ip-whitelist', [AdminController::class, 'ipWhitelist']);
            Route::put('security/ip-whitelist', [AdminController::class, 'updateIpWhitelist']);
            // Settings
            Route::get('settings', [AdminController::class, 'getSettings']);
            Route::put('settings', [AdminController::class, 'updateSettings']);
        });

        // Admin Theme
        Route::prefix('admin/theme')->group(function () {
            Route::get('/', [AdminThemeController::class, 'show']);
            Route::put('/', [AdminThemeController::class, 'update']);
            Route::post('reset', [AdminThemeController::class, 'reset']);
        });

        // Cart
        Route::get('cart', [CartController::class, 'show']);
        Route::post('cart/items', [CartController::class, 'addItem']);
        Route::patch('cart/items/{item}', [CartController::class, 'updateItem']);
        Route::delete('cart/items/{item}', [CartController::class, 'removeItem']);
        Route::delete('cart', [CartController::class, 'clear']);
        Route::post('cart/validate', [CartController::class, 'validate']);

        // Driver
        Route::patch('driver/status', [DriverController::class, 'toggleStatus']);
        Route::post('driver/location', [DriverController::class, 'updateLocation']);
        Route::post('driver/jobs/{orderUuid}/accept', [DriverController::class, 'acceptJob']);
        Route::post('driver/jobs/{orderUuid}/decline', [DriverController::class, 'declineJob']);
        Route::post('driver/jobs/{orderUuid}/pickup', [DriverController::class, 'confirmPickup']);
        Route::post('driver/jobs/{orderUuid}/start-delivery', [DriverController::class, 'startDelivery']);
        Route::post('driver/jobs/{orderUuid}/deliver', [DriverController::class, 'confirmDelivery']);
        Route::get('driver/earnings', [DriverController::class, 'earnings']);
        Route::get('driver/orders', [DriverController::class, 'orderHistory']);
        Route::get('driver/active-delivery', [DriverController::class, 'activeDelivery']);

        // Addresses
        Route::get('addresses', [AddressController::class, 'index']);
        Route::post('addresses', [AddressController::class, 'store']);
        Route::put('addresses/{uuid}', [AddressController::class, 'update']);
        Route::delete('addresses/{uuid}', [AddressController::class, 'destroy']);

        // Orders (customer)
        Route::post('orders', [OrderController::class, 'place']);
        Route::get('orders', [OrderController::class, 'history']);
        Route::get('orders/{uuid}', [OrderController::class, 'show']);
        Route::get('orders/{uuid}/tracking', [OrderController::class, 'tracking']);
        Route::post('orders/{uuid}/cancel', [OrderController::class, 'cancel'])->withoutMiddleware('auth:api')->middleware('auth:api');
        Route::patch('orders/{uuid}', [OrderController::class, 'modify']);
        Route::post('orders/{uuid}/rate', [OrderController::class, 'rate']);

        // Restaurant Dashboard (order management)
        Route::prefix('restaurants/dashboard')->group(function () {
            Route::get('/', [RestaurantDashboardController::class, 'dashboard']);
            Route::get('profile', [RestaurantDashboardController::class, 'profile']);
            Route::patch('profile', [RestaurantDashboardController::class, 'updateProfile']);
            Route::put('hours', [RestaurantDashboardController::class, 'updateHours']);
            Route::get('orders', [RestaurantDashboardController::class, 'orders']);
            Route::get('orders/{uuid}', [RestaurantDashboardController::class, 'orderDetail']);
            Route::post('orders/{uuid}/accept', [RestaurantDashboardController::class, 'acceptOrder']);
            Route::post('orders/{uuid}/reject', [RestaurantDashboardController::class, 'rejectOrder']);
            Route::patch('orders/{uuid}/status', [RestaurantDashboardController::class, 'updateOrderStatus']);
            Route::get('earnings', [RestaurantDashboardController::class, 'earnings']);
            // Categories + Menu + Pause (existing)
            Route::get('categories', [RestaurantDashboardController::class, 'categories']);
            Route::post('categories', [RestaurantDashboardController::class, 'createCategory']);
            Route::put('categories/{category}', [RestaurantDashboardController::class, 'updateCategory']);
            Route::delete('categories/{category}', [RestaurantDashboardController::class, 'deleteCategory']);
            Route::post('menu-items', [RestaurantDashboardController::class, 'createMenuItem']);
            Route::put('menu-items/{item}', [RestaurantDashboardController::class, 'updateMenuItem']);
            Route::delete('menu-items/{item}', [RestaurantDashboardController::class, 'deleteMenuItem']);
            Route::patch('menu-items/{item}/toggle', [RestaurantDashboardController::class, 'toggleItem']);
            Route::post('toggle-pause', [RestaurantDashboardController::class, 'togglePause']);
        });

        // Public restaurant detail routes — MUST be after /restaurants/dashboard/*
        // to prevent "dashboard" from matching the {uuid} parameter.
        Route::get('restaurants/{uuid}', [RestaurantController::class, 'show']);
        Route::get('restaurants/{uuid}/menu', [RestaurantController::class, 'menu']);
    });
});
