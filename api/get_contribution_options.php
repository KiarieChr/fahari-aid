<?php
/**
 * Get Contribution Options (types, funds, payment methods)
 * GET /api/get_contribution_options.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $contriTypes = [];
    $funds = [];
    $paymentMethods = [];

    try {
        $stmt = $db->query("SELECT id, name FROM contritype WHERE delete_status = 0 ORDER BY name ASC");
        $contriTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {}

    try {
        $stmt = $db->query("SELECT id, name FROM fund WHERE delete_status = 0 ORDER BY name ASC");
        $funds = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {}

    try {
        $stmt = $db->query("SELECT id, name FROM paymentmethod WHERE delete_status = 0 ORDER BY name ASC");
        $paymentMethods = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {}

    apiSuccess([
        'contribution_types' => $contriTypes,
        'funds' => $funds,
        'payment_methods' => $paymentMethods
    ], 'Options retrieved');

} catch (PDOException $e) {
    error_log("Contribution options error: " . $e->getMessage());
    apiError('Failed to retrieve options', 500);
}
