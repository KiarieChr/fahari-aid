<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../includes/connection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Since we are handling file uploads, we use $_POST instead of php://input
if (!isset($_POST['name'], $_POST['base_price'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$image_url = '';

$uploadDir = '../uploads/merchandise/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Handle Image Upload
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['image']['tmp_name'];
    $fileName = $_FILES['image']['name'];
    $fileNameCmps = explode(".", $fileName);
    $fileExtension = strtolower(end($fileNameCmps));

    // Sanitize and rename file
    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
    $dest_path = $uploadDir . $newFileName;

    $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
    if (in_array($fileExtension, $allowedfileExtensions)) {
        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            // Save relative URL for frontend usage
            $image_url = 'uploads/merchandise/' . $newFileName;
        } else {
            echo json_encode(['success' => false, 'error' => 'Error moving uploaded file']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid file extension']);
        exit;
    }
}

// Helper to handle variant image uploads
$handleVariantUpload = function($fileKey) use ($uploadDir) {
    if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES[$fileKey]['tmp_name'];
        $fileName = $_FILES[$fileKey]['name'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));
        $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
        if (in_array($fileExtension, $allowedfileExtensions)) {
            $newFileName = md5(time() . '_' . uniqid() . '_' . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadDir . $newFileName;
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                return 'uploads/merchandise/' . $newFileName;
            }
        }
    }
    return null;
};

try {
    $db->beginTransaction();

    $is_edit = isset($_POST['product_id']) && !empty($_POST['product_id']);

    if ($is_edit) {
        $product_id = $_POST['product_id'];
        
        if ($image_url !== '') {
            $stmt = $db->prepare("UPDATE products SET name = :name, description = :description, base_price = :base_price, image_url = :image_url WHERE id = :id");
            $stmt->execute([
                ':name' => $_POST['name'],
                ':description' => $_POST['description'] ?? '',
                ':base_price' => $_POST['base_price'],
                ':image_url' => $image_url,
                ':id' => $product_id
            ]);
        } else {
            $stmt = $db->prepare("UPDATE products SET name = :name, description = :description, base_price = :base_price WHERE id = :id");
            $stmt->execute([
                ':name' => $_POST['name'],
                ':description' => $_POST['description'] ?? '',
                ':base_price' => $_POST['base_price'],
                ':id' => $product_id
            ]);
        }
    } else {
        $stmt = $db->prepare("INSERT INTO products (name, description, base_price, image_url) VALUES (:name, :description, :base_price, :image_url)");
        $stmt->execute([
            ':name' => $_POST['name'],
            ':description' => $_POST['description'] ?? '',
            ':base_price' => $_POST['base_price'],
            ':image_url' => $image_url
        ]);
        
        $product_id = $db->lastInsertId();
    }

    // Determine the actual column name for stock (stock_quantity in schema, fallback to stock if altered)
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

    if (isset($_POST['variants'])) {
        $variants = json_decode($_POST['variants'], true);
        if (is_array($variants)) {
            if ($is_edit) {
                // Collect existing variant IDs that were submitted
                $incoming_variant_ids = [];
                foreach ($variants as $variant) {
                    if (!empty($variant['id'])) {
                        $incoming_variant_ids[] = (int)$variant['id'];
                    }
                }

                // Delete variants belonging to this product that were removed by the admin,
                // but ONLY if they are NOT referenced in order_items (to prevent foreign key constraint violations)
                if (!empty($incoming_variant_ids)) {
                    $placeholders = implode(',', array_fill(0, count($incoming_variant_ids), '?'));
                    $del_sql = "DELETE FROM product_variants 
                                WHERE product_id = ? 
                                  AND id NOT IN ($placeholders)
                                  AND id NOT IN (SELECT DISTINCT product_variant_id FROM order_items)";
                    $del_params = array_merge([$product_id], $incoming_variant_ids);
                    $stmt_del = $db->prepare($del_sql);
                    $stmt_del->execute($del_params);
                } else {
                    $del_sql = "DELETE FROM product_variants 
                                WHERE product_id = ? 
                                  AND id NOT IN (SELECT DISTINCT product_variant_id FROM order_items)";
                    $stmt_del = $db->prepare($del_sql);
                    $stmt_del->execute([$product_id]);
                }

                // Prepare Update-in-Place and Insert statements
                $stmt_update = $db->prepare("UPDATE product_variants 
                                             SET color = :color, size = :size, price = :price, {$stock_col} = :stock, image_url = :image_url 
                                             WHERE id = :id AND product_id = :product_id");

                $stmt_insert = $db->prepare("INSERT INTO product_variants 
                                             (product_id, color, size, price, {$stock_col}, image_url) 
                                             VALUES (:product_id, :color, :size, :price, :stock, :image_url)");

                foreach ($variants as $idx => $variant) {
                    $color = trim($variant['color'] ?? '');
                    $size = trim($variant['size'] ?? '');
                    if ($color === '' || $size === '') {
                        continue;
                    }

                    $price = $variant['price_adjustment'] ?? ($variant['price'] ?? 0);
                    $stock = $variant['stock'] ?? ($variant['stock_quantity'] ?? 10);

                    // Resolve variant image URL: check uploaded file, then existing image_url, else null
                    $variant_img_url = null;
                    $fileKey = !empty($variant['image_key']) ? $variant['image_key'] : ('variant_image_' . $idx);
                    $uploadedUrl = $handleVariantUpload($fileKey);
                    if ($uploadedUrl !== null) {
                        $variant_img_url = $uploadedUrl;
                    } else if (isset($variant['image_url'])) {
                        $clean = trim($variant['image_url']);
                        $clean = preg_replace('#^/+#', '', $clean);
                        $clean = preg_replace('#^jen/+#', '', $clean);
                        $clean = preg_replace('#^(uploads/+)+#', 'uploads/', $clean);
                        $variant_img_url = !empty($clean) ? $clean : null;
                    }

                    if (!empty($variant['id'])) {
                        // Update existing variant in place
                        $stmt_update->execute([
                            ':color' => $color,
                            ':size' => $size,
                            ':price' => $price,
                            ':stock' => $stock,
                            ':image_url' => $variant_img_url,
                            ':id' => $variant['id'],
                            ':product_id' => $product_id
                        ]);
                    } else {
                        // Insert new variant added during edit
                        $stmt_insert->execute([
                            ':product_id' => $product_id,
                            ':color' => $color,
                            ':size' => $size,
                            ':price' => $price,
                            ':stock' => $stock,
                            ':image_url' => $variant_img_url
                        ]);
                    }
                }
            } else {
                // Brand new product: insert all variants
                $stmt_variant = $db->prepare("INSERT INTO product_variants (product_id, color, size, price, {$stock_col}, image_url) VALUES (:product_id, :color, :size, :price, :stock, :image_url)");
                foreach ($variants as $idx => $variant) {
                    $color = trim($variant['color'] ?? '');
                    $size = trim($variant['size'] ?? '');
                    if ($color === '' || $size === '') {
                        continue;
                    }

                    $variant_img_url = null;
                    $fileKey = !empty($variant['image_key']) ? $variant['image_key'] : ('variant_image_' . $idx);
                    $uploadedUrl = $handleVariantUpload($fileKey);
                    if ($uploadedUrl !== null) {
                        $variant_img_url = $uploadedUrl;
                    } else if (isset($variant['image_url'])) {
                        $clean = trim($variant['image_url']);
                        $clean = preg_replace('#^/+#', '', $clean);
                        $clean = preg_replace('#^jen/+#', '', $clean);
                        $clean = preg_replace('#^(uploads/+)+#', 'uploads/', $clean);
                        $variant_img_url = !empty($clean) ? $clean : null;
                    }

                    $stmt_variant->execute([
                        ':product_id' => $product_id,
                        ':color' => $color,
                        ':size' => $size,
                        ':price' => $variant['price_adjustment'] ?? ($variant['price'] ?? 0),
                        ':stock' => $variant['stock'] ?? ($variant['stock_quantity'] ?? 10),
                        ':image_url' => $variant_img_url
                    ]);
                }
            }
        }
    }

    $db->commit();
    echo json_encode(['success' => true, 'message' => 'Product saved successfully', 'product_id' => $product_id]);
} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
