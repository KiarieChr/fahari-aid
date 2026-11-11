<?php 
include('includes/checklogin.php');

$title = "Meeting Attendance | Analytics & Follow-up";
include("includes/get_user.php");

// Get filters
$meeting_id = isset($_GET['id']) ? intval($_GET['id']) : null;
$member_id = isset($_GET['member_id']) ? intval($_GET['member_id']) : null;
$cell_id = isset($_GET['cell_id']) ? intval($_GET['cell_id']) : null;
$department_id = isset($_GET['department_id']) ? intval($_GET['department_id']) : null;
$gender = isset($_GET['gender']) && $_GET['gender'] !== '' ? trim($_GET['gender']) : null;

// Get all meetings for dropdown
$meetings_stmt = $db->query("SELECT id, name, start_time FROM meeting ORDER BY start_time DESC");
$all_meetings = $meetings_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get all cells for dropdown
$cells_stmt = $db->query("SELECT id, code, name FROM cells ORDER BY code ASC");
$all_cells = $cells_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get all departments for dropdown
$depts_stmt = $db->query("SELECT id, name FROM departments WHERE delete_status = 0 ORDER BY name ASC");
$all_departments = $depts_stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" dir="ltr">
<head>
    <?php @include('includes/header.php');?>
    <style>
        :root {
            --attended-color: #28a745;
            --absent-color: #dc3545;
            --followup-color: #ffc107;
            --regular-color: #17a2b8;
        }
        
        .attendance-card {
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: transform 0.3s;
        }
        
        .attendance-card:hover {
            transform: translateY(-3px);
        }
        
        .attendance-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .attendance-chart {
            height: 300px;
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .progress-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 20px;
        }
        
        .member-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: bold;
            color: white;
        }
        
        .followup-highlight {
            border-left: 3px solid var(--followup-color);
            background: rgba(255, 193, 7, 0.03);
        }
        
        .status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        }
        
        .status-attended {
            background-color: var(--attended-color);
        }
        
        .status-absent {
            background-color: var(--absent-color);
        }
        
        .status-followup {
            background-color: var(--followup-color);
        }
        
        .stats-card {
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid #e9ecef;
        }
        
        .stats-number {
            font-size: 2rem;
            font-weight: 700;
            line-height: 1;
        }
        
        .stats-label {
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .heatmap-cell {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            margin: 2px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .heatmap-cell:hover {
            transform: scale(1.1);
        }
        
        .attendance-0 { background-color: #ebedf0; } /* No meetings */
        .attendance-1 { background-color: #c6e48b; } /* 1-25% */
        .attendance-2 { background-color: #7bc96f; } /* 26-50% */
        .attendance-3 { background-color: #239a3b; } /* 51-75% */
        .attendance-4 { background-color: #196127; } /* 76-100% */
        
        .tab-content {
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .filter-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
        <div class="layout-container">
            <!-- Menu -->
            <?php @include('includes/sidebar.php'); ?>
            <!-- / Menu -->

            <!-- Layout container -->
            <div class="layout-page">
                <?php @include('includes/nav.php'); ?>
                <?php @include('modals/meeting-m.php'); ?>

                <!-- Content wrapper -->
                <div class="content-wrapper">
                    <!-- Content -->
                    <div class="container-xxl flex-grow-1 container-p-y">
                        <!-- Page Header -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 class="mb-1">Attendance Analytics & Follow-up</h4>
                                        <p class="text-muted mb-0">Track individual attendance and identify members needing follow-up</p>
                                    </div>
                                    <div class="dropdown">
                                        <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            <i class="bx bx-download me-2"></i>Export
                                        </button>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item" href="#" onclick="exportToExcel()">
                                                <i class="bx bx-file me-2"></i>Excel
                                            </a>
                                            <a class="dropdown-item" href="#" onclick="exportToPDF()">
                                                <i class="bx bx-file-pdf me-2"></i>PDF
                                            </a>
                                            <a class="dropdown-item" href="#" onclick="printReport()">
                                                <i class="bx bx-printer me-2"></i>Print
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Filters -->
                        <div class="filter-card card shadow-sm mb-4">
                            <div class="card-header d-flex align-items-center bg-transparent border-bottom-0 pb-1">
                                <i class="bx bx-filter-alt text-primary fs-4 me-2"></i>
                                <h5 class="mb-0 fw-semibold text-primary">Filter and Search Options</h5>
                            </div>
                            <div class="card-body pt-2">
                                <div class="row g-3">
                                    <!-- Row 1: Reloading Filters -->
                                    <div class="col-md-3">
                                        <label class="form-label fw-medium text-secondary">Select Meeting</label>
                                        <select class="form-select border-light-subtle shadow-xs" id="meetingFilter" onchange="applyFilters()">
                                            <option value="">All Meetings</option>
                                            <?php foreach ($all_meetings as $meeting): ?>
                                            <option value="<?php echo $meeting['id']; ?>" <?php echo $meeting_id == $meeting['id'] ? 'selected' : ''; ?>>
                                                <?php echo htmlspecialchars($meeting['name'] . ' - ' . date('M d, Y', strtotime($meeting['start_time']))); ?>
                                            </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label fw-medium text-secondary">Cell Group</label>
                                        <select class="form-select border-light-subtle shadow-xs" id="cellFilter" onchange="applyFilters()">
                                            <option value="">All Cell Groups</option>
                                            <?php foreach ($all_cells as $cell): ?>
                                            <option value="<?php echo $cell['id']; ?>" <?php echo $cell_id == $cell['id'] ? 'selected' : ''; ?>>
                                                <?php echo htmlspecialchars($cell['code'] . ' - ' . $cell['name']); ?>
                                            </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label fw-medium text-secondary">Department</label>
                                        <select class="form-select border-light-subtle shadow-xs" id="deptFilter" onchange="applyFilters()">
                                            <option value="">All Departments</option>
                                            <?php foreach ($all_departments as $dept): ?>
                                            <option value="<?php echo $dept['id']; ?>" <?php echo $department_id == $dept['id'] ? 'selected' : ''; ?>>
                                                <?php echo htmlspecialchars($dept['name']); ?>
                                            </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label fw-medium text-secondary">Gender</label>
                                        <select class="form-select border-light-subtle shadow-xs" id="genderFilter" onchange="applyFilters()">
                                            <option value="">All Genders</option>
                                            <option value="Male" <?php echo $gender === 'Male' ? 'selected' : ''; ?>>Male</option>
                                            <option value="Female" <?php echo $gender === 'Female' ? 'selected' : ''; ?>>Female</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Row 2: Client Side Search Filters -->
                                    <div class="col-md-4">
                                        <label class="form-label fw-medium text-secondary">Attendance Status</label>
                                        <select class="form-select border-light-subtle shadow-xs" id="statusFilter" onchange="filterByStatus(this.value)">
                                            <option value="">All Statuses</option>
                                            <option value="Regular">Regular (80%+)</option>
                                            <option value="Irregular">Irregular (50-79%)</option>
                                            <option value="Needs Follow-up">Needs Follow-up (<50%)</option>
                                        </select>
                                    </div>
                                    <div class="col-md-8">
                                        <label class="form-label fw-medium text-secondary">Search Member</label>
                                        <div class="input-group shadow-xs">
                                            <input type="text" class="form-control border-light-subtle" id="memberSearch" placeholder="Search by name, contact, email or details..." onkeyup="searchMembers(this.value)">
                                            <button class="btn btn-outline-secondary" type="button">
                                                <i class="bx bx-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tabs -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <ul class="nav nav-tabs" id="attendanceTabs" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button">
                                            <i class="bx bx-bar-chart me-2"></i>Overview
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="individual-tab" data-bs-toggle="tab" data-bs-target="#individual" type="button">
                                            <i class="bx bx-user me-2"></i>Individual Tracking
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="followup-tab" data-bs-toggle="tab" data-bs-target="#followup" type="button">
                                            <i class="bx bx-bell me-2"></i>Follow-up Needed
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="analytics-tab" data-bs-toggle="tab" data-bs-target="#analytics" type="button">
                                            <i class="bx bx-line-chart me-2"></i>Analytics
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Tab Content -->
                        <div class="tab-content" id="attendanceTabContent">
                            <!-- Overview Tab -->
                            <div class="tab-pane fade show active" id="overview" role="tabpanel">
                                <?php
                                // Get attendance statistics
                                $stats_conditions = ["(m.delete_status = 'Active' OR m.delete_status IS NULL OR m.delete_status = '0')"];
                                $stats_params = [];
                                
                                if ($cell_id) {
                                    $stats_conditions[] = "m.cell_id = :cell_id";
                                    $stats_params[':cell_id'] = [$cell_id, PDO::PARAM_INT];
                                }
                                if ($department_id) {
                                    $stats_conditions[] = "m.department_id = :department_id";
                                    $stats_params[':department_id'] = [$department_id, PDO::PARAM_INT];
                                }
                                if ($gender) {
                                    $stats_conditions[] = "m.gender = :gender";
                                    $stats_params[':gender'] = [$gender, PDO::PARAM_STR];
                                }
                                
                                $stats_where = "WHERE " . implode(" AND ", $stats_conditions);
                                
                                $stats_query = "
                                    SELECT 
                                        COUNT(DISTINCT m.id) as total_members,
                                        COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN a.member_id END) as attended_members,
                                        COUNT(DISTINCT CASE WHEN a.id IS NULL THEN m.id END) as absent_members,
                                        COUNT(DISTINCT a.id) as total_attendances
                                    FROM member m
                                    LEFT JOIN attendance a ON m.id = a.member_id 
                                    " . ($meeting_id ? "AND a.meeting_id = :meeting_id" : "") . "
                                    $stats_where
                                ";
                                
                                $stats_stmt = $db->prepare($stats_query);
                                if ($meeting_id) {
                                    $stats_stmt->bindValue(':meeting_id', $meeting_id, PDO::PARAM_INT);
                                }
                                foreach ($stats_params as $p => $val) {
                                    $stats_stmt->bindValue($p, $val[0], $val[1]);
                                }
                                $stats_stmt->execute();
                                $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
                                ?>
                                
                                <div class="row mb-4">
                                    <div class="col-md-3">
                                        <div class="stats-card">
                                            <div class="stats-number text-primary"><?php echo $stats['total_members']; ?></div>
                                            <div class="stats-label">Total Members</div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stats-card">
                                            <div class="stats-number text-success"><?php echo $stats['attended_members']; ?></div>
                                            <div class="stats-label">Attended This Meeting</div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stats-card">
                                            <div class="stats-number text-danger"><?php echo $stats['absent_members']; ?></div>
                                            <div class="stats-label">Absent This Meeting</div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="stats-card">
                                            <div class="stats-number text-info"><?php echo $stats['total_attendances']; ?></div>
                                            <div class="stats-label">Total Check-ins</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Attendance List -->
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">
                                            <?php echo $meeting_id ? "Meeting Attendance" : "All Meeting Attendances"; ?>
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="table-responsive">
                                            <table class="table table-hover" id="attendanceTable">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Member</th>
                                                        <th>Contact</th>
                                                        <th>Meeting</th>
                                                        <th>Check-in Time</th>
                                                        <th>Attendance Rate</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <?php
                                                    $conditions = ["(m.delete_status = 'Active' OR m.delete_status IS NULL OR m.delete_status = '0')"];
                                                    $params = [];
                                                    
                                                    if ($meeting_id) {
                                                        $conditions[] = "a.meeting_id = :meeting_id";
                                                        $params[':meeting_id'] = [$meeting_id, PDO::PARAM_INT];
                                                    }
                                                    if ($cell_id) {
                                                        $conditions[] = "m.cell_id = :cell_id";
                                                        $params[':cell_id'] = [$cell_id, PDO::PARAM_INT];
                                                    }
                                                    if ($department_id) {
                                                        $conditions[] = "m.department_id = :department_id";
                                                        $params[':department_id'] = [$department_id, PDO::PARAM_INT];
                                                    }
                                                    if ($gender) {
                                                        $conditions[] = "m.gender = :gender";
                                                        $params[':gender'] = [$gender, PDO::PARAM_STR];
                                                    }
                                                    
                                                    $where_clause = "WHERE " . implode(" AND ", $conditions);
                                                    
                                                    // Pagination Logic
                                                    $page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
                                                    $limit = 20;
                                                    $offset = ($page - 1) * $limit;
                                                    
                                                    $count_query = "
                                                        SELECT COUNT(*) as total
                                                        FROM attendance a
                                                        JOIN meeting mt ON a.meeting_id = mt.id
                                                        JOIN member m ON a.member_id = m.id
                                                        $where_clause
                                                    ";
                                                    $count_stmt = $db->prepare($count_query);
                                                    foreach ($params as $param_name => $param_val) {
                                                        $count_stmt->bindValue($param_name, $param_val[0], $param_val[1]);
                                                    }
                                                    $count_stmt->execute();
                                                    $total_records = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
                                                    $total_pages = ceil($total_records / $limit);
                                                    
                                                    $query = "
                                                        SELECT 
                                                            m.id as member_id,
                                                            m.first_name,
                                                            m.last_name,
                                                            m.phone_no,
                                                            m.email,
                                                            mt.name as meeting_name,
                                                            mt.id as meeting_id,
                                                            a.login_time,
                                                            (
                                                                SELECT COUNT(*) 
                                                                FROM attendance a2 
                                                                WHERE a2.member_id = m.id
                                                            ) as total_attended,
                                                            (
                                                                SELECT COUNT(*) 
                                                                FROM meeting
                                                            ) as total_meetings
                                                        FROM attendance a
                                                        JOIN meeting mt ON a.meeting_id = mt.id
                                                        JOIN member m ON a.member_id = m.id
                                                        $where_clause
                                                        ORDER BY a.login_time DESC
                                                        LIMIT :limit OFFSET :offset
                                                    ";
                                                    
                                                    $stmt = $db->prepare($query);
                                                    foreach ($params as $param_name => $param_val) {
                                                        $stmt->bindValue($param_name, $param_val[0], $param_val[1]);
                                                    }
                                                    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                                                    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                                                    $stmt->execute();
                                                    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                                    
                                                    $cnt = $offset + 1;
                                                    foreach ($attendance as $row):
                                                        $attendance_rate = $row['total_meetings'] > 0 ? 
                                                            round(($row['total_attended'] / $row['total_meetings']) * 100, 1) : 0;
                                                        
                                                        // Determine status
                                                        if ($attendance_rate >= 80) {
                                                            $status = 'Regular';
                                                            $status_class = 'success';
                                                            $status_icon = 'bx-check-circle';
                                                        } elseif ($attendance_rate >= 50) {
                                                            $status = 'Irregular';
                                                            $status_class = 'warning';
                                                            $status_icon = 'bx-time';
                                                        } else {
                                                            $status = 'Needs Follow-up';
                                                            $status_class = 'danger';
                                                            $status_icon = 'bx-bell';
                                                        }
                                                    ?>
                                                    <tr class="<?php echo $attendance_rate < 50 ? 'followup-highlight' : ''; ?>">
                                                        <td><?php echo $cnt++; ?></td>
                                                        <td>
                                                            <div class="d-flex align-items-center">
                                                                <div class="member-avatar me-3" style="background-color: #<?php echo substr(md5($row['member_id']), 0, 6); ?>">
                                                                    <?php echo strtoupper(substr($row['first_name'], 0, 1)); ?>
                                                                </div>
                                                                <div>
                                                                    <h6 class="mb-0"><?php echo htmlspecialchars($row['first_name'] . ' ' . $row['last_name']); ?></h6>
                                                                    <small class="text-muted"><?php echo htmlspecialchars($row['email']); ?></small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><?php echo htmlspecialchars($row['phone_no']); ?></td>
                                                        <td>
                                                            <a href="attendance.php?id=<?php echo $row['meeting_id']; ?>" class="text-primary">
                                                                <?php echo htmlspecialchars($row['meeting_name']); ?>
                                                            </a>
                                                        </td>
                                                        <td><?php echo date("M d, Y h:i A", strtotime($row['login_time'])); ?></td>
                                                        <td>
                                                            <div class="progress" style="height: 6px;">
                                                                <div class="progress-bar bg-<?php echo $status_class; ?>" 
                                                                     role="progressbar" 
                                                                     style="width: <?php echo $attendance_rate; ?>%">
                                                                </div>
                                                            </div>
                                                            <small><?php echo $attendance_rate; ?>%</small>
                                                        </td>
                                                        <td>
                                                            <span class="badge bg-<?php echo $status_class; ?>">
                                                                <i class="bx <?php echo $status_icon; ?> me-1"></i>
                                                                <?php echo $status; ?>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div class="dropdown">
                                                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                                    <i class="bx bx-dots-vertical"></i>
                                                                </button>
                                                                <div class="dropdown-menu">
                                                                    <a class="dropdown-item" href="#" onclick="viewMemberAttendance(<?php echo $row['member_id']; ?>)">
                                                                        <i class="bx bx-history me-2"></i>View History
                                                                    </a>
                                                                    <a class="dropdown-item" href="#" onclick="sendFollowup(<?php echo $row['member_id']; ?>)">
                                                                        <i class="bx bx-message me-2"></i>Send Follow-up
                                                                    </a>
                                                                    <a class="dropdown-item" href="#" onclick="callMember('<?php echo $row['phone_no']; ?>')">
                                                                        <i class="bx bx-phone me-2"></i>Call Member
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <?php endforeach; ?>
                                                </tbody>
                                            </table>
                                            
                                            <!-- Pagination UI -->
                                            <?php if ($total_pages > 1): ?>
                                            <div class="d-flex justify-content-between align-items-center mt-3 p-3 border-top">
                                                <div class="small text-muted">
                                                    Showing <?php echo $total_records > 0 ? $offset + 1 : 0; ?> to <?php echo min($offset + $limit, $total_records); ?> of <?php echo $total_records; ?> entries
                                                </div>
                                                <ul class="pagination pagination-sm mb-0">
                                                    <?php
                                                    $query_string = $_GET;
                                                    
                                                    // Previous Button
                                                    if ($page > 1) {
                                                        $query_string['page'] = $page - 1;
                                                        echo '<li class="page-item"><a class="page-link" href="?'.http_build_query($query_string).'">Previous</a></li>';
                                                    } else {
                                                        echo '<li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>';
                                                    }
                                                    
                                                    // Page Numbers
                                                    $start_page = max(1, $page - 2);
                                                    $end_page = min($total_pages, $page + 2);
                                                    for ($i = $start_page; $i <= $end_page; $i++) {
                                                        $query_string['page'] = $i;
                                                        $active = $i == $page ? 'active' : '';
                                                        echo '<li class="page-item '.$active.'"><a class="page-link" href="?'.http_build_query($query_string).'">'.$i.'</a></li>';
                                                    }
                                                    
                                                    // Next Button
                                                    if ($page < $total_pages) {
                                                        $query_string['page'] = $page + 1;
                                                        echo '<li class="page-item"><a class="page-link" href="?'.http_build_query($query_string).'">Next</a></li>';
                                                    } else {
                                                        echo '<li class="page-item disabled"><a class="page-link" href="#">Next</a></li>';
                                                    }
                                                    ?>
                                                </ul>
                                            </div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Individual Tracking Tab -->
                            <div class="tab-pane fade" id="individual" role="tabpanel">
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="card-title mb-0">Select Member</h5>
                                            </div>
                                            <div class="card-body">
                                                <div class="mb-3">
                                                    <input type="text" class="form-control" id="memberSearchInput" placeholder="Search members..." onkeyup="searchIndividualMembers(this.value)">
                                                </div>
                                                <div id="memberList" style="max-height: 400px; overflow-y: auto;">
                                                    <?php
                                                    $ind_conditions = ["(delete_status = 'Active' OR delete_status IS NULL OR delete_status = '0')"];
                                                    $ind_params = [];
                                                    if ($cell_id) {
                                                        $ind_conditions[] = "cell_id = :cell_id";
                                                        $ind_params[':cell_id'] = [$cell_id, PDO::PARAM_INT];
                                                    }
                                                    if ($department_id) {
                                                        $ind_conditions[] = "department_id = :department_id";
                                                        $ind_params[':department_id'] = [$department_id, PDO::PARAM_INT];
                                                    }
                                                    if ($gender) {
                                                        $ind_conditions[] = "gender = :gender";
                                                        $ind_params[':gender'] = [$gender, PDO::PARAM_STR];
                                                    }
                                                    
                                                    $ind_where = "WHERE " . implode(" AND ", $ind_conditions);
                                                    $members_query = "SELECT id, first_name, last_name, phone_no FROM member $ind_where ORDER BY first_name";
                                                    $members_stmt = $db->prepare($members_query);
                                                    foreach ($ind_params as $p => $val) {
                                                        $members_stmt->bindValue($p, $val[0], $val[1]);
                                                    }
                                                    $members_stmt->execute();
                                                    $members = $members_stmt->fetchAll(PDO::FETCH_ASSOC);
                                                    
                                                    foreach ($members as $member):
                                                        // Get attendance stats
                                                        $member_stats_stmt = $db->prepare("
                                                            SELECT 
                                                                COUNT(DISTINCT a.id) as attended,
                                                                COUNT(DISTINCT m.id) as total
                                                            FROM meeting m
                                                            LEFT JOIN attendance a ON m.id = a.meeting_id AND a.member_id = :member_id
                                                        ");
                                                        $member_stats_stmt->bindParam(':member_id', $member['id']);
                                                        $member_stats_stmt->execute();
                                                        $member_stats = $member_stats_stmt->fetch(PDO::FETCH_ASSOC);
                                                        
                                                        $attendance_rate = $member_stats['total'] > 0 ? 
                                                            round(($member_stats['attended'] / $member_stats['total']) * 100, 0) : 0;
                                                    ?>
                                                    <div class="member-item d-flex align-items-center p-3 border-bottom" 
                                                         onclick="loadMemberAttendance(<?php echo $member['id']; ?>)" 
                                                         style="cursor: pointer; transition: background-color 0.2s;" 
                                                         onmouseover="this.style.backgroundColor='#f8f9fa'" 
                                                         onmouseout="this.style.backgroundColor='white'">
                                                        <div class="member-avatar me-3" style="background-color: #<?php echo substr(md5($member['id']), 0, 6); ?>">
                                                            <?php echo strtoupper(substr($member['first_name'], 0, 1)); ?>
                                                        </div>
                                                        <div class="flex-grow-1">
                                                            <h6 class="mb-0"><?php echo htmlspecialchars($member['first_name'] . ' ' . $member['last_name']); ?></h6>
                                                            <small class="text-muted"><?php echo htmlspecialchars($member['phone_no']); ?></small>
                                                        </div>
                                                        <div class="text-end">
                                                            <span class="badge bg-<?php echo $attendance_rate >= 80 ? 'success' : ($attendance_rate >= 50 ? 'warning' : 'danger'); ?>">
                                                                <?php echo $attendance_rate; ?>%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <?php endforeach; ?>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="card-title mb-0" id="selectedMemberName">Select a member to view details</h5>
                                            </div>
                                            <div class="card-body">
                                                <div id="memberAttendanceDetails">
                                                    <div class="text-center py-5">
                                                        <i class="bx bx-user-circle fs-1 text-muted mb-3"></i>
                                                        <p class="text-muted">Select a member from the list to view their attendance history</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Follow-up Needed Tab -->
                            <div class="tab-pane fade" id="followup" role="tabpanel">
                                <?php
                                // Get members needing follow-up (attendance < 50%)
                                                                $fu_conditions = ["(m.delete_status = 'Active' OR m.delete_status IS NULL OR m.delete_status = '0')"];
                                                                $fu_params = [];
                                                                if ($cell_id) {
                                                                    $fu_conditions[] = "m.cell_id = :cell_id";
                                                                    $fu_params[':cell_id'] = [$cell_id, PDO::PARAM_INT];
                                                                }
                                                                if ($department_id) {
                                                                    $fu_conditions[] = "m.department_id = :department_id";
                                                                    $fu_params[':department_id'] = [$department_id, PDO::PARAM_INT];
                                                                }
                                                                if ($gender) {
                                                                    $fu_conditions[] = "m.gender = :gender";
                                                                    $fu_params[':gender'] = [$gender, PDO::PARAM_STR];
                                                                }
                                                                
                                                                $fu_where = "WHERE " . implode(" AND ", $fu_conditions);
                                                                
                                                                $followup_query = "
                                                                    SELECT 
                                                                        m.id,
                                                                        m.first_name,
                                                                        m.last_name,
                                                                        m.phone_no,
                                                                        m.email,
                                                                        COUNT(DISTINCT a.id) as attended_count,
                                                                        COUNT(DISTINCT mt.id) as total_meetings,
                                                                        COUNT(DISTINCT CASE WHEN a.id IS NULL THEN mt.id END) as missed_count,
                                                                        MAX(a.login_time) as last_attended
                                                                    FROM member m
                                                                    CROSS JOIN meeting mt
                                                                    LEFT JOIN attendance a ON m.id = a.member_id AND mt.id = a.meeting_id
                                                                    $fu_where
                                                                    GROUP BY m.id, m.first_name, m.last_name, m.phone_no, m.email
                                                                    HAVING (COUNT(DISTINCT a.id) * 100.0 / COUNT(DISTINCT mt.id)) < 50
                                                                    OR COUNT(DISTINCT a.id) = 0
                                                                    ORDER BY (COUNT(DISTINCT a.id) * 100.0 / COUNT(DISTINCT mt.id)) ASC
                                                                ";
                                                                
                                                                $followup_stmt = $db->prepare($followup_query);
                                                                foreach ($fu_params as $p => $val) {
                                                                    $followup_stmt->bindValue($p, $val[0], $val[1]);
                                                                }
                                                                $followup_stmt->execute();
                                                                $followup_members = $followup_stmt->fetchAll(PDO::FETCH_ASSOC);
                                ?>
                                
                                <div class="card">
                                    <div class="card-header">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <h5 class="card-title mb-0">Members Needing Follow-up</h5>
                                            <span class="badge bg-warning"><?php echo count($followup_members); ?> members</span>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <?php if (empty($followup_members)): ?>
                                        <div class="text-center py-5">
                                            <i class="bx bx-party fs-1 text-success mb-3"></i>
                                            <h5>Great News!</h5>
                                            <p class="text-muted">All members have satisfactory attendance records.</p>
                                        </div>
                                        <?php else: ?>
                                        <div class="table-responsive">
                                            <table class="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Member</th>
                                                        <th>Contact</th>
                                                        <th>Attendance Rate</th>
                                                        <th>Meetings Missed</th>
                                                        <th>Last Attended</th>
                                                        <th>Priority</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <?php foreach ($followup_members as $member): 
                                                        $attendance_rate = $member['total_meetings'] > 0 ? 
                                                            round(($member['attended_count'] / $member['total_meetings']) * 100, 1) : 0;
                                                        
                                                        // Determine priority
                                                        if ($attendance_rate < 25) {
                                                            $priority = 'High';
                                                            $priority_class = 'danger';
                                                        } elseif ($attendance_rate < 50) {
                                                            $priority = 'Medium';
                                                            $priority_class = 'warning';
                                                        } else {
                                                            $priority = 'Low';
                                                            $priority_class = 'info';
                                                        }
                                                    ?>
                                                    <tr class="followup-highlight">
                                                        <td>
                                                            <div class="d-flex align-items-center">
                                                                <div class="member-avatar me-3" style="background-color: #<?php echo substr(md5($member['id']), 0, 6); ?>">
                                                                    <?php echo strtoupper(substr($member['first_name'], 0, 1)); ?>
                                                                </div>
                                                                <div>
                                                                    <h6 class="mb-0"><?php echo htmlspecialchars($member['first_name'] . ' ' . $member['last_name']); ?></h6>
                                                                    <small class="text-muted"><?php echo htmlspecialchars($member['email']); ?></small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><?php echo htmlspecialchars($member['phone_no']); ?></td>
                                                        <td>
                                                            <div class="d-flex align-items-center">
                                                                <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                                                    <div class="progress-bar bg-danger" style="width: <?php echo $attendance_rate; ?>%"></div>
                                                                </div>
                                                                <span class="text-danger fw-bold"><?php echo $attendance_rate; ?>%</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span class="badge bg-danger"><?php echo $member['missed_count']; ?> missed</span>
                                                        </td>
                                                        <td>
                                                            <?php if ($member['last_attended']): ?>
                                                            <small><?php echo date("M d, Y", strtotime($member['last_attended'])); ?></small>
                                                            <?php else: ?>
                                                            <span class="badge bg-secondary">Never</span>
                                                            <?php endif; ?>
                                                        </td>
                                                        <td>
                                                            <span class="badge bg-<?php echo $priority_class; ?>"><?php echo $priority; ?> Priority</span>
                                                        </td>
                                                        <td>
                                                            <button class="btn btn-sm btn-warning me-2" onclick="sendFollowup(<?php echo $member['id']; ?>)">
                                                                <i class="bx bx-message"></i> Follow-up
                                                            </button>
                                                            <button class="btn btn-sm btn-outline-secondary" onclick="callMember('<?php echo $member['phone_no']; ?>')">
                                                                <i class="bx bx-phone"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    <?php endforeach; ?>
                                                </tbody>
                                            </table>
                                        </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>

                            <!-- Analytics Tab -->
                            <div class="tab-pane fade" id="analytics" role="tabpanel">
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="attendance-chart">
                                            <h6>Attendance Trends</h6>
                                            <canvas id="attendanceTrendChart"></canvas>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="attendance-chart">
                                            <h6>Attendance Distribution</h6>
                                            <canvas id="attendanceDistributionChart"></canvas>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-12">
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="card-title mb-0">Monthly Attendance Heatmap</h5>
                                            </div>
                                            <div class="card-body">
                                                <div id="attendanceHeatmap" class="text-center"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- / Content -->

                    <!-- Footer -->
                    <?php @include('includes/footer.php'); ?>
                    <!-- / Footer -->
                </div>
                <!-- Content wrapper -->
            </div>
            <!-- / Layout page -->
        </div>
    </div>
    <!-- / Layout wrapper -->

    <!-- Scripts -->
    <?php include('includes/scripts.html'); ?>
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <script>
    // Initialize DataTable
    $(document).ready(function() {
        $('#attendanceTable').DataTable({
            "paging": true,
            "searching": true,
            "ordering": true,
            "info": true,
            "lengthChange": true,
            "dom": 'Bfrtip',
            "buttons": [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            "pageLength": 8
        });
        
        // Initialize charts
        initializeCharts();
        loadHeatmap();
    });

    // Filter functions
    function applyFilters() {
        const meetingId = document.getElementById('meetingFilter').value;
        const cellId = document.getElementById('cellFilter').value;
        const deptId = document.getElementById('deptFilter').value;
        const gender = document.getElementById('genderFilter').value;
        
        let url = 'attendance.php?';
        const params = [];
        if (meetingId) params.push('id=' + meetingId);
        if (cellId) params.push('cell_id=' + cellId);
        if (deptId) params.push('department_id=' + deptId);
        if (gender) params.push('gender=' + encodeURIComponent(gender));
        
        window.location.href = url + params.join('&');
    }

    function filterByStatus(status) {
        const table = $('#attendanceTable').DataTable();
        table.search(status).draw();
    }

    function searchMembers(query) {
        const table = $('#attendanceTable').DataTable();
        table.search(query).draw();
    }

    // Individual member tracking
    function loadMemberAttendance(memberId) {
    $.ajax({
        url: 'api/get_member_attendance.php',
        method: 'GET',
        data: { member_id: memberId },
        dataType: 'json', // Explicitly expect JSON
        success: function(data) {
            // No need to parse, jQuery already parses JSON when dataType is 'json'
            displayMemberAttendance(data);
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', status, error, xhr.responseText);
            
            // Check if response is HTML instead of JSON
            if (xhr.responseText.includes('<br />') || xhr.responseText.includes('<b>')) {
                showToast('Server returned HTML error. Check PHP error logs.', 'error');
            } else {
                showToast('Error loading member attendance: ' + error, 'error');
            }
        }
    });
    }

    function displayMemberAttendance(data) {
        const container = $('#memberAttendanceDetails');
        const member = data.member;
        
        container.html(`
            <div class="row">
                <div class="col-md-4">
                    <div class="text-center mb-4">
                        <div class="member-avatar mx-auto mb-3" style="background-color: #${member.avatar_color}; font-size: 2rem; width: 80px; height: 80px;">
                            ${member.initials}
                        </div>
                        <h4>${member.name}</h4>
                        <p class="text-muted">${member.phone}</p>
                    </div>
                    <div class="stats-card mb-3">
                        <div class="stats-number text-primary">${member.total_meetings}</div>
                        <div class="stats-label">Total Meetings</div>
                    </div>
                    <div class="stats-card mb-3">
                        <div class="stats-number text-success">${member.attended_count}</div>
                        <div class="stats-label">Meetings Attended</div>
                    </div>
                    <div class="stats-card">
                        <div class="stats-number text-danger">${member.missed_count}</div>
                        <div class="stats-label">Meetings Missed</div>
                    </div>
                </div>
                <div class="col-md-8">
                    <h6>Attendance History</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Meeting</th>
                                    <th>Check-in Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.attendance_history.map(item => `
                                    <tr>
                                        <td>${item.date}</td>
                                        <td>${item.meeting}</td>
                                        <td>${item.time}</td>
                                        <td>
                                            <span class="badge bg-${item.status_class}">
                                                <i class="bx ${item.status_icon}"></i> ${item.status}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-4">
                        <h6>Attendance Pattern</h6>
                        <canvas id="memberAttendanceChart" height="100"></canvas>
                    </div>
                </div>
            </div>
        `);
        
        // Update selected member name
        $('#selectedMemberName').text(member.name + ' - Attendance Details');
        
        // Initialize member chart
        initializeMemberChart(data.chart_data);
    }

    function searchIndividualMembers(query) {
        const items = document.querySelectorAll('.member-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    // Follow-up functions
    function sendFollowup(memberId) {
        Swal.fire({
            title: 'Send Follow-up Message',
            html: `
                <textarea id="followupMessage" class="form-control" rows="4" placeholder="Type your follow-up message here..."></textarea>
                <div class="mt-3">
                    <label class="form-check">
                        <input type="checkbox" class="form-check-input" id="sendSMS">
                        <span class="form-check-label">Send as SMS</span>
                    </label>
                    <label class="form-check">
                        <input type="checkbox" class="form-check-input" id="sendEmail" checked>
                        <span class="form-check-label">Send as Email</span>
                    </label>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Send',
            preConfirm: () => {
                return {
                    message: document.getElementById('followupMessage').value,
                    sms: document.getElementById('sendSMS').checked,
                    email: document.getElementById('sendEmail').checked
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Send follow-up
                $.ajax({
                    url: 'api/send_followup.php',
                    method: 'POST',
                    data: {
                        member_id: memberId,
                        message: result.value.message,
                        send_sms: result.value.sms,
                        send_email: result.value.email
                    },
                    success: function() {
                        showToast('Follow-up sent successfully', 'success');
                    },
                    error: function() {
                        showToast('Error sending follow-up', 'error');
                    }
                });
            }
        });
    }

    function callMember(phoneNumber) {
        window.open(`tel:${phoneNumber}`, '_blank');
    }

    // Export functions
    function exportToExcel() {
        // Implement Excel export
        showToast('Export to Excel feature coming soon', 'info');
    }

    function exportToPDF() {
        // Implement PDF export
        showToast('Export to PDF feature coming soon', 'info');
    }

    function printReport() {
        window.print();
    }

    // Chart initialization
    function initializeCharts() {
        // Attendance Trend Chart
        const trendCtx = document.getElementById('attendanceTrendChart').getContext('2d');
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Attendance',
                    data: [65, 75, 80, 70, 85, 90],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Distribution Chart
        const distCtx = document.getElementById('attendanceDistributionChart').getContext('2d');
        new Chart(distCtx, {
            type: 'doughnut',
            data: {
                labels: ['Regular (80%+)', 'Irregular (50-79%)', 'Needs Follow-up (<50%)'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    function initializeMemberChart(chartData) {
        const ctx = document.getElementById('memberAttendanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Heatmap
    function loadHeatmap() {
        const heatmap = document.getElementById('attendanceHeatmap');
        // Generate sample heatmap data
        let html = '<div class="d-flex flex-wrap justify-content-center">';
        for (let i = 0; i < 30; i++) {
            const level = Math.floor(Math.random() * 5);
            html += `<div class="heatmap-cell attendance-${level}" title="Day ${i + 1}: ${level * 25}% attendance"></div>`;
        }
        html += '</div>';
        heatmap.innerHTML = html;
    }

    // Toast notification function
    function showToast(message, type = 'info') {
        // Use your existing toast function here
        console.log(`${type.toUpperCase()}: ${message}`);
    }
    </script>
</body>
</html>