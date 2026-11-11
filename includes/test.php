<?php 
// Output test results
echo "<h2>Cookie Test</h2>";

if (isset($_COOKIE['test_cookie'])) {
    echo "<p><strong>Success!</strong> Cookie was set and is readable. Value: <code>{$_COOKIE['test_cookie']}</code></p>";
} else {
    echo "<p><strong>First Load or Cookie Not Set Yet.</strong></p>";
    echo "<p>Please <a href='test_cookie.php'>refresh the page</a> to see if the cookie is now readable.</p>";
}

// Show all current cookies for debug
echo "<h3>All Cookies:</h3><pre>";
print_r($_COOKIE);
echo "</pre>";

ob_end_flush(); // End output buffering
?>
?>