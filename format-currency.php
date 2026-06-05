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

    // We are looking for Rp {variable}
    // where variable does not contain "toLocaleString"
    $pattern = '/Rp\s*\{\s*([^}]+?)\s*\}/';

    $modified = false;

    $content = preg_replace_callback($pattern, function ($matches) {
        $val = trim($matches[1]);
        if (strpos($val, 'toLocaleString') === false) {
            return 'Rp {Number('.$val.").toLocaleString('id-ID')}";
        }

        return $matches[0];
    }, $content, -1, $count);

    if ($count > 0) {
        file_put_contents($file, $content);
        echo 'Formatted currency in: '.basename($file)."\n";
    }
}
