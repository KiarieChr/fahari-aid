<?php
$c = file_get_contents('c:/xampp/htdocs/jesusenthroned/dashboard.php');
$start = strpos($c, 'id="my-birthday"');
$end = strpos($c, 'id="upcoming-birthdays"', $start) ?: strpos($c, 'Footer', $start);
$block = substr($c, $start, $end - $start);
file_put_contents('c:/xampp/htdocs/jesusenthroned/bday_out.php', $block);
