<?php

namespace App\Http\Controllers\Frontend;

use App\Models\Tag;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Resources\TagResource;
use App\Http\Controllers\Controller;
use App\Http\Resources\BlogResource;

class TagController extends Controller
{
    public function show(Tag $tag)
    {
        $blogs = $tag->blogs()->latest()->get();

        return Inertia::render('Tags/Index', [
            'blogs' => BlogResource::collection($blogs),
            'tag' => TagResource::make($tag),
        ]);
    }
}
