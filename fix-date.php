<?php

function getDirContents($dir, &$results = [])
{
    $files = scandir($dir);

    foreach ($files as $key => $value) {
        $path = realpath($dir.DIRECTORY_SEPARATOR.$value);
        if (! is_dir($path)) {
            if (pathinfo($path, PATHINFO_EXTENSION) === 'tsx') {
                $results[] = $path;
            }
        } elseif ($value != '.' && $value != '..') {
            getDirContents($path, $results);
        }
    }

    return $results;
}

$files = getDirContents(__DIR__.'/resources/js/pages');

foreach ($files as $file) {
    $content = file_get_contents($file);
    $modified = false;

    // Replace "new Tanggal" with "new Date"
    if (strpos($content, 'new Tanggal') !== false) {
        $content = str_replace('new Tanggal', 'new Date', $content);
        $modified = true;
    }

    // Replace "Tanggal.now" with "Date.now"
    if (strpos($content, 'Tanggal.now') !== false) {
        $content = str_replace('Tanggal.now', 'Date.now', $content);
        $modified = true;
    }

    if ($modified) {
        file_put_contents($file, $content);
        echo 'Fixed Date in: '.basename($file)."\n";
    }
}
