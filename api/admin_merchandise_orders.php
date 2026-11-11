<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../includes/connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM orders ORDER BY id DESC");
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt_items = $db->query("
            SELECT oi.*, p.name as product_name, pv.color, pv.size 
            FROM order_items oi 
            JOIN product_variants pv ON oi.product_variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
        ");
        $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

        $items_by_order = [];
        foreach ($items as $item) {
            $items_by_order[$item['order_id']][] = [
                'product_name' => $item['product_name'],
                'color' => $item['color'],
                'size' => $item['size'],
                'quantity' => $item['quantity'],
                'price' => $item['unit_price']
            ];
        }

        foreach ($orders as &$order) {
            $order['items'] = $items_by_order[$order['id']] ?? [];
            $order['status'] = ucfirst($order['order_status']);
        }

        echo json_encode(['success' => true, 'data' => $orders]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['order_id'], $data['status'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing order_id or status']);
        exit;
    }

    try {
        $stmt = $db->prepare("UPDATE orders SET order_status = :status WHERE id = :id");
        $stmt->execute([
            ':status' => strtolower($data['status']),
            ':id' => $data['order_id']
        ]);
        echo json_encode(['success' => true, 'message' => 'Order status updated']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>
