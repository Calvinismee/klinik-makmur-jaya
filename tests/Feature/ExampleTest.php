<?php

test('halaman awal mengarahkan tamu ke halaman login', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
