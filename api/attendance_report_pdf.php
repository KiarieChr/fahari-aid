<?php
/**
 * Event Attendance Report PDF Generator
 * GET /api/attendance_report_pdf.php?event_id=X
 * 
 * Generates a professional PDF report with attendance data and insights
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
    // Get event details
    $stmt = $db->prepare("SELECT id, ename, start_date, end_date, branch as venue, target_attendees FROM event WHERE id = :id");
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$event) {
        apiError('Event not found', 404);
    }

    // Get all registrations with attendance
    $stmt = $db->prepare("
        SELECT 
            r.id as registration_id, r.names, r.phone_no, r.email, r.gender, r.residence, r.category,
            ea.id as attendance_id, ea.check_in_time, ea.check_in_method
        FROM event_registration r
        LEFT JOIN event_attendance ea ON r.id = ea.registration_id AND ea.event_id = :eid
        WHERE r.event_id = :eid2
        ORDER BY (ea.id IS NOT NULL) DESC, ea.check_in_time ASC, r.names ASC
    ");
    $stmt->execute([':eid' => $eventId, ':eid2' => $eventId]);
    $attendees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ─── Compute insights ──────────────────────────────────────

    $total = count($attendees);
    $checkedIn = 0;
    $notCheckedIn = 0;
    $manualCount = 0;
    $qrCount = 0;
    $genderBreakdown = [];
    $residenceBreakdown = [];
    $checkinTimes = [];
    $maleCheckedIn = 0;
    $femaleCheckedIn = 0;

    foreach ($attendees as $a) {
        $isChecked = !empty($a['attendance_id']);
        if ($isChecked) {
            $checkedIn++;
            if ($a['check_in_method'] === 'qr') $qrCount++;
            else $manualCount++;
            if ($a['check_in_time']) {
                $checkinTimes[] = $a['check_in_time'];
            }
            $g = strtolower(trim($a['gender'] ?? ''));
            if ($g === 'male') $maleCheckedIn++;
            elseif ($g === 'female') $femaleCheckedIn++;
        } else {
            $notCheckedIn++;
        }
        // Gender
        $gender = ucfirst(strtolower(trim($a['gender'] ?? 'Unknown')));
        $genderBreakdown[$gender] = ($genderBreakdown[$gender] ?? 0) + 1;
        // Residence
        $res = trim($a['residence'] ?? 'Unknown');
        if ($res) {
            $residenceBreakdown[$res] = ($residenceBreakdown[$res] ?? 0) + 1;
        }
    }

    $attendanceRate = $total > 0 ? round(($checkedIn / $total) * 100, 1) : 0;
    $target = (int)($event['target_attendees'] ?? 0);
    $targetRate = $target > 0 ? round(($checkedIn / $target) * 100, 1) : 0;

    // Peak check-in time analysis
    $peakHour = '';
    $avgCheckinTime = '';
    $firstCheckin = '';
    $lastCheckin = '';
    $hourBuckets = [];

    if (!empty($checkinTimes)) {
        sort($checkinTimes);
        $firstCheckin = $checkinTimes[0];
        $lastCheckin = $checkinTimes[count($checkinTimes) - 1];

        $timestamps = array_map('strtotime', $checkinTimes);
        $avgTs = array_sum($timestamps) / count($timestamps);
        $avgCheckinTime = date('g:i A', (int)$avgTs);

        $dayBuckets = [];
        foreach ($checkinTimes as $t) {
            $h = date('g A', strtotime($t));
            $hourBuckets[$h] = ($hourBuckets[$h] ?? 0) + 1;
            $day = date('Y-m-d', strtotime($t));
            $dayBuckets[$day] = ($dayBuckets[$day] ?? 0) + 1;
        }
        arsort($hourBuckets);
        $peakHour = array_key_first($hourBuckets);
        ksort($dayBuckets); // chronological order
        $peakDay = array_keys($dayBuckets, max($dayBuckets))[0];

        // Check-in duration
        $durationMin = round((strtotime($lastCheckin) - strtotime($firstCheckin)) / 60);
    }

    // Top residences
    arsort($residenceBreakdown);
    $topResidences = array_slice($residenceBreakdown, 0, 5, true);

    // ─── Generate insights text ────────────────────────────────

    $insights = [];

    // Attendance verdict
    if ($attendanceRate >= 90) {
        $insights[] = "Outstanding turnout! {$attendanceRate}% of registered attendees showed up — indicating excellent engagement and communication.";
    } elseif ($attendanceRate >= 70) {
        $insights[] = "Strong attendance at {$attendanceRate}%. The majority of registrants followed through, which reflects healthy event planning.";
    } elseif ($attendanceRate >= 50) {
        $insights[] = "Moderate turnout at {$attendanceRate}%. Consider sending reminder communications closer to event time to improve conversion.";
    } else {
        $insights[] = "Low attendance at {$attendanceRate}%. Review barriers: timing, accessibility, or communication gaps may be affecting turnout.";
    }

    // Target comparison
    if ($target > 0) {
        if ($targetRate >= 100) {
            $insights[] = "Exceeded the target of {$target} attendees by " . ($checkedIn - $target) . " — consider larger venues for future events.";
        } elseif ($targetRate >= 75) {
            $insights[] = "Reached {$targetRate}% of the target ({$checkedIn}/{$target}). Close to goal — a small push in outreach could close the gap.";
        } else {
            $insights[] = "Only {$targetRate}% of target reached ({$checkedIn}/{$target}). Marketing and follow-up strategies may need adjustment.";
        }
    }

    // Check-in method
    if ($checkedIn > 0) {
        $qrPct = round(($qrCount / $checkedIn) * 100);
        $manualPct = 100 - $qrPct;
        if ($qrCount > $manualCount) {
            $insights[] = "QR scanning was the dominant check-in method ({$qrPct}%). Digital adoption is strong — continue promoting QR codes.";
        } elseif ($manualCount > $qrCount) {
            $insights[] = "Manual check-in was more common ({$manualPct}%). Consider better QR code distribution to streamline future events.";
        } else {
            $insights[] = "Even split between QR ({$qrPct}%) and manual ({$manualPct}%) check-ins. Both channels are being utilized.";
        }
    }

    // Timing
    if (!empty($checkinTimes) && isset($durationMin)) {
        if ($durationMin <= 30) {
            $insights[] = "Check-in was concentrated within {$durationMin} minutes — attendees arrived punctually.";
        } elseif ($durationMin <= 90) {
            $insights[] = "Check-in spanned {$durationMin} minutes (peak hour: {$peakHour}). Most arrivals were well-timed.";
        } else {
            $hrs = round($durationMin / 60, 1);
            $insights[] = "Check-in stretched over {$hrs} hours. Staggered arrivals suggest some attendees may have missed early sessions.";
        }
    }

    // Gender
    if ($maleCheckedIn > 0 || $femaleCheckedIn > 0) {
        $totalGendered = $maleCheckedIn + $femaleCheckedIn;
        $malePct = round(($maleCheckedIn / $totalGendered) * 100);
        $femalePct = 100 - $malePct;
        $insights[] = "Gender split of checked-in attendees: {$malePct}% male, {$femalePct}% female.";
    }

    // Daily breakdown insight
    if (!empty($dayBuckets) && count($dayBuckets) > 1) {
        $peakDayFormatted = date('l, M j', strtotime($peakDay));
        $peakDayCount = $dayBuckets[$peakDay];
        $insights[] = "Peak check-in day was {$peakDayFormatted} with {$peakDayCount} arrivals across " . count($dayBuckets) . " days of activity.";
    }

    // No-shows
    if ($notCheckedIn > 0) {
        $insights[] = "{$notCheckedIn} registered attendee" . ($notCheckedIn > 1 ? 's' : '') . " did not check in. Follow-up outreach may help retain them for future events.";
    }

    // ─── Build PDF ─────────────────────────────────────────────

    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator('JEN Portal');
    $pdf->SetAuthor('Jesus Enthroned Network');
    $pdf->SetTitle('Attendance Report - ' . $event['ename']);
    $pdf->SetMargins(15, 15, 15);
    $pdf->SetAutoPageBreak(true, 20);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->AddPage();

    $w = $pdf->getPageWidth() - 30; // usable width

    // ── HEADER BANNER ──
    $pdf->SetFillColor(30, 22, 54); // dark purple
    $pdf->Rect(0, 0, $pdf->getPageWidth(), 42, 'F');
    $pdf->SetFillColor(139, 92, 246); // purple accent line
    $pdf->Rect(0, 42, $pdf->getPageWidth(), 1.5, 'F');

    // Logo
    $logoPath = __DIR__ . '/../assets/img/logo/favicon.ico';
    if (file_exists($logoPath)) {
        $pdf->Image($logoPath, 15, 6, 30, 0, 'ICO', '', 'T', false, 300);
    }
    $textX = file_exists($logoPath) ? 48 : 15;

    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 20);
    $pdf->SetXY($textX, 8);
    $pdf->Cell($w - ($textX - 15), 10, 'ATTENDANCE REPORT', 0, 1, 'L');

    $pdf->SetFont('helvetica', '', 12);
    $pdf->SetXY($textX, 19);
    $pdf->Cell($w - ($textX - 15), 7, $event['ename'], 0, 1, 'L');

    $pdf->SetFont('helvetica', '', 9);
    $pdf->SetTextColor(200, 200, 220);
    $eventDate = date('F j, Y', strtotime($event['start_date']));
    $venue = $event['venue'] ?: 'No venue specified';
    $pdf->SetXY($textX, 28);
    $pdf->Cell($w - ($textX - 15), 6, $eventDate . '  |  ' . $venue, 0, 1, 'L');

    $pdf->SetXY($textX, 34);
    $pdf->Cell($w - ($textX - 15), 6, 'Generated: ' . date('F j, Y \a\t g:i A'), 0, 1, 'L');

    $pdf->SetY(50);

    // ── SUMMARY CARDS ROW ──
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetTextColor(80, 80, 80);
    $pdf->Cell($w, 6, 'EVENT SUMMARY', 0, 1, 'L');
    $pdf->Ln(2);

    $cardW = ($w - 6) / 4;
    $startX = 15;
    $cardY = $pdf->GetY();

    $summaryCards = [
        ['Registered', $total, [34, 193, 230]],
        ['Checked In', $checkedIn, [34, 197, 94]],
        ['Pending', $notCheckedIn, [245, 158, 11]],
        ['Rate', $attendanceRate . '%', [168, 85, 247]],
    ];

    foreach ($summaryCards as $i => $card) {
        $x = $startX + ($i * ($cardW + 2));
        $pdf->SetFillColorArray($card[2]);
        $pdf->Rect($x, $cardY, $cardW, 1.5, 'F');
        $pdf->SetFillColor(245, 245, 250);
        $pdf->Rect($x, $cardY + 1.5, $cardW, 16, 'F');

        $pdf->SetTextColorArray($card[2]);
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetXY($x + 2, $cardY + 3);
        $pdf->Cell($cardW - 4, 7, (string)$card[1], 0, 0, 'C');

        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetXY($x + 2, $cardY + 10);
        $pdf->Cell($cardW - 4, 5, $card[0], 0, 0, 'C');
    }

    $pdf->SetY($cardY + 22);

    // ── CHECK-IN METHOD BAR ──
    if ($checkedIn > 0) {
        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->Cell(25, 5, 'Check-in:', 0, 0, 'L');

        $barW = $w - 25;
        $barX = $pdf->GetX();
        $barY = $pdf->GetY();
        $manualW = round(($manualCount / $checkedIn) * $barW);
        $qrW = $barW - $manualW;

        if ($manualW > 0) {
            $pdf->SetFillColor(6, 182, 212);
            $pdf->Rect($barX, $barY, $manualW, 5, 'F');
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 6);
            $pdf->SetXY($barX, $barY);
            if ($manualW > 15) $pdf->Cell($manualW, 5, "Manual {$manualCount}", 0, 0, 'C');
        }
        if ($qrW > 0) {
            $pdf->SetFillColor(168, 85, 247);
            $pdf->Rect($barX + $manualW, $barY, $qrW, 5, 'F');
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 6);
            $pdf->SetXY($barX + $manualW, $barY);
            if ($qrW > 15) $pdf->Cell($qrW, 5, "QR {$qrCount}", 0, 0, 'C');
        }
        $pdf->Ln(10);
    }

    // ── INSIGHTS SECTION ──
    if (!empty($insights)) {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(80, 80, 80);
        $pdf->Cell($w, 6, 'INSIGHTS & ANALYSIS', 0, 1, 'L');
        $pdf->Ln(1);

        $pdf->SetFillColor(248, 245, 255); // light purple bg
        $insightY = $pdf->GetY();
        // We need to calculate height first
        $pdf->SetFont('helvetica', '', 8.5);
        $insightText = '';
        foreach ($insights as $idx => $insight) {
            $insightText .= ($idx + 1) . '. ' . $insight . "\n";
        }
        $textH = $pdf->getStringHeight($w - 10, $insightText) + 6;

        $pdf->SetFillColor(248, 245, 255);
        $pdf->Rect(15, $insightY, $w, $textH, 'F');
        $pdf->SetFillColor(139, 92, 246);
        $pdf->Rect(15, $insightY, 2, $textH, 'F'); // left accent bar

        $pdf->SetXY(20, $insightY + 3);
        $pdf->SetTextColor(60, 50, 80);
        $pdf->SetFont('helvetica', '', 8.5);
        $pdf->MultiCell($w - 10, 5, $insightText, 0, 'L');
        $pdf->Ln(4);
    }

    // ── TIMING DETAILS ──
    if (!empty($checkinTimes)) {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(80, 80, 80);
        $pdf->Cell($w, 6, 'CHECK-IN TIMELINE', 0, 1, 'L');
        $pdf->Ln(1);

        $pdf->SetFont('helvetica', '', 8.5);
        $pdf->SetTextColor(60, 60, 60);
        $timingInfo = [
            ['First Check-in', date('M j, g:i A', strtotime($firstCheckin))],
            ['Last Check-in', date('M j, g:i A', strtotime($lastCheckin))],
            ['Average Arrival', $avgCheckinTime],
            ['Peak Hour', $peakHour . ' (' . ($hourBuckets[$peakHour] ?? 0) . ' arrivals)'],
        ];
        foreach ($timingInfo as $ti) {
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->Cell(35, 5, $ti[0] . ':', 0, 0, 'L');
            $pdf->SetFont('helvetica', '', 8);
            $pdf->Cell(50, 5, $ti[1], 0, 1, 'L');
        }
        $pdf->Ln(4);

        // Daily breakdown table
        if (!empty($dayBuckets)) {
            $pdf->SetFont('helvetica', 'B', 9);
            $pdf->SetTextColor(80, 80, 80);
            $pdf->Cell($w, 6, 'DAILY CHECK-IN BREAKDOWN', 0, 1, 'L');
            $pdf->Ln(1);

            // Table header
            $dayColW = [45, 25, 50];
            $pdf->SetFillColor(30, 22, 54);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 7.5);
            $pdf->Cell($dayColW[0], 6, 'Date', 0, 0, 'L', 1);
            $pdf->Cell($dayColW[1], 6, 'Check-ins', 0, 0, 'C', 1);
            $pdf->Cell($dayColW[2], 6, '', 0, 1, 'L', 1); // bar column header

            $maxDay = max($dayBuckets);
            $barMaxW = $dayColW[2] - 4;
            $rowIdx = 0;
            foreach ($dayBuckets as $day => $count) {
                $rowIdx++;
                $isEven = $rowIdx % 2 === 0;
                $isPeak = ($day === $peakDay && count($dayBuckets) > 1);

                if ($isEven) $pdf->SetFillColor(248, 248, 252);
                else $pdf->SetFillColor(255, 255, 255);

                $pdf->SetTextColor(40, 40, 40);
                $pdf->SetFont('helvetica', $isPeak ? 'B' : '', 7.5);
                $dayLabel = date('D, M j Y', strtotime($day));
                if ($isPeak) $dayLabel .= '  *';
                $pdf->Cell($dayColW[0], 6, $dayLabel, 0, 0, 'L', 1);
                $pdf->Cell($dayColW[1], 6, (string)$count, 0, 0, 'C', 1);

                // Mini bar
                $barY = $pdf->GetY();
                $barX = $pdf->GetX() + 2;
                $barLen = $maxDay > 0 ? round(($count / $maxDay) * $barMaxW) : 0;
                if ($isPeak) $pdf->SetFillColor(139, 92, 246);
                else $pdf->SetFillColor(168, 162, 200);
                if ($barLen > 0) $pdf->Rect($barX, $barY + 1.5, $barLen, 3, 'F');

                $pdf->Cell($dayColW[2], 6, '', 0, 1, 'L');
            }

            // Total row
            $pdf->SetFillColor(240, 237, 255);
            $pdf->SetTextColor(60, 50, 80);
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->Cell($dayColW[0], 6, 'TOTAL', 0, 0, 'L', 1);
            $pdf->Cell($dayColW[1], 6, (string)$checkedIn, 0, 0, 'C', 1);
            $pdf->Cell($dayColW[2], 6, count($dayBuckets) > 1 ? '* = Peak day' : '', 0, 1, 'L', 1);
            $pdf->Ln(4);
        }
    }

    // ── DEMOGRAPHICS ──
    if (!empty($genderBreakdown) || !empty($topResidences)) {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(80, 80, 80);
        $pdf->Cell($w, 6, 'DEMOGRAPHICS', 0, 1, 'L');
        $pdf->Ln(1);

        $halfW = ($w - 4) / 2;
        $demoY = $pdf->GetY();

        // Gender
        if (!empty($genderBreakdown)) {
            $pdf->SetXY(15, $demoY);
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->SetTextColor(80, 80, 80);
            $pdf->Cell($halfW, 5, 'Gender Distribution', 0, 1, 'L');

            foreach ($genderBreakdown as $g => $c) {
                $pct = $total > 0 ? round(($c / $total) * 100) : 0;
                $pdf->SetFont('helvetica', '', 8);
                $pdf->SetTextColor(60, 60, 60);
                $pdf->SetX(15);
                $pdf->Cell(25, 4.5, $g, 0, 0, 'L');
                $pdf->Cell(10, 4.5, (string)$c, 0, 0, 'R');
                $pdf->Cell(15, 4.5, " ({$pct}%)", 0, 1, 'L');
            }
        }

        // Top residences
        if (!empty($topResidences)) {
            $pdf->SetXY(15 + $halfW + 4, $demoY);
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->SetTextColor(80, 80, 80);
            $pdf->Cell($halfW, 5, 'Top Locations', 0, 1, 'L');

            $rY = $demoY + 5;
            foreach ($topResidences as $loc => $c) {
                $pdf->SetXY(15 + $halfW + 4, $rY);
                $pdf->SetFont('helvetica', '', 8);
                $pdf->SetTextColor(60, 60, 60);
                $pdf->Cell(35, 4.5, mb_substr($loc, 0, 22), 0, 0, 'L');
                $pdf->Cell(10, 4.5, (string)$c, 0, 1, 'R');
                $rY += 4.5;
            }
        }

        $maxY = max($pdf->GetY(), $demoY + 5 + (count($topResidences) * 4.5));
        $pdf->SetY($maxY + 6);
    }

    // ── ATTENDEES TABLE ──
    // Check if we need a new page
    if ($pdf->GetY() > 220) {
        $pdf->AddPage();
    }

    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetTextColor(80, 80, 80);
    $pdf->Cell($w, 6, 'ATTENDEE LIST (' . $total . ' registered)', 0, 1, 'L');
    $pdf->Ln(2);

    // Table header
    $colWidths = [8, 48, 30, 40, 18, 25, 14];
    $headers = ['#', 'Name', 'Phone', 'Email', 'Status', 'Check-in Time', 'Method'];

    $pdf->SetFillColor(30, 22, 54);
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 7);

    foreach ($headers as $i => $h) {
        $pdf->Cell($colWidths[$i], 7, $h, 0, 0, 'L', 1);
    }
    $pdf->Ln();

    // Table rows
    $pdf->SetFont('helvetica', '', 7);
    $row = 0;
    foreach ($attendees as $a) {
        $row++;
        $isChecked = !empty($a['attendance_id']);

        // Alternate row bg
        if ($row % 2 === 0) {
            $pdf->SetFillColor(248, 248, 252);
        } else {
            $pdf->SetFillColor(255, 255, 255);
        }

        // Check if we need a new page
        if ($pdf->GetY() > 270) {
            $pdf->AddPage();
            // Re-draw header
            $pdf->SetFillColor(30, 22, 54);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 7);
            foreach ($headers as $i => $h) {
                $pdf->Cell($colWidths[$i], 7, $h, 0, 0, 'L', 1);
            }
            $pdf->Ln();
            $pdf->SetFont('helvetica', '', 7);
            if ($row % 2 === 0) {
                $pdf->SetFillColor(248, 248, 252);
            } else {
                $pdf->SetFillColor(255, 255, 255);
            }
        }

        $pdf->SetTextColor(40, 40, 40);

        $pdf->Cell($colWidths[0], 6, (string)$row, 0, 0, 'L', 1);
        $pdf->Cell($colWidths[1], 6, mb_substr($a['names'] ?? '', 0, 28), 0, 0, 'L', 1);
        $pdf->Cell($colWidths[2], 6, $a['phone_no'] ?? '', 0, 0, 'L', 1);
        $pdf->Cell($colWidths[3], 6, mb_substr($a['email'] ?? '', 0, 25), 0, 0, 'L', 1);

        // Status with color
        if ($isChecked) {
            $pdf->SetTextColor(22, 163, 74);
            $pdf->Cell($colWidths[4], 6, 'Present', 0, 0, 'L', 1);
        } else {
            $pdf->SetTextColor(245, 158, 11);
            $pdf->Cell($colWidths[4], 6, 'Absent', 0, 0, 'L', 1);
        }

        $pdf->SetTextColor(40, 40, 40);
        $checkTime = $isChecked && $a['check_in_time'] ? date('M j, g:i A', strtotime($a['check_in_time'])) : '-';
        $pdf->Cell($colWidths[5], 6, $checkTime, 0, 0, 'L', 1);

        $method = $isChecked ? ucfirst($a['check_in_method'] ?? '') : '-';
        $pdf->Cell($colWidths[6], 6, $method, 0, 1, 'L', 1);
    }

    // ── FOOTER ──
    $pdf->Ln(8);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line(15, $pdf->GetY(), 15 + $w, $pdf->GetY());
    $pdf->Ln(3);
    $pdf->SetFont('helvetica', 'I', 7);
    $pdf->SetTextColor(150, 150, 150);
    $pdf->Cell($w, 5, 'Jesus Enthroned Network — Confidential Attendance Report — Page ' . $pdf->getAliasNumPage() . ' of ' . $pdf->getAliasNbPages(), 0, 0, 'C');

    // Output
    $filename = 'Attendance_Report_' . preg_replace('/[^a-zA-Z0-9_]/', '_', $event['ename']) . '_' . date('Ymd') . '.pdf';
    $pdf->Output($filename, 'I'); // I = inline display in browser

} catch (PDOException $e) {
    error_log("Attendance PDF error: " . $e->getMessage());
    apiError('Failed to generate report', 500);
}
