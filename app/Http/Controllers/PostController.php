<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::all();

        return inertia('Welcome', [
            'posts' => $posts,
        ]);
    }

    public function store(StorePostRequest $request)
    {
        Post::create([
            'content' => $request->content,
        ]);

        return redirect()->route('posts.index');
    }
}
