<?php

// file to make changes to the database without going to the database shell
// make connection
include('../includes/connection.php');

try{
    echo "Starting database synchronization...<br><br>";
    
    // Check if committed_members table already exists
    echo "Checking for committed_members table...<br>";
    
    $tableExists = $db->query("SHOW TABLES LIKE 'committed_members'")->rowCount() > 0;
    
    if($tableExists) {
        echo "Committed_members table already exists. Updating structure if needed...<br>";
        
        // Check if all required columns exist
        $requiredColumns = [
            'id' => 'BIGINT',
            'member_id' => 'BIGINT',
            'full_name' => 'VARCHAR(150)',
            'phone' => 'VARCHAR(30)',
            'email' => 'VARCHAR(150)',
            'residence' => 'VARCHAR(150)',
            'committed_on' => 'DATE',
            'created_at' => 'TIMESTAMP'
        ];
        
        $stmt = $db->query("DESCRIBE committed_members");
        $existingColumns = [];
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $existingColumns[$row['Field']] = $row['Type'];
        }
        
        // Add missing columns
        foreach($requiredColumns as $column => $type) {
            if(!array_key_exists($column, $existingColumns)) {
                echo "Adding missing column: {$column}...<br>";
                if($column == 'id') {
                    // Skip ID column as it's the primary key
                    continue;
                } elseif($column == 'created_at') {
                    $db->query("ALTER TABLE committed_members ADD COLUMN {$column} {$type} DEFAULT CURRENT_TIMESTAMP");
                } else {
                    $nullStatus = in_array($column, ['member_id', 'email', 'residence', 'committed_on']) ? 'NULL' : 'NOT NULL';
                    $db->query("ALTER TABLE committed_members ADD COLUMN {$column} {$type} {$nullStatus}");
                }
                echo "Column {$column} added successfully<br>";
            }
        }
        
        echo "Committed_members table structure verified<br>";
    } else {
        // Create the table if it doesn't exist
        echo "Creating committed_members table...<br>";
        
        $createTableSQL = "CREATE TABLE committed_members (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            member_id BIGINT NULL,
            full_name VARCHAR(150) NOT NULL,
            phone VARCHAR(30) NOT NULL,
            email VARCHAR(150) NULL,
            residence VARCHAR(150) NULL,
            committed_on DATE NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $db->query($createTableSQL);
        echo "Committed_members table created successfully<br>";
    }
    
    echo "..............................<br><br>";
    
    // Create indexes for better performance
    echo "Creating/verifying indexes...<br>";
    
    $indexes = [
        'idx_committed_members_phone' => 'CREATE INDEX idx_committed_members_phone ON committed_members(phone)',
        'idx_committed_members_email' => 'CREATE INDEX idx_committed_members_email ON committed_members(email)',
        'idx_committed_members_member_id' => 'CREATE INDEX idx_committed_members_member_id ON committed_members(member_id)',
        'idx_committed_members_created_at' => 'CREATE INDEX idx_committed_members_created_at ON committed_members(created_at)'
    ];
    
    foreach($indexes as $indexName => $createSQL) {
        try {
            $db->query($createSQL);
            echo "Index {$indexName} created successfully<br>";
        } catch(Exception $e) {
            echo "Index {$indexName} may already exist or error: " . $e->getMessage() . "<br>";
        }
    }
    
    echo "..............................<br><br>";
    
    // Check if members table exists before adding foreign key
    echo "Checking for members table...<br>";
    $membersTableExists = $db->query("SHOW TABLES LIKE 'member'")->rowCount() > 0;
    
    if($membersTableExists) {
        // Add foreign key constraint if members table exists
        echo "Adding foreign key constraint to members table...<br>";
        try {
            // First, check if the foreign key already exists
            $fkExists = false;
            try {
                $stmt = $db->query("
                    SELECT CONSTRAINT_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_NAME = 'committed_members' 
                    AND COLUMN_NAME = 'member_id' 
                    AND CONSTRAINT_NAME != 'PRIMARY'
                ");
                if($stmt->rowCount() > 0) {
                    $fkExists = true;
                }
            } catch(Exception $e) {
                // Ignore error, just proceed to create FK
            }
            
            if(!$fkExists) {
                $db->query("ALTER TABLE committed_members 
                           ADD CONSTRAINT fk_committed_members_member_id 
                           FOREIGN KEY (member_id) REFERENCES members(id) 
                           ON DELETE SET NULL ON UPDATE CASCADE");
                echo "Foreign key constraint added successfully<br>";
            } else {
                echo "Foreign key constraint already exists<br>";
            }
        } catch(Exception $e) {
            echo "Error adding foreign key: " . $e->getMessage() . "<br>";
            echo "This is not critical - table will work without foreign key<br>";
        }
    } else {
        echo "Members table not found. Skipping foreign key constraint...<br>";
        echo "Note: You can create the members table later and then run this script again to add the foreign key.<br>";
    }
    
    echo "..............................<br><br>";
    
    // Display table structure
    echo "Displaying committed_members table structure:<br>";
    echo "<table border='1' cellpadding='5' cellspacing='0'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    $stmt = $db->query("DESCRIBE committed_members");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>";
        echo "<td>{$row['Field']}</td>";
        echo "<td>{$row['Type']}</td>";
        echo "<td>{$row['Null']}</td>";
        echo "<td>{$row['Key']}</td>";
        echo "<td>{$row['Default']}</td>";
        echo "<td>{$row['Extra']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<br><strong style='color: green;'>Database synchronization completed successfully!</strong><br>";
    echo "<br>Summary:<br>";
    echo "1. Committed_members table created/verified<br>";
    echo "2. Indexes added for performance<br>";
    echo "3. Foreign key constraint attempted (if members table exists)<br>";
    echo "4. Table structure displayed above<br>";

}
catch(Exception $e){
    echo "<strong style='color: red;'>An error occurred during syncing: " . $e->getMessage() . "</strong>";
}

?>