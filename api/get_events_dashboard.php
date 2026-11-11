<?php
/**
 * Get Events Dashboard Data API
 * GET /api/get_events_dashboard.php
 * 
 * Returns comprehensive event dashboard data
 */

require_once __DIR__ . '/config.php';

try {
    $data = [];
    $today = date('Y-m-d');
    
    // Get upcoming event
    try {
        $stmt = $db->prepare("
            SELECT 
                e.id, e.ename, e.start_date, e.end_date, e.notes,
                e.branch as venue, e.target_attendees, e.facilitation_fee
            FROM event e 
            WHERE e.start_date >= :today 
            ORDER BY e.start_date ASC 
            LIMIT 1
        ");
        $stmt->execute([':today' => $today]);
        $upcomingEvent = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($upcomingEvent) {
            // Get registration stats for this event
            $regStmt = $db->prepare("
                SELECT 
                    COUNT(*) as total_registered,
                    COUNT(CASE WHEN sponsorship = 'sponsored-fully' THEN 1 END) as sponsored
                FROM event_registration 
                WHERE event_id = :event_id
            ");
            $regStmt->execute([':event_id' => $upcomingEvent['id']]);
            $regStats = $regStmt->fetch(PDO::FETCH_ASSOC);
            
            $upcomingEvent['registered'] = (int)($regStats['total_registered'] ?? 0);
            $upcomingEvent['sponsored'] = (int)($regStats['sponsored'] ?? 0);
            $upcomingEvent['target_attendees'] = (int)($upcomingEvent['target_attendees'] ?? 0);
        }
        $data['upcoming_event'] = $upcomingEvent;
    } catch (PDOException $e) {
        $data['upcoming_event'] = null;
    }
    
    // Get all upcoming events for registration stats
    try {
        $stmt = $db->prepare("
            SELECT 
                e.id, e.ename, e.target_attendees,
                COUNT(DISTINCT r.id) AS total_registrations,
                COUNT(DISTINCT i.id) AS total_invitees
            FROM event e 
            LEFT JOIN event_registration r ON e.id = r.event_id 
            LEFT JOIN invitees i ON e.id = i.event_id 
            WHERE e.start_date >= :today 
            GROUP BY e.id, e.ename, e.target_attendees 
            ORDER BY e.start_date ASC
        ");
        $stmt->execute([':today' => $today]);
        $data['registration_stats'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $data['registration_stats'] = [];
    }
    
    // Calculate overall registration progress
    $totalTarget = 0;
    $totalRegistered = 0;
    $totalInvited = 0;
    foreach ($data['registration_stats'] as $event) {
        $totalTarget += (int)($event['target_attendees'] ?? 0);
        $totalRegistered += (int)($event['total_registrations'] ?? 0);
        $totalInvited += (int)($event['total_invitees'] ?? 0);
    }
    $data['overall_progress'] = [
        'target' => $totalTarget,
        'registered' => $totalRegistered,
        'invited' => $totalInvited,
        'percentage' => $totalTarget > 0 ? round(($totalRegistered / $totalTarget) * 100, 1) : 0
    ];
    
    // Get financial stats for upcoming event
    try {
        if (!empty($data['upcoming_event'])) {
            $eventId = $data['upcoming_event']['id'];
            $facilitation_fee = (float)($data['upcoming_event']['facilitation_fee'] ?? 0);
            $registered = $data['upcoming_event']['registered'];
            $sponsored = $data['upcoming_event']['sponsored'];
            
            $total_collection = $registered * $facilitation_fee;
            $sponsored_collection = $sponsored * $facilitation_fee;
            
            // Get actual collected amount
            try {
                $payStmt = $db->prepare("SELECT SUM(amount) AS total_collected FROM registration_fee WHERE event_id = :event_id");
                $payStmt->execute([':event_id' => $eventId]);
                $payments = $payStmt->fetch(PDO::FETCH_ASSOC);
                $collected = (float)($payments['total_collected'] ?? 0);
            } catch (PDOException $e) {
                $collected = 0;
            }
            
            $data['financial_stats'] = [
                'total_collection' => $total_collection,
                'sponsored_collection' => $sponsored_collection,
                'collected' => $collected,
                'pending' => max($total_collection - $collected, 0)
            ];
        } else {
            $data['financial_stats'] = [
                'total_collection' => 0,
                'sponsored_collection' => 0,
                'collected' => 0,
                'pending' => 0
            ];
        }
    } catch (PDOException $e) {
        $data['financial_stats'] = ['total_collection' => 0, 'sponsored_collection' => 0, 'collected' => 0, 'pending' => 0];
    }
    
    // Get gender distribution from event registrations
    try {
        if (!empty($data['upcoming_event'])) {
            $genderStmt = $db->prepare("
                SELECT 
                    COALESCE(m.gender, 'Unknown') as gender,
                    COUNT(*) as count
                FROM event_registration er
                LEFT JOIN member m ON er.member_id = m.id
                WHERE er.event_id = :event_id
                GROUP BY m.gender
            ");
            $genderStmt->execute([':event_id' => $data['upcoming_event']['id']]);
            $genderData = $genderStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $data['gender_distribution'] = $genderData;
            $data['gender_total'] = array_sum(array_column($genderData, 'count'));
        } else {
            $data['gender_distribution'] = [];
            $data['gender_total'] = 0;
        }
    } catch (PDOException $e) {
        $data['gender_distribution'] = [];
        $data['gender_total'] = 0;
    }
    
    // Get all events list
    try {
        $stmt = $db->query("
            SELECT id, ename, notes, start_date, end_date, branch as venue, 
                   target_attendees, COALESCE(type, 'general') as type, status
            FROM event 
            ORDER BY start_date DESC
            LIMIT 50
        ");
        $data['all_events'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $data['all_events'] = [];
    }
    
    // Get event stats summary
    try {
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM event");
        $stmt->execute();
        $totalEvents = $stmt->fetch()['total'];
        
        $stmt = $db->prepare("SELECT COUNT(*) as upcoming FROM event WHERE start_date >= :today");
        $stmt->execute([':today' => $today]);
        $upcomingCount = $stmt->fetch()['upcoming'];
        
        $stmt = $db->prepare("SELECT COUNT(*) as past FROM event WHERE start_date < :today");
        $stmt->execute([':today' => $today]);
        $pastCount = $stmt->fetch()['past'];
        
        $data['summary'] = [
            'total_events' => (int)$totalEvents,
            'upcoming_count' => (int)$upcomingCount,
            'past_count' => (int)$pastCount
        ];
    } catch (PDOException $e) {
        $data['summary'] = ['total_events' => 0, 'upcoming_count' => 0, 'past_count' => 0];
    }
    
    apiSuccess($data, 'Events dashboard data retrieved');
    
} catch (Exception $e) {
    error_log("Events Dashboard API error: " . $e->getMessage());
    apiError('Failed to retrieve events data', 500);
}
