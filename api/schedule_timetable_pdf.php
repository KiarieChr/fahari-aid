<?php
/**
 * Event Program Timetable PDF (Clean printable format)
 * GET /api/schedule_timetable_pdf.php?event_id=X
 * 
 * A modern, clean timetable layout — designed to be printed and handed to attendees
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/../tcpdf/tcpdf.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
if ($eventId <= 0) {
    apiError('Event ID is required', 400);
}

try {
    $stmt = $db->prepare("SELECT id, ename, start_date, end_date, branch as venue, notes FROM event WHERE id = :id");
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$event) apiError('Event not found', 404);

    $stmt = $db->prepare("
        SELECT * FROM event_schedule WHERE event_id = :eid
        ORDER BY day_number ASC, sort_order ASC, start_time ASC
    ");
    $stmt->execute([':eid' => $eventId]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($sessions)) {
        apiError('No schedule data found', 404);
    }

    $startDate = new DateTime($event['start_date']);
    $endDate = new DateTime($event['end_date'] ?: $event['start_date']);
    $totalDays = max(1, $endDate->diff($startDate)->days + 1);

    // Group by day
    $byDay = [];
    foreach ($sessions as $s) {
        $byDay[(int)$s['day_number']][] = $s;
    }

    // Type styling
    $typeColors = [
        'worship'      => [139, 92, 246],
        'teaching'     => [59, 130, 246],
        'prayer'       => [16, 185, 129],
        'break'        => [156, 163, 175],
        'meal'         => [245, 158, 11],
        'registration' => [6, 182, 212],
        'panel'        => [236, 72, 153],
        'activity'     => [249, 115, 22],
        'announcement' => [99, 102, 241],
        'other'        => [107, 114, 128],
    ];
    $typeLabels = [
        'worship' => 'WORSHIP', 'teaching' => 'TEACHING', 'prayer' => 'PRAYER',
        'break' => 'BREAK', 'meal' => 'MEAL', 'registration' => 'REGISTRATION',
        'panel' => 'PANEL', 'activity' => 'ACTIVITY', 'announcement' => 'ANNOUNCEMENT',
        'other' => 'OTHER'
    ];

    // ─── Build PDF ─────────────────────────────────────────────

    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator('JEN Portal');
    $pdf->SetAuthor('Jesus Enthroned Network');
    $pdf->SetTitle($event['ename'] . ' — Program');
    $pdf->SetMargins(12, 12, 12);
    $pdf->SetAutoPageBreak(true, 15);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);

    $pw = $pdf->getPageWidth();
    $w = $pw - 24; // usable width

    // ══════════════════════════════════════════════════════════
    // COVER / HEADER PAGE
    // ══════════════════════════════════════════════════════════

    $pdf->AddPage();

    // Full-width gradient-style header block
    $pdf->SetFillColor(30, 22, 54);
    $pdf->Rect(0, 0, $pw, 80, 'F');

    // Accent stripe
    $pdf->SetFillColor(139, 92, 246);
    $pdf->Rect(0, 80, $pw, 2, 'F');

    // Logo
    $logoPath = __DIR__ . '/../assets/img/logo/logo-dark.jpeg';
    if (file_exists($logoPath)) {
        $pdf->Image($logoPath, ($pw - 35) / 2, 10, 35, 0, 'JPEG', '', 'T', false, 300);
    }

    // Event name
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 24);
    $pdf->SetXY(12, 48);
    $pdf->Cell($w, 12, strtoupper($event['ename']), 0, 1, 'C');

    // Subtitle
    $eventDateStr = date('F j, Y', strtotime($event['start_date']));
    if ($event['end_date'] && $event['end_date'] !== $event['start_date']) {
        $eventDateStr .= ' – ' . date('F j, Y', strtotime($event['end_date']));
    }
    $venue = $event['venue'] ?: '';

    $pdf->SetFont('helvetica', '', 11);
    $pdf->SetTextColor(200, 200, 220);
    $pdf->SetXY(12, 62);
    $pdf->Cell($w, 7, $eventDateStr, 0, 1, 'C');
    if ($venue) {
        $pdf->SetXY(12, 69);
        $pdf->Cell($w, 7, $venue, 0, 1, 'C');
    }

    $pdf->SetY(90);

    // "PROGRAM" label
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->SetTextColor(30, 22, 54);
    $pdf->Cell($w, 8, 'EVENT PROGRAM', 0, 1, 'C');
    $pdf->Ln(2);

    // Decorative divider
    $divX = ($pw - 40) / 2;
    $pdf->SetFillColor(139, 92, 246);
    $pdf->Rect($divX, $pdf->GetY(), 40, 0.8, 'F');
    $pdf->Ln(6);

    // ── Legend ──
    $pdf->SetFont('helvetica', '', 6.5);
    $legendTypes = array_unique(array_column($sessions, 'session_type'));
    $legendX = 12;
    $legendStartY = $pdf->GetY();
    // Center the legend
    $totalLegendW = 0;
    foreach ($legendTypes as $lt) {
        $totalLegendW += $pdf->GetStringWidth(($typeLabels[$lt] ?? $lt)) + 8;
    }
    $legendX = max(12, ($pw - $totalLegendW) / 2);

    foreach ($legendTypes as $lt) {
        $c = $typeColors[$lt] ?? [107, 114, 128];
        $label = $typeLabels[$lt] ?? strtoupper($lt);
        $labelW = $pdf->GetStringWidth($label) + 6;

        if ($legendX + $labelW > $pw - 12) {
            $pdf->Ln(5);
            $legendX = 12;
        }

        $pdf->SetFillColorArray($c);
        $pdf->Rect($legendX, $pdf->GetY() + 1, 3, 3, 'F');
        $pdf->SetXY($legendX + 4, $pdf->GetY());
        $pdf->SetTextColor(80, 80, 80);
        $pdf->Cell($labelW - 4, 5, $label, 0, 0, 'L');
        $legendX = $pdf->GetX() + 3;
    }
    $pdf->Ln(8);

    // ══════════════════════════════════════════════════════════
    // SCHEDULE BY DAY
    // ══════════════════════════════════════════════════════════

    foreach ($byDay as $dayNum => $daySessions) {
        // Page break check
        if ($pdf->GetY() > 200) {
            $pdf->AddPage();
        }

        // Day header
        $dayDate = clone $startDate;
        $dayDate->modify('+' . ($dayNum - 1) . ' days');
        $dayLabel = 'DAY ' . $dayNum;
        $dayDateLabel = strtoupper($dayDate->format('l, F j, Y'));

        // Day banner
        $bannerY = $pdf->GetY();
        $pdf->SetFillColor(30, 22, 54);
        $pdf->RoundedRect(12, $bannerY, $w, 10, 2, '1001', 'F');

        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetXY(16, $bannerY + 1.5);
        $pdf->Cell(20, 7, $dayLabel, 0, 0, 'L');

        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(200, 200, 220);
        $pdf->Cell($w - 30, 7, $dayDateLabel, 0, 0, 'L');

        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetTextColor(139, 92, 246);
        $sessionCount = count($daySessions);
        $pdf->Cell(10, 7, $sessionCount . ' session' . ($sessionCount > 1 ? 's' : ''), 0, 1, 'R');

        $pdf->SetY($bannerY + 11);

        // Session rows
        foreach ($daySessions as $idx => $s) {
            $type = $s['session_type'];
            $color = $typeColors[$type] ?? [107, 114, 128];
            $isBreakType = in_array($type, ['break', 'meal']);

            $startT = date('g:i A', strtotime($s['start_time']));
            $endT = date('g:i A', strtotime($s['end_time']));
            $dur = max(0, (strtotime($s['end_time']) - strtotime($s['start_time'])) / 60);

            // Calculate row height based on content
            $hasDesc = !empty($s['description']);
            $hasSpeaker = !empty($s['speaker']);
            $hasLocation = !empty($s['location']);
            $baseH = 10;
            $metaH = ($hasSpeaker || $hasLocation) ? 4 : 0;
            $descH = $hasDesc ? min(10, $pdf->getStringHeight($w - 50, $s['description'])) : 0;
            $rowH = $baseH + $metaH + $descH;

            // Page break
            if ($pdf->GetY() + $rowH > 280) {
                $pdf->AddPage();
                // Re-draw a mini day header
                $pdf->SetFillColor(30, 22, 54);
                $pdf->RoundedRect(12, $pdf->GetY(), $w, 7, 2, '1001', 'F');
                $pdf->SetTextColor(255, 255, 255);
                $pdf->SetFont('helvetica', 'B', 8);
                $pdf->SetXY(16, $pdf->GetY() + 1);
                $pdf->Cell($w - 8, 5, $dayLabel . ' — ' . $dayDateLabel . '  (continued)', 0, 1, 'L');
                $pdf->Ln(1);
            }

            $rowY = $pdf->GetY();

            // Alternating subtle background
            if ($isBreakType) {
                $pdf->SetFillColor(250, 248, 245);
            } else if ($idx % 2 === 0) {
                $pdf->SetFillColor(252, 251, 255);
            } else {
                $pdf->SetFillColor(255, 255, 255);
            }
            $pdf->Rect(12, $rowY, $w, $rowH, 'F');

            // Left color accent bar
            $pdf->SetFillColorArray($color);
            $pdf->Rect(12, $rowY, 2.5, $rowH, 'F');

            // Time column
            $pdf->SetXY(16, $rowY + 1);
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->SetTextColor(30, 22, 54);
            $pdf->Cell(28, 4.5, $startT, 0, 0, 'L');

            // Duration pill
            $durText = round($dur) . ' min';
            $pdf->SetFont('helvetica', '', 6);
            $pdf->SetTextColor(120, 120, 120);
            $pdf->Cell(14, 4.5, $durText, 0, 0, 'L');

            // Type badge
            $typeLabel = $typeLabels[$type] ?? strtoupper($type);
            $pdf->SetFillColorArray($color);
            $badgeW = $pdf->GetStringWidth($typeLabel) + 4;
            $badgeX = $pdf->GetX();
            $pdf->SetFont('helvetica', 'B', 5.5);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->Rect($badgeX, $rowY + 1.5, $badgeW, 3.5, 'F');
            $pdf->SetXY($badgeX, $rowY + 1.3);
            $pdf->Cell($badgeW, 4, $typeLabel, 0, 0, 'C');

            // Title
            $titleX = $badgeX + $badgeW + 3;
            $pdf->SetXY($titleX, $rowY + 0.5);
            $pdf->SetFont('helvetica', 'B', 9);
            $pdf->SetTextColor(30, 22, 54);
            $maxTitleW = 12 + $w - $titleX;
            $title = mb_substr($s['title'], 0, 55);
            $pdf->Cell($maxTitleW, 5, $title, 0, 1, 'L');

            // End time (subtle)
            $pdf->SetXY(16, $rowY + 5.5);
            $pdf->SetFont('helvetica', '', 6.5);
            $pdf->SetTextColor(160, 160, 160);
            $pdf->Cell(28, 3.5, 'to ' . $endT, 0, 0, 'L');

            // Speaker & Location on same line as end time
            $metaX = $titleX;
            $pdf->SetXY($metaX, $rowY + 5.5);
            $pdf->SetFont('helvetica', 'I', 7);
            $pdf->SetTextColor(100, 100, 110);
            $metaParts = [];
            if ($hasSpeaker) $metaParts[] = '🎤 ' . $s['speaker'];
            if ($hasLocation) $metaParts[] = '📍 ' . $s['location'];
            if (!empty($metaParts)) {
                $pdf->Cell($maxTitleW, 4, implode('    ', $metaParts), 0, 1, 'L');
            }

            // Description
            if ($hasDesc) {
                $pdf->SetXY($titleX, $rowY + $baseH + $metaH - 1);
                $pdf->SetFont('helvetica', '', 7);
                $pdf->SetTextColor(130, 130, 140);
                $pdf->MultiCell($maxTitleW, 3.5, mb_substr($s['description'], 0, 200), 0, 'L');
            }

            // Bottom separator
            $bottomY = $rowY + $rowH;
            $pdf->SetDrawColor(235, 235, 240);
            $pdf->Line(16, $bottomY, 12 + $w, $bottomY);
            $pdf->SetY($bottomY + 0.5);
        }

        $pdf->Ln(6);
    }

    // ── Page footer on every page ──
    $totalPages = $pdf->getNumPages();
    for ($p = 1; $p <= $totalPages; $p++) {
        $pdf->setPage($p);
        $pdf->SetXY(12, $pdf->getPageHeight() - 12);
        $pdf->SetFont('helvetica', '', 6.5);
        $pdf->SetTextColor(180, 180, 180);
        $pdf->Cell($w / 2, 4, 'Jesus Enthroned Network', 0, 0, 'L');
        $pdf->Cell($w / 2, 4, $event['ename'] . '  |  Page ' . $p . ' of ' . $totalPages, 0, 0, 'R');
    }

    $filename = 'Timetable_' . preg_replace('/[^a-zA-Z0-9_]/', '_', $event['ename']) . '_' . date('Ymd') . '.pdf';
    $pdf->Output($filename, 'I');

} catch (PDOException $e) {
    error_log("Schedule timetable PDF error: " . $e->getMessage());
    apiError('Failed to generate timetable', 500);
}
