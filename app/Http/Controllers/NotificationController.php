<?php

namespace App\Http\Controllers;

class NotificationController extends Controller
{
    public function readAll()
    {
        auth()->user()?->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }
}
