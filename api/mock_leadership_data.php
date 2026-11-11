<?php
header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : 'dashboard';

if ($action === 'dashboard') {
    $data = [
        'kpis' => [
            'total_new_members' => [
                'value' => 142,
                'trend' => 15,
                'trend_type' => 'up' // up or down
            ],
            'followup_rate' => [
                'value' => 82 // percentage
            ],
            'active_cell_attendance' => [
                'value' => 1254,
                'trend' => 5,
                'trend_type' => 'up'
            ],
            'discipleship_saturation' => [
                'value' => 45 // percentage
            ],
            'leaders_in_training' => [
                'value' => 87,
                'trend' => 12,
                'trend_type' => 'up'
            ],
            'multiplied_cells' => [
                'value' => 14,
                'trend' => 2,
                'trend_type' => 'up'
            ]
        ],
        'funnel' => [
            // Reversing the order slightly or keeping it logical. High to low for a funnel.
            ['stage' => 'Total New Members', 'count' => 2000],
            ['stage' => 'Assigned to Cell', 'count' => 1650],
            ['stage' => 'Active in Cell', 'count' => 1254],
            ['stage' => 'In Active Discipleship', 'count' => 890],
            ['stage' => 'Enrolled in Leadership LMS', 'count' => 312],
            ['stage' => 'Completed Leadership Training', 'count' => 180],
            ['stage' => 'Currently Leading', 'count' => 110]
        ],
        'alerts' => [
            [
                'priority' => 'Red',
                'name' => 'Michael Johnson',
                'type' => 'Uncontacted > 48hrs',
                'module' => 'New Members',
                'date' => date('Y-m-d', strtotime('-2 days')),
                'action_label' => 'Assign Follow-Up',
                'action_url' => '#'
            ],
            [
                'priority' => 'Red',
                'name' => 'Sarah Williams',
                'type' => 'No Session > 21 days',
                'module' => 'Discipleship',
                'date' => date('Y-m-d', strtotime('-22 days')),
                'action_label' => 'Message Discipler',
                'action_url' => '#'
            ],
            [
                'priority' => 'Red',
                'name' => 'David Osei (Youth Cell)',
                'type' => 'Missing Weekly Report',
                'module' => 'Cell Management',
                'date' => date('Y-m-d', strtotime('-15 days')),
                'action_label' => 'Contact Leader',
                'action_url' => '#'
            ],
            [
                'priority' => 'Amber',
                'name' => 'Grace Cell',
                'type' => 'Attendance Drop > 30%',
                'module' => 'Cell Management',
                'date' => date('Y-m-d', strtotime('-5 days')),
                'action_label' => 'View Cell Trends',
                'action_url' => '#'
            ],
            [
                'priority' => 'Amber',
                'name' => 'Peter Ndlovu',
                'type' => 'LMS Stalled < 10%',
                'module' => 'Leadership LMS',
                'date' => date('Y-m-d', strtotime('-31 days')),
                'action_label' => 'Message Coach',
                'action_url' => '#'
            ]
        ]
    ];
    echo json_encode($data);
} elseif ($action === 'search') {
    $query = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
    
    // Mock response for any search
    if (strlen($query) > 2) {
        $data = [
            'success' => true,
            'member' => [
                'name' => 'John Doe',
                'phone' => '+1 234 567 8900',
                'joined' => 'Oct 15, 2025',
                'photo' => 'assets/img/avatars/1.png',
                'new_members' => [
                    'status' => 'Cell Assigned',
                    'logs' => 'Followed up by Admin on Oct 16. Assigned to Grace Cell.'
                ],
                'cell_life' => [
                    'cell_name' => 'Grace Cell',
                    'join_date' => 'Oct 20, 2025',
                    'attendance_rate' => '12 of last 14 meetings',
                    'last_attendance' => date('M d, Y', strtotime('-3 days'))
                ],
                'discipleship' => [
                    'stage' => 'Foundation',
                    'discipler' => 'Pastor Mark',
                    'last_session' => date('M d, Y', strtotime('-5 days')),
                    'sparkline_data' => [4, 5, 3, 5, 6, 7] // 6 sessions
                ],
                'lms' => [
                    'enrolled_course' => 'New Cell Leader Training',
                    'progress' => 45,
                    'coach' => 'Elder Simon',
                    'pending_evals' => 1
                ]
            ]
        ];
    } else {
        $data = ['success' => false, 'error' => 'Query too short or no match found'];
    }
    echo json_encode($data);
}
