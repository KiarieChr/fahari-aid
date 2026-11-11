<?php
/**
 * Assets API
 * /api/finance/assets.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';

$user = authenticate();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $db->query("
            SELECT a.id, a.branch, a.assettype, a.valuation_date, a.purchase_date,
                   CAST(REPLACE(a.purchase_price, ',', '') AS DECIMAL(15,2)) as purchase_price,
                   CAST(REPLACE(a.value_amount, ',', '') AS DECIMAL(15,2)) as current_value,
                   CAST(REPLACE(a.replace_value, ',', '') AS DECIMAL(15,2)) as replace_value,
                   a.photo1, at.name as type_name, at.category
            FROM asset a
            LEFT JOIN assettype at ON a.assettype = at.id
            WHERE a.delete_status = 0
            ORDER BY a.purchase_date DESC
        ");
        $assets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate basic depreciation (Purchase Price - Current Value)
        foreach ($assets as &$a) {
            $a['depreciation'] = max(0, (float)$a['purchase_price'] - (float)$a['current_value']);
            
            // Assume straight-line over 5 years (60 months) just for demonstration if value_amount is missing or same
            if ($a['depreciation'] == 0 && $a['purchase_price'] > 0) {
                $months = (time() - strtotime($a['purchase_date'])) / (30 * 24 * 60 * 60);
                if ($months > 0) {
                    $monthlyDepreciation = (float)$a['purchase_price'] / 60; // 5 years
                    $calcDep = min((float)$a['purchase_price'], $monthlyDepreciation * $months);
                    $a['depreciation'] = round($calcDep, 2);
                    $a['current_value'] = round((float)$a['purchase_price'] - $calcDep, 2);
                }
            }
        }
        
        apiSuccess($assets, 'Assets retrieved successfully');
    }
    elseif ($method === 'POST') {
        $data = getJsonBody();
        $stmt = $db->prepare("
            INSERT INTO asset (branch, assettype, valuation_date, value_amount, purchase_date, purchase_price, replace_value, delete_status) 
            VALUES (:branch, :type, :val_date, :val_amt, :pur_date, :pur_price, :rep_val, 0)
        ");
        $stmt->execute([
            ':branch' => $data['branch'] ?? 'Main',
            ':type' => $data['assettype'],
            ':val_date' => $data['valuation_date'] ?? date('Y-m-d'),
            ':val_amt' => $data['current_value'],
            ':pur_date' => $data['purchase_date'] ?? date('Y-m-d'),
            ':pur_price' => $data['purchase_price'],
            ':rep_val' => $data['replace_value'] ?? $data['purchase_price']
        ]);
        apiSuccess(['id' => $db->lastInsertId()], 'Asset created successfully');
    }
} catch (Exception $e) {
    error_log("Assets API error: " . $e->getMessage());
    apiError($e->getMessage(), 500);
}
