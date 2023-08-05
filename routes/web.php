<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\TagController;
use App\Http\Controllers\Frontend\BlogController;

Route::get('/', [BlogController::class, 'index'])->name('blogs.index');
Route::get('/blog/{blog}', [BlogController::class, 'show'])->name('blogs.show');

Route::get('/tag/{tag}', [TagController::class, 'show'])->name('tags.show');
