<?php 

// Master DB credentials
define('MASTER_DB_HOST', 'localhost');
define('MASTER_DB_USER', 'root');
define('MASTER_DB_PASS', '');
define('MASTER_DB_NAME', 'jen');

// Default fallback DB
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DEFAULT_DB_NAME', 'jen');

// Determine the requesting domain
$domain = 'localhost';
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $parsed_url = parse_url($_SERVER['HTTP_ORIGIN']);
    if (isset($parsed_url['host'])) {
        $domain = $parsed_url['host'];
        if (isset($parsed_url['port'])) {
            $domain .= ':' . $parsed_url['port']; // e.g., localhost:5173
        }
    }
} elseif (isset($_SERVER['HTTP_HOST'])) {
    $domain = $_SERVER['HTTP_HOST'];
}

$tenant_db_name = DEFAULT_DB_NAME;
$tenant_db_user = DB_USER;
$tenant_db_pass = DB_PASS;
$is_valid_tenant = false;

// Lookup tenant in master database
try {
    $master_db = new PDO(
        "mysql:host=".MASTER_DB_HOST.";dbname=".MASTER_DB_NAME.";charset=utf8mb4", 
        MASTER_DB_USER, 
        MASTER_DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    $stmt = $master_db->prepare("SELECT tenant_name, db_name, db_user, db_pass FROM tenants WHERE domain = :domain AND status = 'active' LIMIT 1");
    $stmt->execute([':domain' => $domain]);
    $tenant = $stmt->fetch();

    if ($tenant) {
        $is_valid_tenant = true;
        $tenant_db_name = $tenant['db_name'];
        if (!empty($tenant['db_user'])) $tenant_db_user = $tenant['db_user'];
        if (!empty($tenant['db_pass'])) $tenant_db_pass = $tenant['db_pass'];
    }
} catch (PDOException $e) {
    // If master DB fails, we will fallback to default DB (or we could exit)
    // For safety during transition, we just let it proceed to default DB
}

// Ensure DB_NAME is defined for legacy code compatibility
if (!defined('DB_NAME')) {
    define('DB_NAME', $tenant_db_name);
}

// Establish tenant database connection.
try {
    $db = new PDO(
        "mysql:host=".DB_HOST.";dbname=".$tenant_db_name.";charset=utf8mb4", 
        $tenant_db_user, 
        $tenant_db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(['success' => false, 'error' => "Tenant Database connection failed."]));
}

date_default_timezone_set('Africa/Nairobi'); 
?>