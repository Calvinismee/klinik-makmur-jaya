<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'status',
        'progress',
        'message',
        'file_path',
        'file_name',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function downloadUrl(): ?string
    {
        if ($this->status !== 'completed' || !$this->file_name) {
            return null;
        }

        return route('admin.reports.download', ['filename' => $this->file_name], false);
    }
}
