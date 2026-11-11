<?php
/**
 * Get Member Statistics API
 * GET /api/get_member_stats.php
 * 
 * Returns member stats including demographics and gender.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $data = [];

    // Total members (active only)
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE delete_status = 'Active'");
        $data['total_members'] = (int)$stmt->fetch()['total'];
    } catch (PDOException $e) {
        $data['total_members'] = 0;
    }

    // Inactive members
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE delete_status != 'Active' OR delete_status IS NULL");
        $data['inactive_members'] = (int)$stmt->fetch()['total'];
    } catch (PDOException $e) {
        $data['inactive_members'] = 0;
    }

    // New members this month
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE delete_status = 'Active' AND MONTH(joined_on) = MONTH(CURRENT_DATE()) AND YEAR(joined_on) = YEAR(CURRENT_DATE())");
        $data['new_members_this_month'] = (int)$stmt->fetch()['total'];
    } catch (PDOException $e) {
        $data['new_members_this_month'] = 0;
    }

    // Committed members
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM committed_members");
        $data['committed_members'] = (int)$stmt->fetch()['total'];
    } catch (PDOException $e) {
        $data['committed_members'] = 0;
    }

    // Gender Distribution
    try {
        $stmt = $db->query("
            SELECT 
                SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male,
                SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female
            FROM member WHERE delete_status = 'Active'
        ");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $data['gender_distribution'] = [
            'Male' => (int)($row['male'] ?? 0),
            'Female' => (int)($row['female'] ?? 0)
        ];
    } catch (PDOException $e) {
        $data['gender_distribution'] = ['Male' => 0, 'Female' => 0];
    }

    // Demographics Breakdown using age_categories
    try {
        // We get age categories first
        $catsStmt = $db->query("SELECT * FROM age_categories ORDER BY min_age ASC");
        $categories = $catsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch ages of all active members
        $agesStmt = $db->query("
            SELECT TIMESTAMPDIFF(YEAR, bod, CURDATE()) as age 
            FROM member 
            WHERE delete_status = 'Active' AND bod IS NOT NULL AND bod != '0000-00-00'
        ");
        $ages = $agesStmt->fetchAll(PDO::FETCH_COLUMN);

        $demographics = [];
        foreach ($categories as $cat) {
            $demographics[$cat['name']] = 0;
        }
        $demographics['Unknown'] = max(0, $data['total_members'] - count($ages));

        foreach ($ages as $age) {
            if ($age === null) continue;
            $found = false;
            foreach ($categories as $cat) {
                $min = (int)$cat['min_age'];
                $max = $cat['max_age'] !== null ? (int)$cat['max_age'] : 999;
                if ($age >= $min && $age <= $max) {
                    $demographics[$cat['name']]++;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $demographics['Unknown']++;
            }
        }

        // Format for Recharts: [{ name: 'Children', value: 120 }, ...]
        $demographics_chart = [];
        foreach ($demographics as $name => $val) {
            $demographics_chart[] = ['name' => $name, 'value' => $val];
        }

        $data['demographics'] = $demographics_chart;
    } catch (PDOException $e) {
        $data['demographics'] = [];
    }

    apiSuccess($data, 'Member stats retrieved');

} catch (PDOException $e) {
    error_log("Member stats error: " . $e->getMessage());
    apiError('Failed to retrieve member statistics', 500);
}
