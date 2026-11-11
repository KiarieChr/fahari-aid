<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
require_once '../includes/connection.php';

try {
    // Fetch products
    $stmt = $db->query("SELECT * FROM products ORDER BY id DESC");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch variants
    $stmt = $db->query("SELECT * FROM product_variants");
    $variants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Helper to clean image paths (strip legacy leading /jen/, slashes, or duplicate uploads/)
    $cleanPath = function($path) {
        if (!$path) return $path;
        if (strpos($path, 'http://') === 0 || strpos($path, 'https://') === 0) {
            return $path;
        }
        $path = preg_replace('#^/+#', '', $path);
        $path = preg_replace('#^jen/+#', '', $path);
        $path = preg_replace('#^(uploads/+)+#', 'uploads/', $path);
        if (strpos($path, 'uploads/') !== 0) {
            $path = 'uploads/' . $path;
        }
        return $path;
    };

    // Group variants by product_id
    $variants_by_product = [];
    foreach ($variants as $variant) {
        if (isset($variant['image_url'])) {
            $variant['image_url'] = $cleanPath($variant['image_url']);
        }
        $variants_by_product[$variant['product_id']][] = $variant;
    }

    // Attach variants to products
    foreach ($products as &$product) {
        if (isset($product['image_url'])) {
            $product['image_url'] = $cleanPath($product['image_url']);
        }
        $product['variants'] = $variants_by_product[$product['id']] ?? [];
    }

    echo json_encode([
        'success' => true,
        'data' => $products
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
