<?php
/**
 * Dashboard Stats API Endpoint
 * GET /api/get_dashboard_stats.php
 * 
 * Returns comprehensive dashboard statistics
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

// Optional authentication - returns more data if authenticated
$user = optionalAuth();

try {
    $stats = [];
    
    // Total Members
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE delete_status IS NULL OR delete_status = 0");
        $stats['total_members'] = (int) $stmt->fetch()['total'];
    } catch (PDOException $e) {
        // Try without delete_status filter
        try {
            $stmt = $db->query("SELECT COUNT(*) as total FROM member");
            $stats['total_members'] = (int) $stmt->fetch()['total'];
        } catch (PDOException $e2) {
            $stats['total_members'] = 0;
        }
    }
    
    // Active Cells
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM cells");
        $stats['total_cells'] = (int) $stmt->fetch()['total'];
    } catch (PDOException $e) {
        $stats['total_cells'] = 0;
    }
    
    // Upcoming Events
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM event WHERE start_date >= CURDATE()");
        $stats['upcoming_events'] = (int) $stmt->fetch()['total'];
    } catch (PDOException $e) {
        $stats['upcoming_events'] = 0;
    }
    
    // Next Event
    try {
        $stmt = $db->query("
            SELECT ename, start_date, start_time 
            FROM event 
            WHERE start_date >= CURDATE() 
            ORDER BY start_date ASC, start_time ASC 
            LIMIT 1
        ");
        $nextEvent = $stmt->fetch();
        if ($nextEvent) {
            $stats['next_event'] = [
                'name' => $nextEvent['ename'],
                'date' => $nextEvent['start_date'],
                'time' => $nextEvent['start_time'] ?? null
            ];
        }
    } catch (PDOException $e) {
        // No event data
    }
    
    // Pledges Stats
    try {
        $stmt = $db->query("
            SELECT 
                COUNT(*) as total_pledges,
                COALESCE(SUM(pledges_amount), 0) as total_amount,
                COUNT(CASE WHEN status = 1 THEN 1 END) as active_pledges
            FROM pledges
        ");
        $pledgeStats = $stmt->fetch();
        $stats['pledges'] = [
            'total' => (int) $pledgeStats['total_pledges'],
            'amount' => (float) $pledgeStats['total_amount'],
            'active' => (int) $pledgeStats['active_pledges']
        ];
    } catch (PDOException $e) {
        $stats['pledges'] = ['total' => 0, 'amount' => 0, 'active' => 0];
    }
    
    // Year-to-date Giving
    try {
        $currentYear = date('Y');
        $stmt = $db->prepare("
            SELECT COALESCE(SUM(pledges_amount), 0) as ytd_giving
            FROM pledges 
            WHERE YEAR(date) = :year
        ");
        $stmt->execute([':year' => $currentYear]);
        $stats['ytd_giving'] = (float) $stmt->fetch()['ytd_giving'];
    } catch (PDOException $e) {
        $stats['ytd_giving'] = 0;
    }
    
    // New members this month
    try {
        $stmt = $db->query("
            SELECT COUNT(*) as total 
            FROM member 
            WHERE MONTH(joined_on) = MONTH(CURDATE()) 
            AND YEAR(joined_on) = YEAR(CURDATE())
        ");
        $stats['new_members_month'] = (int) $stmt->fetch()['total'];
    } catch (PDOException $e) {
        $stats['new_members_month'] = 0;
    }
    
    // If user is authenticated, include personal stats
    if ($user && isset($user->member_id) && $user->member_id) {
        // User's cell info
        try {
            $stmt = $db->prepare("
                SELECT c.id, c.code, c.cell_name, 
                       (SELECT COUNT(*) FROM member WHERE cell_id = c.id) as member_count
                FROM member m
                JOIN cells c ON m.cell_id = c.id
                WHERE m.id = :member_id
            ");
            $stmt->execute([':member_id' => $user->member_id]);
            $cellInfo = $stmt->fetch();
            if ($cellInfo) {
                $stats['my_cell'] = [
                    'id' => $cellInfo['id'],
                    'code' => $cellInfo['code'],
                    'name' => $cellInfo['cell_name'],
                    'members' => (int) $cellInfo['member_count']
                ];
            }
        } catch (PDOException $e) {
            // No cell data for user
        }
        
        // User's giving this year
        try {
            $currentYear = date('Y');
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(pledges_amount), 0) as my_giving
                FROM pledges 
                WHERE member_id = :member_id 
                AND YEAR(date) = :year
            ");
            $stmt->execute([':member_id' => $user->member_id, ':year' => $currentYear]);
            $stats['my_giving_ytd'] = (float) $stmt->fetch()['my_giving'];
        } catch (PDOException $e) {
            $stats['my_giving_ytd'] = 0;
        }
    }
    
    apiSuccess($stats, 'Dashboard stats retrieved');
    
} catch (Exception $e) {
    error_log("Dashboard stats error: " . $e->getMessage());
    apiError('Failed to retrieve dashboard stats: ' . $e->getMessage(), 500);
}