<?php
/**
 * Receivables API
 * /api/finance/receivables.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';

$user = authenticate();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';
        
        if ($action === 'list') {
            $stmt = $db->query("
                SELECT p.id, p.member, p.purpose, p.pledges_amount as amount, p.date as date, p.status,
                       COALESCE((SELECT SUM(redeemed_amount) FROM pledges_redeem WHERE pledge_id = p.id), 0) as paid_amount,
                       CONCAT(m.first_name, ' ', m.last_name) as member_name, m.email
                FROM pledges p
                LEFT JOIN member m ON p.member = m.id
                WHERE p.status != 'cancelled'
                ORDER BY p.date DESC
            ");
            $receivables = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($receivables as &$r) {
                $r['balance'] = (float)$r['amount'] - (float)$r['paid_amount'];
                $r['status'] = $r['balance'] <= 0 ? 'paid' : ($r['paid_amount'] > 0 ? 'partially_paid' : 'unpaid');
            }
            
            apiSuccess($receivables, 'Receivables retrieved successfully');
        } 
        elseif ($action === 'get_invoice_data') {
            $id = $_GET['id'] ?? null;
            if (!$id) apiError('Pledge/Invoice ID required');
            
            $stmt = $db->prepare("
                SELECT p.id, p.purpose, p.pledges_amount, p.date as added_date,
                       CONCAT(m.first_name, ' ', m.last_name) as full_name, m.email, m.phone_no as phone, m.address
                FROM pledges p
                LEFT JOIN member m ON p.member = m.id
                WHERE p.id = :id
            ");
            $stmt->execute([':id' => $id]);
            $pledge = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$pledge) apiError('Record not found', 404);
            
            // Get tenant/organization info
            $tenantInfo = [
                'tenant_name' => 'Fahari Eklesia', // Default fallback
                'currency' => 'KES'
            ];
            
            // From master DB
            global $master_db;
            if (isset($master_db)) {
                $domain = 'localhost';
                if (isset($_SERVER['HTTP_ORIGIN'])) {
                    $parsed_url = parse_url($_SERVER['HTTP_ORIGIN']);
                    if (isset($parsed_url['host'])) {
                        $domain = $parsed_url['host'];
                        if (isset($parsed_url['port'])) $domain .= ':' . $parsed_url['port'];
                    }
                } elseif (isset($_SERVER['HTTP_HOST'])) {
                    $domain = $_SERVER['HTTP_HOST'];
                }
                
                $tenantStmt = $master_db->prepare("SELECT tenant_name FROM tenants WHERE domain = :domain LIMIT 1");
                $tenantStmt->execute([':domain' => $domain]);
                $tenant = $tenantStmt->fetch(PDO::FETCH_ASSOC);
                if ($tenant && !empty($tenant['tenant_name'])) {
                    $tenantInfo['tenant_name'] = $tenant['tenant_name'];
                }
            }
            
            // From tenant DB
            try {
                $orgStmt = $db->query("SELECT org_name, head_office, currency FROM organization_settings WHERE id = 1");
                $org = $orgStmt->fetch(PDO::FETCH_ASSOC);
                if ($org) {
                    if (!empty($org['org_name'])) $tenantInfo['tenant_name'] = $org['org_name'];
                    if (!empty($org['head_office'])) $tenantInfo['head_office'] = $org['head_office'];
                    if (!empty($org['currency'])) $tenantInfo['currency'] = $org['currency'];
                }
            } catch (PDOException $e) {
                // Ignore if organization_settings doesn't exist
            }
            
            apiSuccess([
                'invoice' => $pledge,
                'tenant' => $tenantInfo
            ], 'Invoice data retrieved');
        }
    } else {
        apiError('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Receivables API error: " . $e->getMessage());
    apiError($e->getMessage(), 500);
}
