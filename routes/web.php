<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('/home', function () {
    return Inertia::render('Home');
})->name('home');
