<?php
/**
 * Get Homepage Data API
 * GET /api/get_homepage_data.php
 * 
 * Returns aggregated data for the public website homepage
 */

require_once __DIR__ . '/config.php';

try {
    $data = [];
    $today = date('Y-m-d');

    // Hero section
    $data['hero'] = [
        'title' => 'Jesus Enthroned',
        'subtitle' => 'Welcome to our community'
    ];

    // Try loading hero from a settings/content table if it exists
    try {
        $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('hero_title', 'hero_subtitle')");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        if (!empty($settings['hero_title'])) {
            $data['hero']['title'] = $settings['hero_title'];
        }
        if (!empty($settings['hero_subtitle'])) {
            $data['hero']['subtitle'] = $settings['hero_subtitle'];
        }
    } catch (PDOException $e) {
        // site_settings table doesn't exist, use defaults
    }

    // Announcements
    try {
        $stmt = $db->query("
            SELECT title, message, DATE_FORMAT(created_at, '%M %d, %Y') AS date
            FROM announcements
            WHERE (expires_at IS NULL OR expires_at >= CURDATE())
            ORDER BY created_at DESC
            LIMIT 5
        ");
        $data['announcements'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $data['announcements'] = [];
    }

    // Calendar schedule (next 7 days of events + meetings)
    $schedule = [];
    try {
        $stmt = $db->prepare("
            SELECT ename AS event, 
                   COALESCE(start_time, '09:00') AS time,
                   DATE_FORMAT(start_date, '%M %d') AS date
            FROM event
            WHERE start_date BETWEEN :today AND DATE_ADD(:today2, INTERVAL 7 DAY)
            ORDER BY start_date ASC, start_time ASC
            LIMIT 5
        ");
        $stmt->execute([':today' => $today, ':today2' => $today]);
        $schedule = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // No events
    }

    try {
        $stmt = $db->prepare("
            SELECT name AS event,
                   TIME_FORMAT(start_time, '%H:%i') AS time,
                   DATE_FORMAT(start_time, '%M %d') AS date
            FROM meeting
            WHERE DATE(start_time) BETWEEN :today AND DATE_ADD(:today2, INTERVAL 7 DAY)
            ORDER BY start_time ASC
            LIMIT 5
        ");
        $stmt->execute([':today' => $today, ':today2' => $today]);
        $meetingSchedule = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $schedule = array_merge($schedule, $meetingSchedule);
    } catch (PDOException $e) {
        // No meetings
    }

    $data['calendar_schedule'] = array_slice($schedule, 0, 5);

    // Sermons
    try {
        $stmt = $db->query("
            SELECT title, speaker, DATE_FORMAT(sermon_date, '%M %d, %Y') AS date
            FROM sermons
            ORDER BY sermon_date DESC
            LIMIT 3
        ");
        $data['sermons'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $data['sermons'] = [];
    }

    // Featured event
    try {
        $stmt = $db->prepare("
            SELECT ename AS name, 
                   DATE_FORMAT(start_date, '%M %d, %Y') AS date,
                   image
            FROM event
            WHERE start_date >= :today
            ORDER BY start_date ASC
            LIMIT 1
        ");
        $stmt->execute([':today' => $today]);
        $data['featured_event'] = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    } catch (PDOException $e) {
        $data['featured_event'] = null;
    }

    apiSuccess($data, 'Homepage data retrieved');

} catch (PDOException $e) {
    error_log("Homepage data error: " . $e->getMessage());
    apiError('Failed to retrieve homepage data', 500);
}
