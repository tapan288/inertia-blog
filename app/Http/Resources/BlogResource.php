<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Spatie\LaravelMarkdown\MarkdownRenderer;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'teaser' => $this->teaser,
            'content' => app(MarkdownRenderer::class)->toHtml($this->content),
            'author' => $this->author,
            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}
