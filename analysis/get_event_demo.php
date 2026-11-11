<?php
// File: api/get_event_analytics.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../includes/connection.php';

try {
    $analytics = [];

    // 1. OVERALL STATISTICS
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_registrations,
            COUNT(DISTINCT event_id) as total_events,
            SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male_count,
            SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female_count,
            SUM(CASE WHEN serve = 1 THEN 1 ELSE 0 END) as serving_count
        FROM event_registration
    ");
    
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate gender ratio
    $male = $stats['male_count'] ?? 0;
    $female = $stats['female_count'] ?? 0;
    $ratio = $female > 0 ? round($male / $female, 2) . ':1' : $male . ':0';
    
    $analytics['statistics'] = [
        'total_registrations' => (int)$stats['total_registrations'],
        'total_events' => (int)$stats['total_events'],
        'gender_ratio' => $ratio,
        'serving_count' => (int)$stats['serving_count']
    ];

    // 2. REGISTRATIONS PER EVENT
    // You'll need to join with your events table to get event names
    // Assuming you have an 'events' table with 'id' and 'event_name' columns
    $stmt = $db->query("
        SELECT 
            er.event_id,
            COALESCE(e.ename, CONCAT('Event ', er.event_id)) as event_name,
            COUNT(*) as count
        FROM event_registration er
        LEFT JOIN event e ON er.event_id = e.id
        GROUP BY er.event_id, event_name
        ORDER BY count DESC
    ");
    
    $analytics['registrations_per_event'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. GENDER DISTRIBUTION
    $stmt = $db->query("
        SELECT 
            gender,
            COUNT(*) as count
        FROM event_registration
        WHERE gender IS NOT NULL AND gender != ''
        GROUP BY gender
        ORDER BY count DESC
    ");
    
    $analytics['gender_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. CATEGORY DISTRIBUTION
    $stmt = $db->query("
        SELECT 
            category,
            COUNT(*) as count
        FROM event_registration
        WHERE category IS NOT NULL AND category != ''
        GROUP BY category
        ORDER BY count DESC
    ");
    
    $analytics['category_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. REGISTRATION TIMELINE (Daily registrations)
    $stmt = $db->query("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM event_registration
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    
    $timeline = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates for better display
    foreach ($timeline as &$item) {
        $item['date'] = date('M d', strtotime($item['date']));
    }
    
    $analytics['registration_timeline'] = $timeline;

    // 6. TOP LOCATIONS (Residence)
    $stmt = $db->query("
        SELECT 
            residence as location,
            COUNT(*) as count
        FROM event_registration
        WHERE residence IS NOT NULL AND residence != ''
        GROUP BY residence
        ORDER BY count DESC
        LIMIT 10
    ");
    
    $analytics['top_locations'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. SPONSORSHIP DISTRIBUTION
    $stmt = $db->query("
        SELECT 
            COALESCE(sponsorship, 'Not Specified') as sponsorship,
            COUNT(*) as count
        FROM event_registration
        GROUP BY sponsorship
        ORDER BY count DESC
    ");
    
    $analytics['sponsorship_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 8. ADDITIONAL USEFUL METRICS
    
    // Serve willingness by event
    $stmt = $db->query("
        SELECT 
            er.event_id,
            COALESCE(e.ename, CONCAT('Event ', er.event_id)) as event_name,
            SUM(CASE WHEN er.serve = 1 THEN 1 ELSE 0 END) as willing_to_serve,
            COUNT(*) as total_registrations,
            ROUND((SUM(CASE WHEN er.serve = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as serve_percentage
        FROM event_registration er
        LEFT JOIN event e ON er.event_id = e.id
        GROUP BY er.event_id, event_name
        ORDER BY serve_percentage DESC
    ");
    
    $analytics['serve_willingness_by_event'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Age category distribution (if category represents age groups)
    $stmt = $db->query("
        SELECT 
            category,
            gender,
            COUNT(*) as count
        FROM event_registration
        WHERE category IS NOT NULL AND gender IS NOT NULL
        GROUP BY category, gender
        ORDER BY category, gender
    ");
    
    $analytics['category_gender_breakdown'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Traveling patterns
    $stmt = $db->query("
        SELECT 
            travelling_from as location,
            COUNT(*) as count
        FROM event_registration
        WHERE travelling_from IS NOT NULL AND travelling_from != ''
        GROUP BY travelling_from
        ORDER BY count DESC
        LIMIT 15
    ");
    
    $analytics['travelling_from_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Special needs summary
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_with_special_needs,
            COUNT(CASE WHEN special_needs IS NOT NULL AND special_needs != '' THEN 1 END) as has_special_needs
        FROM event_registration
    ");
    
    $analytics['special_needs_summary'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Registration by month (for longer-term trends)
    $stmt = $db->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as count
        FROM event_registration
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    
    $analytics['monthly_trends'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Guardian phone numbers provided (for minors)
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_with_guardian,
            COUNT(CASE WHEN guardian_telno IS NOT NULL AND guardian_telno != '' THEN 1 END) as has_guardian_contact
        FROM event_registration
    ");
    
    $analytics['guardian_contact_summary'] = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($analytics, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>