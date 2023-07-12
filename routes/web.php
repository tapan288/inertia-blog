<?php

use App\Http\Controllers\PostController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', [PostController::class, 'index'])->name('welcome');

Route::get('/home', function () {
    return Inertia::render('Home');
})->name('home');
