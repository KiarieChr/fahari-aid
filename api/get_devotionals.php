<?php
/**
 * Get Devotionals API
 * GET /api/get_devotionals.php
 * 
 * Query params: limit, page, featured (0|1)
 */

require_once __DIR__ . '/config.php';

try {
    $limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));
    $page = max(1, (int)($_GET['page'] ?? 1));
    $featured = (int)($_GET['featured'] ?? 0);
    $offset = ($page - 1) * $limit;

    // Status filter: all | published | draft  (default = published for public, all for admin)
    $statusParam = $_GET['status'] ?? 'published';
    $params = [];

    if ($statusParam === 'all') {
        $where = "WHERE 1=1";
    } elseif ($statusParam === 'draft') {
        $where = "WHERE d.status = 'draft'";
    } else {
        $where = "WHERE d.status = 'published'";
    }

    if ($featured) {
        $where .= " AND d.featured = 1";
    }

    // Count total
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM devotionals d $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['total'];

    // Fetch devotionals with author
    $stmt = $db->prepare("
        SELECT 
            d.id, d.title, d.slug,
            d.scripture_text, d.scripture_reference,
            d.featured_image, d.message,
            d.kingdom_insight, d.prayer,
            DATE_FORMAT(d.devotional_date, '%M %d, %Y') AS date_formatted,
            LEFT(REGEXP_REPLACE(d.message, '<[^>]*>', ''), 200) AS message_preview,
            DAYNAME(d.devotional_date) AS day_name,
            d.devotional_date AS date,
            d.status,
            da.id AS author_id,
            da.name AS author_name
        FROM devotionals d
        LEFT JOIN devotional_authors da ON d.author_id = da.id
        $where
        ORDER BY d.devotional_date DESC
        LIMIT :limit OFFSET :offset
    ");
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $devotionals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get categories for each devotional
    foreach ($devotionals as &$dev) {
        $dev['author'] = [
            'id' => (int)$dev['author_id'],
            'name' => $dev['author_name']
        ];
        unset($dev['author_id'], $dev['author_name']);

        try {
            $catStmt = $db->prepare("
                SELECT dc.id, dc.name
                FROM devotional_categories dc
                JOIN devotional_category_map dcm ON dc.id = dcm.category_id
                WHERE dcm.devotional_id = :dev_id
            ");
            $catStmt->execute([':dev_id' => $dev['id']]);
            $dev['categories'] = $catStmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $dev['categories'] = [];
        }
    }

    echo json_encode([
        'success' => true,
        'devotionals' => $devotionals,
        'pagination' => [
            'total'        => $total,
            'total_count'  => $total,
            'total_pages'  => (int)ceil($total / $limit),
            'current_page' => $page,
            'page'         => $page,
            'limit'        => $limit,
            'has_more'     => ($page * $limit) < $total
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get devotionals error: " . $e->getMessage());
    apiError('Failed to retrieve devotionals', 500);
}
