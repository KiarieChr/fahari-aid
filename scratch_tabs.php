<?php
$c = file_get_contents('c:/xampp/htdocs/jesusenthroned/dashboard.php');
preg_match_all('/<ul[^>]*nav-tabs[^>]*>.*?<\/ul>/is', $c, $ul_matches);
foreach ($ul_matches[0] as $ul) {
    preg_match_all('/<a[^>]+href=["\']([^"\']+)["\'][^>]*>/is', $ul, $m);
    print_r($m[1]);
}
