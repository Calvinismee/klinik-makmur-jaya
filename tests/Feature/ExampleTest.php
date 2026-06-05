<?php

test('redirects unauthenticated users to login', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
