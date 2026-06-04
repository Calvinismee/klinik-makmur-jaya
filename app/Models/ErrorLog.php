<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ErrorLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'severity', 'message', 'file', 'line', 'trace_summary', 'user_id', 'url', 'method'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
