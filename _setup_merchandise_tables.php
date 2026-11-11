<?php
require_once 'includes/connection.php';

try {
    $sql = "
    -- Represents the general items available
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Represents specific variations of a product
    CREATE TABLE IF NOT EXISTS product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        color VARCHAR(50),
        size VARCHAR(20),
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        image_url VARCHAR(255),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Represents the customer's order
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_contact VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        order_status ENUM('new', 'processing', 'completed', 'cancelled') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Represents the individual items within an order
    CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_variant_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
    );
    ";

    $db->exec($sql);
    echo "Tables created successfully.\n";

    // Insert some sample data to make frontend development easier
    $check_products = $db->query("SELECT COUNT(*) FROM products")->fetchColumn();
    if ($check_products == 0) {
        $db->exec("
            INSERT INTO products (name, description, base_price, image_url) VALUES 
            ('Classic Round Neck T-Shirt', 'Comfortable 100% cotton t-shirt with our logo.', 15.00, 'https://via.placeholder.com/400x400?text=Round+Neck'),
            ('Premium Hoodie', 'Warm and cozy hoodie for cold weather.', 35.00, 'https://via.placeholder.com/400x400?text=Hoodie');

            INSERT INTO product_variants (product_id, color, size, price, stock_quantity) VALUES 
            (1, 'Black', 'M', 15.00, 50),
            (1, 'Black', 'L', 15.00, 50),
            (1, 'White', 'L', 15.00, 30),
            (2, 'Navy Blue', 'L', 35.00, 20),
            (2, 'Navy Blue', 'XL', 37.00, 10);
        ");
        echo "Sample data inserted successfully.\n";
    }

} catch (PDOException $e) {
    echo "Error creating tables: " . $e->getMessage() . "\n";
}
?>
