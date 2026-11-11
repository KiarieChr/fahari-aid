<?php
/**
 * Get Single Devotional API
 * GET /api/get_devotional.php?slug={slug}
 */

require_once __DIR__ . '/config.php';

$slug = trim($_GET['slug'] ?? '');

if (empty($slug)) {
    apiError('Devotional slug is required', 400);
}

try {
    $stmt = $db->prepare("
        SELECT 
            d.id, d.title, d.slug,
            d.scripture_text, d.scripture_reference,
            d.featured_image, d.message,
            d.kingdom_insight, d.prayer,
            DATE_FORMAT(d.devotional_date, '%M %d, %Y') AS date_formatted,
            DAYNAME(d.devotional_date) AS day_name,
            d.devotional_date AS date,
            d.status,
            da.id AS author_id,
            da.name AS author_name
        FROM devotionals d
        LEFT JOIN devotional_authors da ON d.author_id = da.id
        WHERE d.slug = :slug AND d.status = 'published'
        LIMIT 1
    ");
    $stmt->execute([':slug' => $slug]);
    $devotional = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$devotional) {
        apiError('Devotional not found', 404);
    }

    $devotional['author'] = [
        'id' => (int)$devotional['author_id'],
        'name' => $devotional['author_name']
    ];
    unset($devotional['author_id'], $devotional['author_name']);

    // Get categories
    try {
        $catStmt = $db->prepare("
            SELECT dc.id, dc.name
            FROM devotional_categories dc
            JOIN devotional_category_map dcm ON dc.id = dcm.category_id
            WHERE dcm.devotional_id = :dev_id
        ");
        $catStmt->execute([':dev_id' => $devotional['id']]);
        $devotional['categories'] = $catStmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $devotional['categories'] = [];
    }

    apiSuccess(['devotional' => $devotional]);

} catch (PDOException $e) {
    error_log("Get devotional error: " . $e->getMessage());
    apiError('Failed to retrieve devotional', 500);
}
