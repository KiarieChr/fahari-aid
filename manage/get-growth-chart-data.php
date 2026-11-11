<?php
require '../includes/connection.php';

header('Content-Type: application/json');

try {
    // 1. Growth over time (joined_on grouped by month)
    // Filter out invalid/null dates and group
    $growth_stmt = $db->query("
        SELECT DATE_FORMAT(joined_on, '%Y-%m') AS month, COUNT(*) AS count 
        FROM member 
        WHERE joined_on IS NOT NULL AND joined_on != '0000-00-00 00:00:00'
        GROUP BY month 
        ORDER BY month ASC
    ");
    $growth = $growth_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Gender distribution
    $gender_stmt = $db->query("
        SELECT COALESCE(NULLIF(gender, ''), 'Not Specified') AS gender, COUNT(*) AS count 
        FROM member 
        GROUP BY gender
    ");
    $gender = $gender_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Marital distribution
    $marital_stmt = $db->query("
        SELECT COALESCE(NULLIF(marital, ''), 'Not Specified') AS marital, COUNT(*) AS count 
        FROM member 
        GROUP BY marital
    ");
    $marital = $marital_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Employment status distribution
    $emp_stmt = $db->query("
        SELECT COALESCE(NULLIF(emp_status, ''), 'Not Specified') AS emp_status, COUNT(*) AS count 
        FROM member 
        GROUP BY emp_status
    ");
    $emp = $emp_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Departmental distribution
    $dept_stmt = $db->query("
        SELECT COALESCE(d.name, 'Unassigned') AS dept_name, COUNT(m.id) AS count 
        FROM member m 
        LEFT JOIN departments d ON m.department_id = d.id 
        GROUP BY dept_name
        ORDER BY count DESC
    ");
    $departments = $dept_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. Cell Group distribution
    $cell_stmt = $db->query("
        SELECT COALESCE(c.name, 'Unassigned') AS cell_name, COUNT(m.id) AS count 
        FROM member m 
        LEFT JOIN cells c ON m.cell_id = c.id 
        GROUP BY cell_name
        ORDER BY count DESC
    ");
    $cells = $cell_stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'growth' => $growth,
            'gender' => $gender,
            'marital' => $marital,
            'emp_status' => $emp,
            'departments' => $departments,
            'cells' => $cells
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
