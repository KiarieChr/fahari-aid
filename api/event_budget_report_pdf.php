<?php
/**
 * Event Budget Report PDF Generator
 * GET /api/event_budget_report_pdf.php?event_id=X[&version=N]
 * 
 * Professional PDF with budget-vs-actual analysis, variance charts,
 * category breakdown, AI insights, and full line-item detail.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/../tcpdf/tcpdf.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$eventId = (int)($_GET['event_id'] ?? 0);
if ($eventId <= 0) apiError('Event ID is required', 400);

$version = isset($_GET['version']) ? (int)$_GET['version'] : null;

try {
    // ── Gather data ──────────────────────────────────────────

    // Event
    $stmt = $db->prepare("SELECT id, ename, start_date, end_date, target_attendees FROM event WHERE id = :id");
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch();
    if (!$event) apiError('Event not found', 404);

    // Budget
    if ($version) {
        $stmt = $db->prepare("
            SELECT eb.*, CONCAT(m1.first_name, ' ', COALESCE(m1.last_name, '')) AS created_by_name, CONCAT(m2.first_name, ' ', COALESCE(m2.last_name, '')) AS approved_by_name
            FROM event_budget eb LEFT JOIN users u ON u.id = eb.created_by LEFT JOIN member m1 ON m1.id = u.member_id LEFT JOIN users a ON a.id = eb.approved_by LEFT JOIN member m2 ON m2.id = a.member_id
            WHERE eb.event_id = :eid AND eb.version = :v
        ");
        $stmt->execute([':eid' => $eventId, ':v' => $version]);
    } else {
        $stmt = $db->prepare("
            SELECT eb.*, CONCAT(m1.first_name, ' ', COALESCE(m1.last_name, '')) AS created_by_name, CONCAT(m2.first_name, ' ', COALESCE(m2.last_name, '')) AS approved_by_name
            FROM event_budget eb LEFT JOIN users u ON u.id = eb.created_by LEFT JOIN member m1 ON m1.id = u.member_id LEFT JOIN users a ON a.id = eb.approved_by LEFT JOIN member m2 ON m2.id = a.member_id
            WHERE eb.event_id = :eid ORDER BY eb.version DESC LIMIT 1
        ");
        $stmt->execute([':eid' => $eventId]);
    }
    $budget = $stmt->fetch();
    if (!$budget) apiError('No budget found for this event', 404);

    // Items
    $stmt = $db->prepare("
        SELECT ebi.*, acc.account_code, acc.account_name
        FROM event_budget_item ebi LEFT JOIN account acc ON acc.id = ebi.gl_account_id
        WHERE ebi.event_budget_id = :bid ORDER BY ebi.category, ebi.id
    ");
    $stmt->execute([':bid' => $budget['id']]);
    $items = $stmt->fetchAll();

    // Attendee count (for per-capita)
    $stmt = $db->prepare("SELECT COUNT(*) FROM event_attendance WHERE event_id = :eid");
    $stmt->execute([':eid' => $eventId]);
    $attendeeCount = (int)$stmt->fetchColumn();

    // Audit trail
    $stmt = $db->prepare("
        SELECT eba.*, CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) AS by_name FROM event_budget_audit eba
        LEFT JOIN users u ON u.id = eba.performed_by
        LEFT JOIN member m ON m.id = u.member_id
        WHERE eba.event_budget_id = :bid ORDER BY eba.performed_at DESC LIMIT 20
    ");
    $stmt->execute([':bid' => $budget['id']]);
    $audit = $stmt->fetchAll();

    // ── Compute analytics ────────────────────────────────────

    $totalEstimated = (float)$budget['total_estimated'];
    $totalActual = (float)$budget['total_actual'];
    $totalVariance = $totalActual - $totalEstimated;
    $variancePct = $totalEstimated > 0 ? ($totalVariance / $totalEstimated) * 100 : 0;

    // Category breakdown
    $categories = [];
    $paidItems = 0;
    $plannedItems = 0;
    $cancelledItems = 0;
    $biggestOverspend = null;
    $biggestSaving = null;

    foreach ($items as $item) {
        $cat = $item['category'];
        if (!isset($categories[$cat])) {
            $categories[$cat] = ['category' => $cat, 'estimated' => 0, 'actual' => 0, 'count' => 0, 'paid' => 0];
        }
        $categories[$cat]['estimated'] += (float)$item['estimated_amount'];
        $categories[$cat]['actual'] += (float)($item['actual_amount'] ?? 0);
        $categories[$cat]['count']++;

        if ($item['status'] === 'paid') {
            $paidItems++;
            $categories[$cat]['paid']++;

            $var = (float)$item['actual_amount'] - (float)$item['estimated_amount'];
            if ($biggestOverspend === null || $var > $biggestOverspend['variance']) {
                $biggestOverspend = ['description' => $item['description'], 'variance' => $var, 'estimated' => (float)$item['estimated_amount'], 'actual' => (float)$item['actual_amount']];
            }
            if ($biggestSaving === null || $var < $biggestSaving['variance']) {
                $biggestSaving = ['description' => $item['description'], 'variance' => $var, 'estimated' => (float)$item['estimated_amount'], 'actual' => (float)$item['actual_amount']];
            }
        } elseif ($item['status'] === 'planned') {
            $plannedItems++;
        } else {
            $cancelledItems++;
        }
    }

    $costPerHead = $attendeeCount > 0 ? $totalActual / $attendeeCount : 0;
    $accuracyScore = $totalEstimated > 0 ? max(0, 100 - abs($variancePct)) : 0;

    // Category colors
    $catColors = [
        'venue' => [41,128,185],
        'catering' => [39,174,96],
        'transport' => [243,156,18],
        'sound_av' => [142,68,173],
        'printing' => [52,73,94],
        'decoration' => [231,76,60],
        'speaker_honorarium' => [22,160,133],
        'marketing' => [192,57,43],
        'accommodation' => [44,62,80],
        'miscellaneous' => [149,165,166],
    ];

    $catLabels = [
        'venue' => 'Venue & Facilities',
        'catering' => 'Catering',
        'transport' => 'Transport & Logistics',
        'sound_av' => 'Sound & AV',
        'printing' => 'Printing & Stationery',
        'decoration' => 'Decoration',
        'speaker_honorarium' => 'Speaker Honorarium',
        'marketing' => 'Marketing & Publicity',
        'accommodation' => 'Accommodation',
        'miscellaneous' => 'Miscellaneous',
    ];

    // ── Build PDF ────────────────────────────────────────────

    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator('JEN Budget System');
    $pdf->SetTitle('Budget Report - ' . $event['ename']);
    $pdf->SetAutoPageBreak(true, 20);
    $pdf->SetMargins(15, 15, 15);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);

    // ── PAGE 1: Header + Summary ─────────────────────────────

    $pdf->AddPage();

    // Header banner
    $pdf->SetFillColor(30, 30, 60);
    $pdf->RoundedRect(15, 15, 180, 38, 4, '1111', 'F');

    // Logo
    $logoPath = __DIR__ . '/../assets/img/logo/logo-dark.jpeg';
    if (file_exists($logoPath)) {
        $pdf->Image($logoPath, 20, 18, 30, 30, 'JPEG', '', '', true, 300, '', false, false, 0);
    }

    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 18);
    $pdf->SetXY(55, 19);
    $pdf->Cell(135, 8, 'EVENT BUDGET REPORT', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetXY(55, 28);
    $pdf->Cell(135, 5, $event['ename'], 0, 1, 'L');
    $pdf->SetXY(55, 34);
    $pdf->Cell(135, 5, 'Version ' . $budget['version'] . ' | ' . ucfirst($budget['status']) . ' | Generated: ' . date('d M Y, H:i'), 0, 1, 'L');
    $pdf->SetXY(55, 40);
    $pdf->Cell(135, 5, date('d M Y', strtotime($event['start_date'])) . ($event['end_date'] && $event['end_date'] !== $event['start_date'] ? ' - ' . date('d M Y', strtotime($event['end_date'])) : ''), 0, 1, 'L');

    // Status badge
    $statusColors = [
        'draft' => [149,165,166],
        'pending_approval' => [243,156,18],
        'approved' => [39,174,96],
        'rejected' => [231,76,60],
        'closed' => [52,73,94],
    ];
    $sc = $statusColors[$budget['status']] ?? [149,165,166];

    $y = 60;

    // Summary cards row
    $cardW = 42;
    $cardH = 22;
    $gap = 4;
    $startX = 15;

    $cards = [
        ['Budget', 'KES ' . number_format($totalEstimated, 0), [41,128,185]],
        ['Spent', 'KES ' . number_format($totalActual, 0), $totalActual > $totalEstimated ? [231,76,60] : [39,174,96]],
        ['Remaining', 'KES ' . number_format(max(0, $totalEstimated - $totalActual), 0), [22,160,133]],
        ['Variance', ($totalVariance >= 0 ? '+' : '') . number_format($variancePct, 1) . '%', $totalVariance > 0 ? [231,76,60] : [39,174,96]],
    ];

    foreach ($cards as $i => $card) {
        $cx = $startX + $i * ($cardW + $gap);
        $pdf->SetFillColor(...$card[2]);
        $pdf->RoundedRect($cx, $y, $cardW, $cardH, 3, '1111', 'F');
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetXY($cx, $y + 2);
        $pdf->Cell($cardW, 5, $card[0], 0, 0, 'C');
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetXY($cx, $y + 8);
        $pdf->Cell($cardW, 8, $card[1], 0, 0, 'C');
    }

    $y += $cardH + 8;

    // Execution progress bar
    $pdf->SetTextColor(60, 60, 80);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetXY(15, $y);
    $pdf->Cell(180, 6, 'BUDGET EXECUTION', 0, 1, 'L');
    $y += 8;

    $barW = 180;
    $barH = 10;
    $pct = $totalEstimated > 0 ? min(100, ($totalActual / $totalEstimated) * 100) : 0;
    $pdf->SetFillColor(230, 230, 240);
    $pdf->RoundedRect(15, $y, $barW, $barH, 3, '1111', 'F');

    $fillColor = $pct > 100 ? [231,76,60] : ($pct > 80 ? [243,156,18] : [39,174,96]);
    $pdf->SetFillColor(...$fillColor);
    if ($pct > 0) {
        $pdf->RoundedRect(15, $y, max(8, $barW * $pct / 100), $barH, 3, '1111', 'F');
    }
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->SetXY(15, $y + 1);
    $pdf->Cell($barW, $barH - 2, number_format($pct, 1) . '% executed (' . $paidItems . '/' . count($items) . ' items paid)', 0, 0, 'C');

    $y += $barH + 10;

    // ── INSIGHTS ──────────────────────────────────────────────

    $pdf->SetTextColor(60, 60, 80);
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetXY(15, $y);
    $pdf->Cell(180, 6, 'BUDGET INSIGHTS', 0, 1, 'L');
    $y += 8;

    $insights = [];

    // 1. Overall verdict
    if ($totalActual > 0 && $totalEstimated > 0) {
        if (abs($variancePct) <= 5) {
            $insights[] = ['icon' => '✓', 'color' => [39,174,96], 'text' => 'Budget Accuracy: Excellent — spending within 5% of estimates (Accuracy Score: ' . number_format($accuracyScore, 0) . '%)'];
        } elseif ($variancePct > 5) {
            $insights[] = ['icon' => '▲', 'color' => [231,76,60], 'text' => 'Over Budget by ' . number_format(abs($variancePct), 1) . '% — total overspend KES ' . number_format(abs($totalVariance), 0) . '. Review estimates for future events.'];
        } else {
            $insights[] = ['icon' => '▼', 'color' => [39,174,96], 'text' => 'Under Budget by ' . number_format(abs($variancePct), 1) . '% — saved KES ' . number_format(abs($totalVariance), 0) . '. Strong financial discipline.'];
        }
    }

    // 2. Biggest overspend
    if ($biggestOverspend && $biggestOverspend['variance'] > 0) {
        $insights[] = ['icon' => '!', 'color' => [231,76,60], 'text' => 'Biggest Overspend: "' . $biggestOverspend['description'] . '" — exceeded estimate by KES ' . number_format($biggestOverspend['variance'], 0) . ' (' . number_format($biggestOverspend['estimated'], 0) . ' → ' . number_format($biggestOverspend['actual'], 0) . ')'];
    }

    // 3. Biggest saving
    if ($biggestSaving && $biggestSaving['variance'] < 0) {
        $insights[] = ['icon' => '★', 'color' => [39,174,96], 'text' => 'Biggest Saving: "' . $biggestSaving['description'] . '" — saved KES ' . number_format(abs($biggestSaving['variance']), 0) . ' under estimate'];
    }

    // 4. Cost per head
    if ($attendeeCount > 0 && $totalActual > 0) {
        $insights[] = ['icon' => '👤', 'color' => [41,128,185], 'text' => 'Cost Per Attendee: KES ' . number_format($costPerHead, 0) . ' (' . $attendeeCount . ' checked in, KES ' . number_format($totalActual, 0) . ' total spend)'];
    }

    // 5. Pending items
    if ($plannedItems > 0) {
        $unpaid = 0;
        foreach ($items as $item) {
            if ($item['status'] === 'planned') $unpaid += (float)$item['estimated_amount'];
        }
        $insights[] = ['icon' => '⏳', 'color' => [243,156,18], 'text' => $plannedItems . ' items still pending payment (estimated KES ' . number_format($unpaid, 0) . '). Ensure all expenses are recorded.'];
    }

    // 6. Category concentration
    if (!empty($categories)) {
        $catSorted = $categories;
        usort($catSorted, fn($a, $b) => $b['estimated'] <=> $a['estimated']);
        $topCat = $catSorted[0];
        $topPct = $totalEstimated > 0 ? ($topCat['estimated'] / $totalEstimated * 100) : 0;
        if ($topPct > 40) {
            $insights[] = ['icon' => '●', 'color' => [142,68,173], 'text' => 'Category Concentration: ' . ($catLabels[$topCat['category']] ?? $topCat['category']) . ' accounts for ' . number_format($topPct, 0) . '% of the budget. Consider diversifying cost allocation.'];
        }
    }

    foreach ($insights as $ins) {
        if ($y > 260) { $pdf->AddPage(); $y = 20; }
        $pdf->SetFillColor(...$ins['color']);
        $pdf->RoundedRect(15, $y, 3, 12, 1, '1111', 'F');
        $pdf->SetFillColor(245, 245, 250);
        $pdf->RoundedRect(19, $y, 176, 12, 2, '1111', 'F');
        $pdf->SetTextColor(40, 40, 60);
        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetXY(21, $y + 1);
        $pdf->MultiCell(172, 10, $ins['text'], 0, 'L');
        $y += 15;
    }

    // ── CATEGORY BREAKDOWN ────────────────────────────────────

    $y += 5;
    if ($y > 200) { $pdf->AddPage(); $y = 20; }

    $pdf->SetTextColor(60, 60, 80);
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetXY(15, $y);
    $pdf->Cell(180, 6, 'CATEGORY BREAKDOWN', 0, 1, 'L');
    $y += 8;

    // Header
    $pdf->SetFillColor(30, 30, 60);
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 7);
    $colW = [40, 30, 30, 30, 25, 25];
    $headers = ['Category', 'Estimated', 'Actual', 'Variance', 'Items', 'Variance %'];
    $pdf->SetXY(15, $y);
    foreach ($headers as $i => $h) {
        $pdf->Cell($colW[$i], 7, $h, 0, 0, $i === 0 ? 'L' : 'R');
    }
    $y += 7;

    // Rows
    $odd = true;
    foreach ($categories as $cat) {
        if ($y > 270) { $pdf->AddPage(); $y = 20; }

        $catVar = $cat['actual'] - $cat['estimated'];
        $catVarPct = $cat['estimated'] > 0 ? ($catVar / $cat['estimated'] * 100) : 0;
        $color = $catColors[$cat['category']] ?? [149,165,166];

        $pdf->SetFillColor($odd ? 250 : 240, $odd ? 250 : 240, $odd ? 255 : 250);
        $pdf->Rect(15, $y, 180, 7, 'F');

        // Color indicator
        $pdf->SetFillColor(...$color);
        $pdf->Rect(15, $y, 2, 7, 'F');

        $pdf->SetTextColor(40, 40, 60);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetXY(18, $y);
        $pdf->Cell($colW[0] - 3, 7, $catLabels[$cat['category']] ?? $cat['category'], 0, 0, 'L');
        $pdf->Cell($colW[1], 7, number_format($cat['estimated'], 0), 0, 0, 'R');
        $pdf->Cell($colW[2], 7, number_format($cat['actual'], 0), 0, 0, 'R');

        $pdf->SetTextColor($catVar > 0 ? 231 : 39, $catVar > 0 ? 76 : 174, $catVar > 0 ? 60 : 96);
        $pdf->Cell($colW[3], 7, ($catVar >= 0 ? '+' : '') . number_format($catVar, 0), 0, 0, 'R');

        $pdf->SetTextColor(40, 40, 60);
        $pdf->Cell($colW[4], 7, $cat['paid'] . '/' . $cat['count'], 0, 0, 'R');
        $pdf->SetTextColor($catVarPct > 0 ? 231 : 39, $catVarPct > 0 ? 76 : 174, $catVarPct > 0 ? 60 : 96);
        $pdf->Cell($colW[5], 7, ($catVarPct >= 0 ? '+' : '') . number_format($catVarPct, 1) . '%', 0, 0, 'R');

        $y += 7;
        $odd = !$odd;
    }

    // Total row
    $pdf->SetFillColor(30, 30, 60);
    $pdf->Rect(15, $y, 180, 8, 'F');
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 7);
    $pdf->SetXY(15, $y);
    $pdf->Cell($colW[0], 8, 'TOTAL', 0, 0, 'L');
    $pdf->Cell($colW[1], 8, number_format($totalEstimated, 0), 0, 0, 'R');
    $pdf->Cell($colW[2], 8, number_format($totalActual, 0), 0, 0, 'R');
    $pdf->Cell($colW[3], 8, ($totalVariance >= 0 ? '+' : '') . number_format($totalVariance, 0), 0, 0, 'R');
    $pdf->Cell($colW[4], 8, $paidItems . '/' . count($items), 0, 0, 'R');
    $pdf->Cell($colW[5], 8, ($variancePct >= 0 ? '+' : '') . number_format($variancePct, 1) . '%', 0, 0, 'R');
    $y += 12;

    // ── CATEGORY BARS ─────────────────────────────────────────

    if ($y > 200) { $pdf->AddPage(); $y = 20; }

    $pdf->SetTextColor(60, 60, 80);
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetXY(15, $y);
    $pdf->Cell(180, 6, 'ESTIMATED vs ACTUAL BY CATEGORY', 0, 1, 'L');
    $y += 8;

    $maxAmount = 1;
    foreach ($categories as $cat) {
        $maxAmount = max($maxAmount, $cat['estimated'], $cat['actual']);
    }

    foreach ($categories as $cat) {
        if ($y > 265) { $pdf->AddPage(); $y = 20; }

        $color = $catColors[$cat['category']] ?? [149,165,166];
        $label = $catLabels[$cat['category']] ?? $cat['category'];
        $barMaxW = 100;

        $pdf->SetTextColor(40, 40, 60);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetXY(15, $y);
        $pdf->Cell(38, 5, $label, 0, 0, 'R');

        // Estimated bar
        $estW = ($cat['estimated'] / $maxAmount) * $barMaxW;
        $pdf->SetFillColor(...$color);
        $pdf->SetAlpha(0.3);
        $pdf->RoundedRect(55, $y, max(1, $estW), 4, 1, '1111', 'F');
        $pdf->SetAlpha(1);

        // Actual bar
        $actW = ($cat['actual'] / $maxAmount) * $barMaxW;
        $pdf->SetFillColor(...$color);
        $pdf->RoundedRect(55, $y + 4.5, max(0, $actW), 4, 1, '1111', 'F');

        // Labels
        $pdf->SetFont('helvetica', '', 6);
        $pdf->SetXY(55 + max(1, $estW) + 2, $y);
        $pdf->Cell(30, 4, 'Est: ' . number_format($cat['estimated'], 0), 0, 0, 'L');
        $pdf->SetXY(55 + max(0, $actW) + 2, $y + 4.5);
        $pdf->Cell(30, 4, 'Act: ' . number_format($cat['actual'], 0), 0, 0, 'L');

        $y += 12;
    }

    // ── LINE ITEMS DETAIL ─────────────────────────────────────

    $pdf->AddPage();
    $y = 20;

    $pdf->SetTextColor(60, 60, 80);
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetXY(15, $y);
    $pdf->Cell(180, 6, 'LINE ITEMS DETAIL', 0, 1, 'L');
    $y += 8;

    // Header
    $pdf->SetFillColor(30, 30, 60);
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 6);
    $dColW = [35, 40, 20, 20, 20, 15, 18, 12];
    $dHeaders = ['Category', 'Description', 'Estimated', 'Actual', 'Variance', 'Status', 'Vendor', 'JE#'];
    $pdf->SetXY(15, $y);
    foreach ($dHeaders as $i => $h) {
        $pdf->Cell($dColW[$i], 6, $h, 0, 0, $i < 2 ? 'L' : 'R');
    }
    $y += 6;

    // Items
    $odd = true;
    foreach ($items as $item) {
        if ($y > 270) {
            $pdf->AddPage();
            $y = 20;
            // Repeat header
            $pdf->SetFillColor(30, 30, 60);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 6);
            $pdf->SetXY(15, $y);
            foreach ($dHeaders as $i => $h) {
                $pdf->Cell($dColW[$i], 6, $h, 0, 0, $i < 2 ? 'L' : 'R');
            }
            $y += 6;
        }

        $itemVar = (float)($item['actual_amount'] ?? 0) - (float)$item['estimated_amount'];

        $pdf->SetFillColor($odd ? 250 : 240, $odd ? 250 : 240, $odd ? 255 : 250);
        $pdf->Rect(15, $y, 180, 6, 'F');

        // Status color indicator
        $statColor = match($item['status']) {
            'paid' => [39,174,96],
            'cancelled' => [231,76,60],
            default => [243,156,18]
        };
        $pdf->SetFillColor(...$statColor);
        $pdf->Rect(15, $y, 1.5, 6, 'F');

        $pdf->SetTextColor(40, 40, 60);
        $pdf->SetFont('helvetica', '', 6);
        $pdf->SetXY(17, $y);
        $pdf->Cell($dColW[0] - 2, 6, $catLabels[$item['category']] ?? $item['category'], 0, 0, 'L');
        $pdf->Cell($dColW[1], 6, substr($item['description'], 0, 30), 0, 0, 'L');
        $pdf->Cell($dColW[2], 6, number_format($item['estimated_amount'], 0), 0, 0, 'R');
        $pdf->Cell($dColW[3], 6, $item['actual_amount'] !== null ? number_format($item['actual_amount'], 0) : '-', 0, 0, 'R');

        if ($item['status'] === 'paid') {
            $pdf->SetTextColor($itemVar > 0 ? 231 : 39, $itemVar > 0 ? 76 : 174, $itemVar > 0 ? 60 : 96);
        } else {
            $pdf->SetTextColor(149, 165, 166);
        }
        $pdf->Cell($dColW[4], 6, $item['status'] === 'paid' ? (($itemVar >= 0 ? '+' : '') . number_format($itemVar, 0)) : '-', 0, 0, 'R');

        $pdf->SetTextColor(40, 40, 60);
        $pdf->Cell($dColW[5], 6, ucfirst($item['status']), 0, 0, 'R');
        $pdf->Cell($dColW[6], 6, substr($item['vendor'] ?? '-', 0, 12), 0, 0, 'R');
        $pdf->Cell($dColW[7], 6, $item['journal_entry_id'] ? '#' . $item['journal_entry_id'] : '-', 0, 0, 'R');

        $y += 6;
        $odd = !$odd;
    }

    // ── AUDIT TRAIL ───────────────────────────────────────────

    if (!empty($audit)) {
        $y += 10;
        if ($y > 200) { $pdf->AddPage(); $y = 20; }

        $pdf->SetTextColor(60, 60, 80);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetXY(15, $y);
        $pdf->Cell(180, 6, 'AUDIT TRAIL', 0, 1, 'L');
        $y += 8;

        foreach ($audit as $a) {
            if ($y > 275) { $pdf->AddPage(); $y = 20; }

            $pdf->SetFont('helvetica', 'B', 6);
            $pdf->SetTextColor(100, 100, 120);
            $pdf->SetXY(15, $y);
            $pdf->Cell(30, 4, date('d M Y H:i', strtotime($a['performed_at'])), 0, 0, 'L');
            $pdf->SetFont('helvetica', 'B', 6);
            $pdf->SetTextColor(60, 60, 80);
            $pdf->Cell(15, 4, strtoupper($a['action']), 0, 0, 'L');
            $pdf->SetFont('helvetica', '', 6);
            $pdf->Cell(90, 4, $a['by_name'] ?? 'System', 0, 0, 'L');
            $y += 4;
            if ($a['details']) {
                $pdf->SetTextColor(100, 100, 120);
                $pdf->SetFont('helvetica', '', 6);
                $pdf->SetXY(20, $y);
                $pdf->MultiCell(170, 3, $a['details'], 0, 'L');
                $y += 5;
            }
            $y += 1;
        }
    }

    // ── Footer on last page ───────────────────────────────────

    $pdf->SetTextColor(150, 150, 170);
    $pdf->SetFont('helvetica', 'I', 7);
    $pdf->SetXY(15, 280);
    $pdf->Cell(180, 5, 'Jesus Enthroned Network | Budget Report | Generated ' . date('d/m/Y H:i') . ' | Page ' . $pdf->getAliasNumPage() . ' of ' . $pdf->getAliasNbPages(), 0, 0, 'C');

    // ── Output ────────────────────────────────────────────────

    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="Budget_Report_' . preg_replace('/[^a-zA-Z0-9_]/', '_', $event['ename']) . '_v' . $budget['version'] . '.pdf"');
    $pdf->Output('Budget_Report.pdf', 'I');

} catch (\Exception $e) {
    error_log("Event budget report PDF error: " . $e->getMessage());
    apiError('Failed to generate report: ' . $e->getMessage(), 500);
}
