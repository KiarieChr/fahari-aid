<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../includes/connection.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!isset($data['customer_name'], $data['customer_contact'], $data['items']) || !is_array($data['items'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid input data']);
    exit;
}

try {
    $db->beginTransaction();

    $total_amount = 0;
    foreach ($data['items'] as $item) {
        $total_amount += $item['price'] * $item['quantity'];
    }

    $stmt = $db->prepare("INSERT INTO orders (customer_name, customer_contact, total_amount, payment_status, order_status) VALUES (:name, :contact, :total, 'pending', 'new')");
    $stmt->execute([
        ':name' => $data['customer_name'],
        ':contact' => $data['customer_contact'],
        ':total' => $total_amount
    ]);
    
    $order_id = $db->lastInsertId();

    // Determine the actual column name for stock (stock_quantity or stock)
    $stock_col = 'stock_quantity';
    try {
        $col_stmt = $db->query("DESCRIBE product_variants");
        $columns = $col_stmt->fetchAll(PDO::FETCH_COLUMN);
        if (!in_array('stock_quantity', $columns) && in_array('stock', $columns)) {
            $stock_col = 'stock';
        }
    } catch (Exception $e) {
        $stock_col = 'stock_quantity';
    }

    $stmt_item = $db->prepare("INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price, subtotal) VALUES (:order_id, :variant_id, :qty, :price, :subtotal)");
    $stmt_stock = $db->prepare("UPDATE product_variants SET {$stock_col} = {$stock_col} - :qty WHERE id = :variant_id");
    
    foreach ($data['items'] as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $stmt_item->execute([
            ':order_id' => $order_id,
            ':variant_id' => $item['variant_id'],
            ':qty' => $item['quantity'],
            ':price' => $item['price'],
            ':subtotal' => $subtotal
        ]);
        
        // Deduct from available stock
        $stmt_stock->execute([
            ':qty' => $item['quantity'],
            ':variant_id' => $item['variant_id']
        ]);
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Order placed successfully',
        'order_id' => $order_id
    ]);

} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
