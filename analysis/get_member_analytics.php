<?php

// File: api/get_member_analytics.php

header( 'Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../includes/connection.php'; // <-- Make sure $db is your PDO connection

try {
    $analytics = [];

    // 1. OVERALL STATISTICS
    $stmt = $db->query(      "
        SELECT 
            COUNT(*) AS total_members,
            SUM(CASE WHEN delete_status = 'Active' THEN 1 ELSE 0 END) AS active_members,
            SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
            SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female_count
        FROM member
    ");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    $male = (int)($stats['male_count'] ?? 0);
    $female = (int)($stats['female_count'] ?? 0);
    $ratio = $female > 0 ? round($male / $female, 2) . ':1' : $male . ':0';

    $analytics['statistics'] = [
        'total_members' => (int)$stats['total_members'],
        'active_members' => (int)$stats['active_members'],
        'male' => $male,
        'female' => $female,
        'gender_ratio' => $ratio
    ];

    // 2. GENDER DISTRIBUTION
    $stmt = $db->query("
        SELECT gender, COUNT(*) AS count
        FROM member
        WHERE gender IS NOT NULL AND gender != ''
        GROUP BY gender
        ORDER BY count DESC
    ");
    $analytics['gender_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. MARITAL STATUS DISTRIBUTION
    $stmt = $db->query("
        SELECT marital, COUNT(*) AS count
        FROM member
        WHERE marital IS NOT NULL AND marital != ''
        GROUP BY marital
        ORDER BY count DESC
    ");
    $analytics['marital_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. EMPLOYMENT STATUS DISTRIBUTION
    $stmt = $db->query("
        SELECT emp_status, COUNT(*) AS count
        FROM member
        WHERE emp_status IS NOT NULL AND emp_status != ''
        GROUP BY emp_status
        ORDER BY count DESC
    ");
    $analytics['employment_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. EDUCATION / STUDY LEVEL DISTRIBUTION
    $stmt = $db->query("
        SELECT study_level, COUNT(*) AS count
        FROM member
        WHERE study_level IS NOT NULL AND study_level != ''
        GROUP BY study_level
        ORDER BY count DESC
    ");
    $analytics['education_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. MEMBERS BY DEPARTMENT
    $stmt = $db->query("
        SELECT department, COUNT(*) AS count
        FROM member
        WHERE department IS NOT NULL AND department != ''
        GROUP BY department
        ORDER BY count DESC
    ");
    $analytics['department_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // 7. MEMBERS BY LOCATION
    $stmt = $db->query("
        SELECT location, COUNT(*) AS count
        FROM member
        WHERE location IS NOT NULL AND location != ''
        GROUP BY location
        ORDER BY count DESC
        LIMIT 10
    ");
    $analytics['top_locations'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 8. AGE DISTRIBUTION
    $stmt = $db->query("
        SELECT 
            CASE
                WHEN TIMESTAMPDIFF(YEAR, bod, CURDATE()) BETWEEN 0 AND 17 THEN 'Below 18'
                WHEN TIMESTAMPDIFF(YEAR, bod, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
                WHEN TIMESTAMPDIFF(YEAR, bod, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
                WHEN TIMESTAMPDIFF(YEAR, bod, CURDATE()) BETWEEN 36 AND 45 THEN '36-45'
                WHEN TIMESTAMPDIFF(YEAR, bod, CURDATE()) BETWEEN 46 AND 60 THEN '46-60'
                ELSE '60+'
            END AS age_group,
            COUNT(*) AS count
        FROM member
        WHERE bod IS NOT NULL
        GROUP BY age_group
        ORDER BY count DESC
    ");
    $analytics['age_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 9. NEW MEMBERS BY MONTH (JOINED_ON)
    $stmt = $db->query("
        SELECT 
            DATE_FORMAT(joined_on, '%Y-%m') AS month,
            COUNT(*) AS count
        FROM member
        WHERE joined_on IS NOT NULL
        GROUP BY DATE_FORMAT(joined_on, '%Y-%m')
        ORDER BY month ASC
    ");
    $analytics['monthly_trends'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 10. MEMBERS BY COUNTRY CODE
    $stmt = $db->query("
        SELECT country_code, COUNT(*) AS count
        FROM member
        WHERE country_code IS NOT NULL AND country_code != ''
        GROUP BY country_code
        ORDER BY count DESC
    ");
    $analytics['country_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 11. ACTIVE VS INACTIVE STATUS
    $stmt = $db->query("
        SELECT delete_status, COUNT(*) AS count
        FROM member
        GROUP BY delete_status
    ");
    $analytics['status_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 12. AVG AGE
    $stmt = $db->query("
        SELECT ROUND(AVG(TIMESTAMPDIFF(YEAR, bod, CURDATE())), 1) AS avg_age
        FROM member
        WHERE bod IS NOT NULL
    ");
    $analytics['average_age'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // 7️⃣ Fetch members for the table
    $membersResult = $db->query("
        SELECT id, first_name, last_name, gender, marital, phone_no, email, department, joined_on 
        FROM member 
        WHERE delete_status='Active'
        ORDER BY joined_on DESC
        LIMIT 100
    ");
    $analytics['members'] = $membersResult->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($analytics, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
