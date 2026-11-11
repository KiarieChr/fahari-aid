<?php
require_once __DIR__ . '/config.php';

// Check if tenant is valid (from connection.php logic)
global $is_valid_tenant, $tenant, $domain;

if ($is_valid_tenant && $tenant) {
    apiSuccess([
        'tenant_name' => $tenant['tenant_name'],
        'domain' => $domain
    ], "Tenant info retrieved successfully");
} else {
    // If not valid, return a generic or default response
    apiSuccess([
        'tenant_name' => 'Fahari Eklesia',
        'domain' => $domain
    ], "Default tenant info retrieved");
}
?>
