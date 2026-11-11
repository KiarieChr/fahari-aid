<?php
/**
 * Event Schedule PDF Report
 * GET /api/schedule_report_pdf.php?event_id=X
 * 
 * Generates a branded program schedule PDF with insights
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
    // Event details
    $stmt = $db->prepare("SELECT id, ename, start_date, end_date, branch as venue, target_attendees, notes FROM event WHERE id = :id");
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$event) apiError('Event not found', 404);

    // Schedule sessions
    $stmt = $db->prepare("
        SELECT * FROM event_schedule
        WHERE event_id = :eid
        ORDER BY day_number ASC, sort_order ASC, start_time ASC
    ");
    $stmt->execute([':eid' => $eventId]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($sessions)) {
        apiError('No schedule data found for this event', 404);
    }

    // ─── Compute insights ──────────────────────────────────────

    $startDate = new DateTime($event['start_date']);
    $endDate = new DateTime($event['end_date'] ?: $event['start_date']);
    $totalDays = max(1, $endDate->diff($startDate)->days + 1);

    $totalSessions = count($sessions);
    $typeCount = [];
    $speakerSessions = [];
    $dayMinutes = [];
    $totalMinutes = 0;
    $breakMinutes = 0;
    $contentMinutes = 0;
    $longestSession = null;
    $longestDuration = 0;
    $byDay = [];

    foreach ($sessions as $s) {
        $day = (int)$s['day_number'];
        $byDay[$day][] = $s;

        $type = $s['session_type'];
        $typeCount[$type] = ($typeCount[$type] ?? 0) + 1;

        $start = strtotime($s['start_time']);
        $end = strtotime($s['end_time']);
        $dur = max(0, ($end - $start) / 60);
        $totalMinutes += $dur;
        $dayMinutes[$day] = ($dayMinutes[$day] ?? 0) + $dur;

        if (in_array($type, ['break', 'meal', 'registration'])) {
            $breakMinutes += $dur;
        } else {
            $contentMinutes += $dur;
        }

        if ($dur > $longestDuration) {
            $longestDuration = $dur;
            $longestSession = $s;
        }

        $speaker = trim($s['speaker'] ?? '');
        if ($speaker) {
            $speakerSessions[$speaker] = ($speakerSessions[$speaker] ?? 0) + 1;
        }
    }

    arsort($speakerSessions);
    $speakerCount = count($speakerSessions);

    // Session type colors for PDF
    $typeColors = [
        'worship'      => [168, 85, 247],   // purple
        'teaching'     => [59, 130, 246],    // blue
        'prayer'       => [34, 197, 94],     // green
        'break'        => [156, 163, 175],   // gray
        'meal'         => [245, 158, 11],    // amber
        'registration' => [6, 182, 212],     // cyan
        'panel'        => [236, 72, 153],    // pink
        'activity'     => [249, 115, 22],    // orange
        'announcement' => [99, 102, 241],    // indigo
        'other'        => [107, 114, 128],   // gray
    ];

    $typeLabels = [
        'worship' => 'Worship', 'teaching' => 'Teaching', 'prayer' => 'Prayer',
        'break' => 'Break', 'meal' => 'Meal', 'registration' => 'Registration',
        'panel' => 'Panel', 'activity' => 'Activity', 'announcement' => 'Announcement',
        'other' => 'Other'
    ];

    // ─── Generate insights ─────────────────────────────────────

    $insights = [];

    // Overall scope
    $totalHours = round($totalMinutes / 60, 1);
    $insights[] = "This is a {$totalDays}-day event with {$totalSessions} scheduled sessions spanning {$totalHours} hours of programming.";

    // Content vs break balance
    if ($totalMinutes > 0) {
        $contentPct = round(($contentMinutes / $totalMinutes) * 100);
        $breakPct = 100 - $contentPct;
        if ($breakPct < 15) {
            $insights[] = "Only {$breakPct}% of time allocated to breaks/meals. Consider adding more rest periods to prevent fatigue.";
        } elseif ($breakPct > 40) {
            $insights[] = "{$breakPct}% of time is breaks/meals. There's opportunity to add more content sessions.";
        } else {
            $insights[] = "Good balance: {$contentPct}% content, {$breakPct}% breaks/meals — well-structured for sustained engagement.";
        }
    }

    // Session variety
    $uniqueTypes = count($typeCount);
    if ($uniqueTypes >= 5) {
        $insights[] = "Excellent variety with {$uniqueTypes} different session types. Diverse programming keeps attendees engaged.";
    } elseif ($uniqueTypes >= 3) {
        $insights[] = "{$uniqueTypes} session types planned. Consider adding worship or panel discussions for more variety.";
    } else {
        $insights[] = "Only {$uniqueTypes} session type(s). Varying session formats can significantly improve attendee experience.";
    }

    // Speaker distribution
    if ($speakerCount > 0) {
        $topSpeaker = array_key_first($speakerSessions);
        $topCount = $speakerSessions[$topSpeaker];
        if ($speakerCount === 1) {
            $insights[] = "Single speaker ({$topSpeaker}) for all sessions. Multiple voices could add fresh perspectives.";
        } elseif ($topCount > $totalSessions * 0.5) {
            $insights[] = "{$topSpeaker} leads {$topCount} of {$totalSessions} sessions. Consider distributing sessions more evenly across speakers.";
        } else {
            $insights[] = "{$speakerCount} speakers sharing the program — good diversity of voices and perspectives.";
        }
    }

    // Longest session
    if ($longestSession && $longestDuration > 0) {
        if ($longestDuration > 90) {
            $insights[] = "Longest session \"{$longestSession['title']}\" runs " . round($longestDuration) . " minutes. Sessions over 90 min may benefit from a mid-session break.";
        } elseif ($longestDuration >= 60) {
            $insights[] = "Longest session is " . round($longestDuration) . " minutes — within optimal attention span range.";
        }
    }

    // Day balance
    if (count($dayMinutes) > 1) {
        $maxDay = max($dayMinutes);
        $minDay = min($dayMinutes);
        if ($maxDay > 0 && ($maxDay - $minDay) / $maxDay > 0.3) {
            $heaviest = array_search($maxDay, $dayMinutes);
            $insights[] = "Day {$heaviest} is the heaviest at " . round($maxDay / 60, 1) . " hours. Consider redistributing sessions for a more even pace.";
        } else {
            $insights[] = "Days are well-balanced in duration — consistent pacing throughout the event.";
        }
    }

    // ─── Build PDF ─────────────────────────────────────────────

    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator('JEN Portal');
    $pdf->SetAuthor('Jesus Enthroned Network');
    $pdf->SetTitle('Event Schedule - ' . $event['ename']);
    $pdf->SetMargins(15, 15, 15);
    $pdf->SetAutoPageBreak(true, 20);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->AddPage();

    $w = $pdf->getPageWidth() - 30;

    // ── HEADER BANNER ──
    $pdf->SetFillColor(30, 22, 54);
    $pdf->Rect(0, 0, $pdf->getPageWidth(), 42, 'F');
    $pdf->SetFillColor(139, 92, 246);
    $pdf->Rect(0, 42, $pdf->getPageWidth(), 1.5, 'F');

    $logoPath = __DIR__ . '/../assets/img/logo/logo-dark.jpeg';
    if (file_exists($logoPath)) {
        $pdf->Image($logoPath, 15, 6, 30, 0, 'JPEG', '', 'T', false, 300);
    }
    $textX = file_exists($logoPath) ? 48 : 15;
    $textW = $w - ($textX - 15);

    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 20);
    $pdf->SetXY($textX, 8);
    $pdf->Cell($textW, 10, 'EVENT PROGRAM', 0, 1, 'L');

    $pdf->SetFont('helvetica', '', 12);
    $pdf->SetXY($textX, 19);
    $pdf->Cell($textW, 7, $event['ename'], 0, 1, 'L');

    $eventDate = date('F j, Y', strtotime($event['start_date']));
    $endDateStr = $event['end_date'] ? ' - ' . date('F j, Y', strtotime($event['end_date'])) : '';
    $venue = $event['venue'] ?: 'No venue specified';

    $pdf->SetFont('helvetica', '', 9);
    $pdf->SetTextColor(200, 200, 220);
    $pdf->SetXY($textX, 28);
    $pdf->Cell($textW, 6, $eventDate . $endDateStr . '  |  ' . $venue, 0, 1, 'L');
    $pdf->SetXY($textX, 34);
    $pdf->Cell($textW, 6, 'Generated: ' . date('F j, Y \a\t g:i A'), 0, 1, 'L');

    $pdf->SetY(50);

    // ── SUMMARY CARDS ──
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetTextColor(80, 80, 80);
    $pdf->Cell($w, 6, 'PROGRAM OVERVIEW', 0, 1, 'L');
    $pdf->Ln(2);

    $cardW = ($w - 9) / 4;
    $cardY = $pdf->GetY();
    $cards = [
        [$totalDays . ' Day' . ($totalDays > 1 ? 's' : ''), 'Duration', [168, 85, 247]],
        [(string)$totalSessions, 'Sessions', [59, 130, 246]],
        [(string)$speakerCount, 'Speakers', [34, 197, 94]],
        [$totalHours . 'h', 'Total Time', [245, 158, 11]],
    ];

    foreach ($cards as $i => $card) {
        $x = 15 + ($i * ($cardW + 3));
        $pdf->SetFillColorArray($card[2]);
        $pdf->Rect($x, $cardY, $cardW, 1.5, 'F');
        $pdf->SetFillColor(245, 245, 250);
        $pdf->Rect($x, $cardY + 1.5, $cardW, 16, 'F');

        $pdf->SetTextColorArray($card[2]);
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetXY($x + 2, $cardY + 3);
        $pdf->Cell($cardW - 4, 7, $card[0], 0, 0, 'C');

        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetXY($x + 2, $cardY + 10);
        $pdf->Cell($cardW - 4, 5, $card[1], 0, 0, 'C');
    }

    $pdf->SetY($cardY + 22);

    // ── SESSION TYPE BREAKDOWN BAR ──
    if (!empty($typeCount) && $totalSessions > 0) {
        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->Cell(25, 5, 'Sessions:', 0, 0, 'L');

        $barW = $w - 25;
        $barX = $pdf->GetX();
        $barY = $pdf->GetY();
        $xOff = 0;

        foreach ($typeCount as $type => $count) {
            $segW = round(($count / $totalSessions) * $barW);
            if ($segW < 1) $segW = 1;
            $color = $typeColors[$type] ?? [107, 114, 128];
            $pdf->SetFillColorArray($color);
            $pdf->Rect($barX + $xOff, $barY, $segW, 5, 'F');
            if ($segW > 12) {
                $pdf->SetTextColor(255, 255, 255);
                $pdf->SetFont('helvetica', 'B', 5.5);
                $pdf->SetXY($barX + $xOff, $barY);
                $pdf->Cell($segW, 5, ($typeLabels[$type] ?? $type) . " {$count}", 0, 0, 'C');
            }
            $xOff += $segW;
        }
        $pdf->Ln(8);

        // Legend
        $pdf->SetFont('helvetica', '', 6);
        $legendX = 15;
        foreach ($typeCount as $type => $count) {
            $color = $typeColors[$type] ?? [107, 114, 128];
            $label = ($typeLabels[$type] ?? $type) . " ({$count})";
            $labelW = $pdf->GetStringWidth($label) + 6;
            if ($legendX + $labelW > 15 + $w) {
                $pdf->Ln(4);
                $legendX = 15;
            }
            $pdf->SetFillColorArray($color);
            $pdf->Rect($legendX, $pdf->GetY() + 0.5, 2.5, 2.5, 'F');
            $pdf->SetXY($legendX + 3.5, $pdf->GetY());
            $pdf->SetTextColor(80, 80, 80);
            $pdf->Cell($labelW, 4, $label, 0, 0, 'L');
            $legendX = $pdf->GetX() + 3;
        }
        $pdf->Ln(6);
    }

    // ── INSIGHTS ──
    if (!empty($insights)) {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(80, 80, 80);
        $pdf->Cell($w, 6, 'INSIGHTS & ANALYSIS', 0, 1, 'L');
        $pdf->Ln(1);

        $insightText = '';
        foreach ($insights as $idx => $insight) {
            $insightText .= ($idx + 1) . '. ' . $insight . "\n";
        }

        $pdf->SetFont('helvetica', '', 8.5);
        $textH = $pdf->getStringHeight($w - 10, $insightText) + 6;
        $insightY = $pdf->GetY();

        $pdf->SetFillColor(248, 245, 255);
        $pdf->Rect(15, $insightY, $w, $textH, 'F');
        $pdf->SetFillColor(139, 92, 246);
        $pdf->Rect(15, $insightY, 2, $textH, 'F');

        $pdf->SetXY(20, $insightY + 3);
        $pdf->SetTextColor(60, 50, 80);
        $pdf->MultiCell($w - 10, 5, $insightText, 0, 'L');
        $pdf->Ln(4);
    }

    // ── SCHEDULE BY DAY ──
    foreach ($byDay as $dayNum => $daySessions) {
        // Check space for day header
        if ($pdf->GetY() > 240) {
            $pdf->AddPage();
        }

        // Day header
        $dayDate = clone $startDate;
        $dayDate->modify('+' . ($dayNum - 1) . ' days');
        $dayLabel = 'DAY ' . $dayNum . ' — ' . strtoupper($dayDate->format('l, F j, Y'));
        $dayTotalMin = $dayMinutes[$dayNum] ?? 0;
        $dayHrs = round($dayTotalMin / 60, 1);

        $pdf->SetFillColor(30, 22, 54);
        $pdf->Rect(15, $pdf->GetY(), $w, 8, 'F');
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetX(15);
        $pdf->Cell($w - 30, 8, $dayLabel, 0, 0, 'L', 0);
        $pdf->SetFont('helvetica', '', 7.5);
        $pdf->Cell(30, 8, count($daySessions) . ' sessions | ' . $dayHrs . 'h', 0, 1, 'R', 0);
        $pdf->Ln(2);

        foreach ($daySessions as $s) {
            // Check page break
            if ($pdf->GetY() > 265) {
                $pdf->AddPage();
            }

            $type = $s['session_type'];
            $color = $typeColors[$type] ?? [107, 114, 128];
            $startT = date('g:i A', strtotime($s['start_time']));
            $endT = date('g:i A', strtotime($s['end_time']));
            $dur = max(0, (strtotime($s['end_time']) - strtotime($s['start_time'])) / 60);

            $rowY = $pdf->GetY();

            // Color accent bar
            $pdf->SetFillColorArray($color);
            $pdf->Rect(15, $rowY, 2, 12, 'F');

            // Time
            $pdf->SetXY(19, $rowY);
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->SetTextColor(60, 60, 60);
            $pdf->Cell(30, 5, $startT . ' - ' . $endT, 0, 0, 'L');

            // Duration badge
            $pdf->SetFont('helvetica', '', 6.5);
            $pdf->SetTextColor(120, 120, 120);
            $pdf->Cell(15, 5, round($dur) . ' min', 0, 0, 'L');

            // Type badge
            $pdf->SetFillColorArray($color);
            $typeLabel = $typeLabels[$type] ?? $type;
            $badgeW = $pdf->GetStringWidth($typeLabel) + 4;
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 6);
            $badgeX = $pdf->GetX();
            $pdf->Rect($badgeX, $rowY + 0.5, $badgeW, 4, 'F');
            $pdf->SetXY($badgeX, $rowY + 0.3);
            $pdf->Cell($badgeW, 4.5, $typeLabel, 0, 0, 'C');

            // Title
            $pdf->SetXY(19, $rowY + 5.5);
            $pdf->SetFont('helvetica', 'B', 8.5);
            $pdf->SetTextColor(30, 30, 30);
            $titleW = $w - 8;
            $pdf->Cell($titleW, 5, mb_substr($s['title'], 0, 65), 0, 1, 'L');

            // Speaker + Location
            $metaY = $pdf->GetY();
            $hasMeta = false;
            $pdf->SetFont('helvetica', 'I', 7);
            $pdf->SetTextColor(100, 100, 100);
            $pdf->SetX(19);

            if (!empty($s['speaker'])) {
                $pdf->Cell(0, 4, 'Speaker: ' . $s['speaker'], 0, 0, 'L');
                $hasMeta = true;
            }
            if (!empty($s['location'])) {
                if ($hasMeta) $pdf->Cell(5, 4, '', 0, 0);
                $pdf->Cell(0, 4, 'Location: ' . $s['location'], 0, 0, 'L');
                $hasMeta = true;
            }
            if ($hasMeta) $pdf->Ln();

            // Description
            if (!empty($s['description'])) {
                $pdf->SetX(19);
                $pdf->SetFont('helvetica', '', 7);
                $pdf->SetTextColor(120, 120, 120);
                $pdf->MultiCell($w - 8, 3.5, mb_substr($s['description'], 0, 200), 0, 'L');
            }

            $pdf->Ln(2);

            // Separator line
            $pdf->SetDrawColor(230, 230, 230);
            $pdf->Line(19, $pdf->GetY(), 15 + $w, $pdf->GetY());
            $pdf->Ln(2);
        }

        $pdf->Ln(3);
    }

    // ── SPEAKER SUMMARY ──
    if (!empty($speakerSessions)) {
        if ($pdf->GetY() > 240) $pdf->AddPage();

        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(80, 80, 80);
        $pdf->Cell($w, 6, 'SPEAKER SUMMARY', 0, 1, 'L');
        $pdf->Ln(1);

        $pdf->SetFillColor(30, 22, 54);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 7.5);
        $pdf->Cell(60, 6, 'Speaker', 0, 0, 'L', 1);
        $pdf->Cell(25, 6, 'Sessions', 0, 0, 'C', 1);
        $pdf->Cell(40, 6, '', 0, 1, 'L', 1);

        $maxSpeaker = max($speakerSessions);
        $row = 0;
        foreach ($speakerSessions as $speaker => $count) {
            $row++;
            $pdf->SetFillColor($row % 2 === 0 ? 248 : 255, $row % 2 === 0 ? 248 : 255, $row % 2 === 0 ? 252 : 255);
            $pdf->SetTextColor(40, 40, 40);
            $pdf->SetFont('helvetica', '', 7.5);
            $pdf->Cell(60, 6, mb_substr($speaker, 0, 35), 0, 0, 'L', 1);
            $pdf->Cell(25, 6, (string)$count, 0, 0, 'C', 1);

            // Mini bar
            $barX = $pdf->GetX() + 2;
            $barY = $pdf->GetY();
            $barLen = $maxSpeaker > 0 ? round(($count / $maxSpeaker) * 36) : 0;
            $pdf->SetFillColor(139, 92, 246);
            if ($barLen > 0) $pdf->Rect($barX, $barY + 1.5, $barLen, 3, 'F');
            $pdf->Cell(40, 6, '', 0, 1, 'L');
        }
        $pdf->Ln(4);
    }

    // ── FOOTER ──
    $pdf->Ln(4);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line(15, $pdf->GetY(), 15 + $w, $pdf->GetY());
    $pdf->Ln(3);
    $pdf->SetFont('helvetica', 'I', 7);
    $pdf->SetTextColor(150, 150, 150);
    $pdf->Cell($w, 5, 'Jesus Enthroned Network — Event Program — Page ' . $pdf->getAliasNumPage() . ' of ' . $pdf->getAliasNbPages(), 0, 0, 'C');

    $filename = 'Program_' . preg_replace('/[^a-zA-Z0-9_]/', '_', $event['ename']) . '_' . date('Ymd') . '.pdf';
    $pdf->Output($filename, 'I');

} catch (PDOException $e) {
    error_log("Schedule PDF error: " . $e->getMessage());
    apiError('Failed to generate schedule report', 500);
}
