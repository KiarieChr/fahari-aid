<?php
/**
 * Add Devotional API
 * POST /api/add_devotional.php
 * 
 * Request body:
 * {
 *   "title": "Morning Grace",
 *   "slug": "morning-grace",
 *   "devotional_date": "2026-03-25",
 *   "scripture_reference": "John 3:16",
 *   "scripture_text": "For God so loved...",
 *   "message": "<p>Content here</p>",
 *   "author_id": 1,
 *   "featured_image": "https://...",
 *   "status": "published"
 * }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$body = getJsonBody();

// Validate required fields
$title = trim($body['title'] ?? '');
$slug = trim($body['slug'] ?? '');
$devotionalDate = trim($body['devotional_date'] ?? '');

if (empty($title)) {
    apiError('Title is required', 400);
}

if (empty($slug)) {
    // Auto-generate slug from title
    $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $title));
    $slug = trim($slug, '-');
}

if (empty($devotionalDate)) {
    apiError('Devotional date is required', 400);
}

try {
    // Check slug uniqueness
    $stmt = $db->prepare("SELECT id FROM devotionals WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);
    if ($stmt->fetch()) {
        $slug .= '-' . time();
    }

    $stmt = $db->prepare("
        INSERT INTO devotionals 
        (title, slug, devotional_date, scripture_reference, scripture_text, message, kingdom_insight, prayer, author_id, featured_image, status)
        VALUES 
        (:title, :slug, :devotional_date, :scripture_reference, :scripture_text, :message, :kingdom_insight, :prayer, :author_id, :featured_image, :status)
    ");
    $stmt->execute([
        ':title' => $title,
        ':slug' => $slug,
        ':devotional_date' => $devotionalDate,
        ':scripture_reference' => trim($body['scripture_reference'] ?? ''),
        ':scripture_text' => trim($body['scripture_text'] ?? ''),
        ':message' => $body['message'] ?? '',
        ':kingdom_insight' => trim($body['kingdom_insight'] ?? '') ?: null,
        ':prayer' => trim($body['prayer'] ?? '') ?: null,
        ':author_id' => (int)($body['author_id'] ?? 0) ?: null,
        ':featured_image' => trim($body['featured_image'] ?? ''),
        ':status' => in_array($body['status'] ?? '', ['draft', 'published']) ? $body['status'] : 'draft'
    ]);

    $newId = $db->lastInsertId();

    apiSuccess(['id' => (int)$newId], 'Devotional created successfully', 201);

} catch (PDOException $e) {
    error_log("Add devotional error: " . $e->getMessage());
    apiError('Failed to create devotional', 500);
}
