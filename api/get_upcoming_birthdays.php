<?php
/**
 * Get Upcoming Birthdays API
 * GET /api/get_upcoming_birthdays.php
 * 
 * Returns list of upcoming member birthdays
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

// Require authentication
$user = authenticate();

try {
    $data = [];
    
    // Get my birthday info
    $stmt = $db->prepare("
        SELECT dob
        FROM member
        WHERE id = :member_id
    ");
    $stmt->execute([':member_id' => $user['member_id']]);
    $myInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $data['my_birthday'] = null;
    if ($myInfo && $myInfo['dob']) {
        $dob = new DateTime($myInfo['dob']);
        $today = new DateTime();
        $thisYearBirthday = new DateTime($today->format('Y') . '-' . $dob->format('m-d'));
        
        // If birthday passed this year, calculate next year
        if ($thisYearBirthday < $today) {
            $thisYearBirthday->modify('+1 year');
        }
        
        $daysUntil = $today->diff($thisYearBirthday)->days;
        
        $data['my_birthday'] = [
            'date' => $dob->format('Y-m-d'),
            'month_day' => $dob->format('F j'),
            'days_until' => $daysUntil,
            'is_today' => $daysUntil === 0
        ];
    }
    
    // Get upcoming birthdays (next 30 days)
    // This query finds members whose birthday falls in the next 30 days
    $stmt = $db->query("
        SELECT 
            id,
            first_name,
            last_name,
            dob,
            phone_no,
            email,
            DAYOFYEAR(CONCAT(YEAR(CURDATE()), '-', MONTH(dob), '-', DAY(dob))) as birthday_day,
            DAYOFYEAR(CURDATE()) as today_day
        FROM member
        WHERE dob IS NOT NULL
        HAVING 
            (birthday_day >= today_day AND birthday_day <= today_day + 30)
            OR (birthday_day + 365 >= today_day AND birthday_day + 365 <= today_day + 30)
        ORDER BY 
            CASE 
                WHEN birthday_day >= today_day THEN birthday_day - today_day
                ELSE birthday_day + 365 - today_day
            END
        LIMIT 20
    ");
    $upcomingBirthdays = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the birthdays
    $data['upcoming_birthdays'] = [];
    $today = new DateTime();
    
    foreach ($upcomingBirthdays as $member) {
        if (!$member['dob']) continue;
        
        $dob = new DateTime($member['dob']);
        $thisYearBirthday = new DateTime($today->format('Y') . '-' . $dob->format('m-d'));
        
        if ($thisYearBirthday < $today) {
            $thisYearBirthday->modify('+1 year');
        }
        
        $daysUntil = $today->diff($thisYearBirthday)->days;
        
        $data['upcoming_birthdays'][] = [
            'id' => $member['id'],
            'name' => $member['first_name'] . ' ' . $member['last_name'],
            'first_name' => $member['first_name'],
            'last_name' => $member['last_name'],
            'birthday' => $dob->format('F j'),
            'phone' => $member['phone_no'],
            'email' => $member['email'],
            'days_until' => $daysUntil,
            'is_today' => $daysUntil === 0,
            'is_this_week' => $daysUntil <= 7
        ];
    }
    
    // Count birthdays this month
    $stmt = $db->query("
        SELECT COUNT(*) as count
        FROM member
        WHERE MONTH(dob) = MONTH(CURDATE())
        AND dob IS NOT NULL
    ");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $data['birthdays_this_month'] = intval($result['count']);
    
    apiSuccess($data, 'Birthdays retrieved successfully');
    
} catch (PDOException $e) {
    error_log("Birthdays API error: " . $e->getMessage());
    apiError('Failed to retrieve birthdays', 500);
}
