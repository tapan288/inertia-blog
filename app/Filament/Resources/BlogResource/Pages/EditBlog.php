<?php

namespace App\Filament\Resources\BlogResource\Pages;

use Filament\Actions;
use App\Filament\Resources\BlogResource;
use Filament\Resources\Pages\EditRecord;

class EditBlog extends EditRecord
{
    protected static string $resource = BlogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            //
        ];
    }
}
