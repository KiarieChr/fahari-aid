<?php

// file to make changes to the database without crATINg without going to the databse shell
// make connection
include('../includes/connection.php');

try {

    $db->query('ALTER TABLE jen.member ADD COLUMN branch_id VARCHAR(100) DEFAULT 1;');

    $db->query(
        `CREATE TABLE IF NOT EXISTS organization_settings 
        (id INT PRIMARY KEY DEFAULT 1, 
        org_name VARCHAR(255), 
        head_office VARCHAR(255), 
        currency VARCHAR(10) DEFAULT 'KES', 
        church_type VARCHAR(50) DEFAULT 'Interdenominational', 
        denomination_name VARCHAR(255), 
        denomination_desc TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ); 
        INSERT IGNORE INTO organization_settings 
        (id, 
        org_name, 
        church_type)
         VALUES 
         (1, 'Fahari Eklesia', 'Interdenominational');
        CREATE TABLE IF NOT EXISTS hierarchy_levels 
        (id INT AUTO_INCREMENT PRIMARY KEY, level_order INT NOT NULL, name VARCHAR(100) NOT NULL, UNIQUE KEY (level_order)); 
        INSERT IGNORE INTO hierarchy_levels (level_order, name) VALUES (1, 'Branch'); 
        CREATE TABLE IF NOT EXISTS hierarchy_nodes (id INT AUTO_INCREMENT PRIMARY KEY, level_id INT NOT NULL, parent_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, FOREIGN KEY (level_id) REFERENCES hierarchy_levels(id) ON DELETE CASCADE, FOREIGN KEY (parent_id) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE);')`
    


    echo "Table altered suceesfully";
    echo "...........................";
} catch (Exception $e) {
    echo " An error Occured during syncing: ";
}


?>