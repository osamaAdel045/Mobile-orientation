<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

// Admin SPA — catch-all for Vue router
Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');

// Restaurant Dashboard SPA — catch-all for Vue router
Route::get('/restaurant/{any?}', function () {
    return view('restaurant');
})->where('any', '.*');
