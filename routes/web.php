<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\BlogController;

Route::get('/', [BlogController::class, 'index'])->name('blogs.index');
