<?php
/**
 * Get Meeting Types API
 * GET /api/get_meeting_types.php
 * 
 * Returns distinct meeting types/categories with counts
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    // Try to get types from a meeting_types table first
    try {
        $stmt = $db->query("
            SELECT mt.id, mt.name, 
                   COUNT(m.id) AS meeting_count
            FROM meeting_types mt
            LEFT JOIN meeting m ON m.meeting_type = mt.id
            GROUP BY mt.id, mt.name
            ORDER BY mt.name ASC
        ");
        $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Fallback: derive types from the meeting table's meeting_type column
        try {
            $stmt = $db->query("
                SELECT 
                    COALESCE(m.meeting_type, 0) AS id,
                    COALESCE(
                        (SELECT mt2.name FROM meeting_types mt2 WHERE mt2.id = m.meeting_type),
                        'General'
                    ) AS name,
                    COUNT(*) AS meeting_count
                FROM meeting m
                GROUP BY m.meeting_type
                ORDER BY name ASC
            ");
            $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e2) {
            $types = [];
        }
    }

    apiSuccess(['meeting_types' => $types], 'Meeting types retrieved');

} catch (PDOException $e) {
    error_log("Meeting types error: " . $e->getMessage());
    apiError('Failed to retrieve meeting types', 500);
}
