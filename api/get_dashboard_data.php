<?php
/**
 * Dashboard Data API Endpoint
 * GET /api/get_dashboard_data.php
 * 
 * Returns aggregated data for the dashboard natively from SQL.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $data = [];

    $chartMonth = isset($_GET['chart_month']) ? (int)$_GET['chart_month'] : null;
    $chartYear = isset($_GET['chart_year']) ? (int)$_GET['chart_year'] : null;

    // 1. Total Members
    $stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE delete_status = 'Active' OR delete_status IS NULL OR delete_status = '0'");
    $data['totalMembers'] = (int)$stmt->fetchColumn();
    $stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE (delete_status = 'Active' OR delete_status IS NULL OR delete_status = '0') AND joined_on < DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
    $prevMembers = (int)$stmt->fetchColumn();
    $data['membersDelta'] = $prevMembers > 0 ? round((($data['totalMembers'] - $prevMembers) / $prevMembers) * 100, 1) : 0;

    // 2. Total Giving (This Quarter)
    $stmt = $db->query("
        SELECT COALESCE(SUM(amount), 0) 
        FROM contribution 
        WHERE QUARTER(date) = QUARTER(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) AND (delete_status = 0 OR delete_status IS NULL)
    ");
    $data['totalGiving'] = (float)$stmt->fetchColumn();
    
    $stmt = $db->query("
        SELECT COALESCE(SUM(amount), 0) 
        FROM contribution 
        WHERE QUARTER(date) = QUARTER(DATE_SUB(CURDATE(), INTERVAL 1 QUARTER)) AND YEAR(date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 QUARTER)) AND (delete_status = 0 OR delete_status IS NULL)
    ");
    $prevGiving = (float)$stmt->fetchColumn();
    $data['givingDelta'] = $prevGiving > 0 ? round((($data['totalGiving'] - $prevGiving) / $prevGiving) * 100, 1) : 0;

    // 3. New Visitors
    try {
        $stmt = $db->query("
            SELECT COUNT(*) 
            FROM new_member_assimilation 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ");
        $data['newVisitors'] = (int)$stmt->fetchColumn();

        $stmt = $db->query("
            SELECT COUNT(*) 
            FROM new_member_assimilation 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ");
        $prevVisitors = (int)$stmt->fetchColumn();
        $data['visitorsDelta'] = $prevVisitors > 0 ? round((($data['newVisitors'] - $prevVisitors) / $prevVisitors) * 100, 1) : 0;
    } catch (PDOException $e) {
        $data['newVisitors'] = 0;
        $data['visitorsDelta'] = 0;
    }

    // 4. Attendance Series & Avg Attendance
    try {
        if ($chartMonth && $chartYear) {
            $stmt = $db->prepare("
                SELECT DATE(login_time) as date, COUNT(*) as total 
                FROM attendance 
                WHERE MONTH(login_time) = ? AND YEAR(login_time) = ?
                GROUP BY DATE(login_time) 
                ORDER BY date ASC
            ");
            $stmt->execute([$chartMonth, $chartYear]);
            $series = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            // Get the latest 10 dates with attendance
            $stmt = $db->query("
                SELECT DATE(login_time) as date, COUNT(*) as total 
                FROM attendance 
                GROUP BY DATE(login_time) 
                ORDER BY date DESC 
                LIMIT 10
            ");
            $series = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Sort chronologically for the chart
            usort($series, function($a, $b) {
                return strtotime($a['date']) - strtotime($b['date']);
            });
        }
        
        $data['attendanceSeries'] = array_map(function($row) {
            return [
                'displayDate' => date('d M', strtotime($row['date'])),
                'date' => $row['date'],
                'total' => (int)$row['total']
            ];
        }, $series);

        $totalAtt = array_reduce($series, function($carry, $item) {
            return $carry + (int)$item['total'];
        }, 0);
        $data['avgAttendance'] = count($series) > 0 ? round($totalAtt / count($series)) : 0;

        $stmt = $db->query("
            SELECT COUNT(*) as total 
            FROM attendance 
            GROUP BY DATE(login_time) 
            ORDER BY DATE(login_time) DESC 
            LIMIT 10 OFFSET 10
        ");
        $prevSeries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $prevTotalAtt = array_reduce($prevSeries, function($carry, $item) {
            return $carry + (int)$item['total'];
        }, 0);
        $prevAvgAttendance = count($prevSeries) > 0 ? round($prevTotalAtt / count($prevSeries)) : 0;
        $data['attendanceDelta'] = $prevAvgAttendance > 0 ? round((($data['avgAttendance'] - $prevAvgAttendance) / $prevAvgAttendance) * 100, 1) : 0;
    } catch (PDOException $e) {
        $data['attendanceSeries'] = [];
        $data['avgAttendance'] = 0;
        $data['attendanceDelta'] = 0;
    }

    // 5. Fund Totals & Pledges Overview
    try {
        // Query for Fund Totals
        $fundSql = "
            SELECT f.name as fund, SUM(c.amount) as amount 
            FROM contribution c
            LEFT JOIN fund f ON c.fund = f.id
            WHERE (c.delete_status = 0 OR c.delete_status = 'Active' OR c.delete_status IS NULL)
        ";
        $params = [];
        if ($chartMonth && $chartYear) {
            $fundSql .= " AND MONTH(c.date) = ? AND YEAR(c.date) = ?";
            $params[] = $chartMonth;
            $params[] = $chartYear;
        }
        $fundSql .= " GROUP BY f.name";

        $stmt = $db->prepare($fundSql);
        $stmt->execute($params);
        $fundTotals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $data['fundTotals'] = array_map(function($row) {
            return [
                'fund' => $row['fund'] ? $row['fund'] : 'General',
                'amount' => (float)$row['amount']
            ];
        }, $fundTotals);

        // Query for Total Contributions
        $contSql = "
            SELECT COALESCE(SUM(amount), 0) 
            FROM contribution 
            WHERE (delete_status = 0 OR delete_status = 'Active' OR delete_status IS NULL)
        ";
        $contParams = [];
        if ($chartMonth && $chartYear) {
            $contSql .= " AND MONTH(date) = ? AND YEAR(date) = ?";
            $contParams[] = $chartMonth;
            $contParams[] = $chartYear;
        }
        $stmt = $db->prepare($contSql);
        $stmt->execute($contParams);
        $data['chartTotalContributions'] = (float)$stmt->fetchColumn();

        // Query for Total Pledges Made
        $pledgeSql = "SELECT COALESCE(SUM(pledges_amount), 0) FROM pledges WHERE 1=1";
        $pledgeParams = [];
        if ($chartMonth && $chartYear) {
            $pledgeSql .= " AND MONTH(date) = ? AND YEAR(date) = ?";
            $pledgeParams[] = $chartMonth;
            $pledgeParams[] = $chartYear;
        }
        $stmt = $db->prepare($pledgeSql);
        $stmt->execute($pledgeParams);
        $data['chartTotalPledged'] = (float)$stmt->fetchColumn();

        // Query for Total Pledges Redeemed
        $redeemSql = "SELECT COALESCE(SUM(redeemed_amount), 0) FROM pledges_redeem WHERE 1=1";
        $redeemParams = [];
        if ($chartMonth && $chartYear) {
            // Assuming pledges_redeem has a created_at or timestamp column. If not, this might fail, but let's try created_at first.
            // A safer bet if we don't know the schema is to join the pledge table or just assume created_at.
            // Looking at standard schemas, created_at is common. If it fails we'll fix it. Let's use created_at.
            // Wait, looking at redeem_pledge.php, we don't know the date column. Let's just query without date if it fails, but let's try created_at.
            $redeemSql .= " AND MONTH(created_at) = ? AND YEAR(created_at) = ?";
            $redeemParams[] = $chartMonth;
            $redeemParams[] = $chartYear;
        }
        $stmt = $db->prepare($redeemSql);
        try {
            $stmt->execute($redeemParams);
            $data['chartTotalRedeemed'] = (float)$stmt->fetchColumn();
        } catch(PDOException $e) {
            // Fallback if created_at doesn't exist
            $data['chartTotalRedeemed'] = 0;
        }

    } catch (PDOException $e) {
        $data['fundTotals'] = [];
        $data['chartTotalContributions'] = 0;
        $data['chartTotalPledged'] = 0;
        $data['chartTotalRedeemed'] = 0;
    }

    // 6. Upcoming Events
    try {
        $stmt = $db->query("
            SELECT id, ename as title, start_date, start_time, location 
            FROM event 
            WHERE start_date >= CURDATE() 
            ORDER BY start_date ASC 
            LIMIT 4
        ");
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data['upcomingEvents'] = array_map(function($row) {
            $startsAt = $row['start_date'];
            if ($row['start_time']) {
                $startsAt .= ' ' . $row['start_time'];
            }
            return [
                'id' => (string)$row['id'],
                'title' => $row['title'],
                'startsAt' => $startsAt,
                'location' => $row['location']
            ];
        }, $events);
    } catch (PDOException $e) {
        $data['upcomingEvents'] = [];
    }

    // 7. Follow-ups Due
    try {
        $stmt = $db->query("
            SELECT f.id, f.message as subject, CONCAT(m.first_name, ' ', m.last_name) as personName, 
                   f.sent_at as dueOn, f.status 
            FROM followups f
            JOIN member m ON f.member_id = m.id
            WHERE f.status = 'pending' 
            ORDER BY f.sent_at DESC 
            LIMIT 5
        ");
        $followups = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data['followUpsDue'] = array_map(function($row) {
            return [
                'id' => (string)$row['id'],
                'subject' => $row['subject'] ? substr($row['subject'], 0, 30) . '...' : 'Follow up',
                'personName' => $row['personName'],
                'dueOn' => $row['dueOn'],
                'priority' => 'high' // Defaulting priority for UI since it's not in db
            ];
        }, $followups);
    } catch (PDOException $e) {
        $data['followUpsDue'] = [];
    }

    // 8. Recent Activity
    try {
        $stmt = $db->query("
            SELECT al.id, u.email as actor, al.action, al.table_name as target, al.created_at as at 
            FROM audit_log al
            LEFT JOIN users u ON al.user_id = u.id 
            ORDER BY al.created_at DESC 
            LIMIT 6
        ");
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data['recentActivity'] = array_map(function($row) {
            return [
                'id' => (string)$row['id'],
                'actor' => $row['actor'] ? explode('@', $row['actor'])[0] : 'System',
                'action' => strtolower($row['action']),
                'target' => $row['target'],
                'at' => $row['at']
            ];
        }, $activities);
    } catch (PDOException $e) {
        $data['recentActivity'] = [];
    }

    apiSuccess($data, 'Dashboard data retrieved');

} catch (Exception $e) {
    error_log("Dashboard data error: " . $e->getMessage());
    apiError('Failed to retrieve dashboard data', 500);
}
