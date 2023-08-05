<?php

namespace App\Http\Controllers\Frontend;

use App\Models\Blog;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\BlogResource;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = BlogResource::collection(Blog::latest()->get());

        return Inertia::render('Blogs/Index', [
            'blogs' => $blogs,
        ]);
    }

    public function show(Blog $blog)
    {
        return Inertia::render('Blogs/Show', [
            'blog' => BlogResource::make($blog),
        ]);
    }
}
