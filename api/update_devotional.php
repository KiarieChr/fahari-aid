<?php
/**
 * Update Devotional API
 * POST /api/update_devotional.php
 * 
 * Request body:
 * {
 *   "id": 1,
 *   "title": "Updated Title",
 *   "slug": "updated-title",
 *   "devotional_date": "2026-03-25",
 *   "scripture_reference": "John 3:16",
 *   "scripture_text": "For God so loved...",
 *   "message": "<p>Updated content</p>",
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

$id = (int)($body['id'] ?? 0);

if ($id <= 0) {
    apiError('Devotional ID is required', 400);
}

try {
    // Check devotional exists
    $stmt = $db->prepare("SELECT id FROM devotionals WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if (!$stmt->fetch()) {
        apiError('Devotional not found', 404);
    }

    // Build update fields
    $allowedFields = ['title', 'slug', 'devotional_date', 'scripture_reference', 'scripture_text', 'message', 'kingdom_insight', 'prayer', 'author_id', 'featured_image', 'status'];
    $setClauses = [];
    $params = [':id' => $id];

    foreach ($allowedFields as $field) {
        if (isset($body[$field])) {
            $setClauses[] = "$field = :$field";
            if ($field === 'author_id') {
                $params[":$field"] = (int)$body[$field] ?: null;
            } elseif ($field === 'status') {
                $params[":$field"] = in_array($body[$field], ['draft', 'published']) ? $body[$field] : 'draft';
            } else {
                $params[":$field"] = is_string($body[$field]) ? trim($body[$field]) : $body[$field];
            }
        }
    }

    if (empty($setClauses)) {
        apiError('No fields to update', 400);
    }

    // If slug changed, check uniqueness
    if (isset($body['slug'])) {
        $slugCheck = $db->prepare("SELECT id FROM devotionals WHERE slug = :slug AND id != :check_id");
        $slugCheck->execute([':slug' => trim($body['slug']), ':check_id' => $id]);
        if ($slugCheck->fetch()) {
            apiError('Slug is already in use', 409);
        }
    }

    $setClauses[] = "updated_at = NOW()";
    $sql = "UPDATE devotionals SET " . implode(', ', $setClauses) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    apiSuccess(null, 'Devotional updated successfully');

} catch (PDOException $e) {
    error_log("Update devotional error: " . $e->getMessage());
    apiError('Failed to update devotional', 500);
}
