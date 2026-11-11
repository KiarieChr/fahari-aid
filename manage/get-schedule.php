<?php
require '../includes/connection.php';
header('Content-Type: application/json');

// Fetch events from your events table
$query = $db->query("SELECT id, title, start_date AS start, end_date AS end, url, calendar_label FROM calendar");

$events = [];

while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
    $events[] = [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'start' => $row['start'],
        'end'   => $row['end'],
        'url'   => $row['url'],
        'allDay' => false, // or true if needed
        'extendedProps' => [
            'calendar' => $row['calendar_label'] // e.g., Business, Personal
        ]
    ];
}

echo json_encode($events);
