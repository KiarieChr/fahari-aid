import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import api from '../../services/api';
import { ThemeContext } from '../../context/ThemeContext';
import {
    getEvents,
    getEventAttendance,
    getRegistrationDetail,
    markAttendance,
    undoAttendance,
    registerAttendee,
    downloadEventAttendancePdf
} from '../../services/eventsApi';
import QRScannerModal from '../components/events/QRScannerModal';
import { QRCodeSVG } from 'qrcode.react';

const EventAttendancePage = () => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [attendees, setAttendees] = useState([]);
    const [eventInfo, setEventInfo] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, checked-in, not-checked-in
    const [showScanner, setShowScanner] = useState(false);
    const [showQRPreview, setShowQRPreview] = useState(null); // registration_id for QR preview
    const [manualSearch, setManualSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [emailLoading, setEmailLoading] = useState(null); // 'bulk' or registration_id
    const [showEmailConfirm, setShowEmailConfirm] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [regForm, setRegForm] = useState({ names: '', phone_no: '', email: '', residence: '', gender: '' });
    const [regLoading, setRegLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Load events list on mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await getEvents({ page_size: 100 });
                if (res?.success) {
                    setEvents(res.data || []);
                    if (res.data?.length > 0 && !selectedEventId) {
                        setSelectedEventId(String(res.data[0].id));
                    }
                }
            } catch (err) {
                console.error('Failed to load events:', err);
                showToast('Failed to load events list', 'error');
            }
        };
        fetchEvents();
    }, []);

    // Load attendance data for selected event
    const fetchAttendance = useCallback(async (silent = false) => {
        if (!selectedEventId) return;
        if (!silent) setLoading(true);
        try {
            const res = await getEventAttendance(selectedEventId);
            if (res?.success) {
                setAttendees(res.data.attendees || []);
                setEventInfo(res.data.event || null);
                setStats(res.data.stats || null);
            }
        } catch (err) {
            console.error('Failed to load attendance:', err);
            if (!silent) showToast('Failed to load attendance data', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [selectedEventId]);

    useEffect(() => {
        fetchAttendance();
        setCurrentPage(1);
    }, [fetchAttendance]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Manual check-in
    const handleManualCheckin = async (registrationId) => {
        setActionLoading(registrationId);
        try {
            const res = await markAttendance(selectedEventId, registrationId, 'manual');
            if (res?.success) {
                showToast('Checked in successfully!');
                await fetchAttendance(true);
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Check-in failed';
            showToast(msg, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Fast check-in by phone/email/name query
    const handleSearchCheckin = async () => {
        if (!manualSearch.trim() || !selectedEventId) return;
        setActionLoading('search');
        try {
            const q = manualSearch.trim().toLowerCase();
            const matched = attendees.find(a =>
                (a.phone_no && a.phone_no.toLowerCase().includes(q)) ||
                (a.email && a.email.toLowerCase().includes(q)) ||
                (a.names && a.names.toLowerCase().includes(q)) ||
                (a.registration_number && a.registration_number.toLowerCase().includes(q))
            );
            if (matched) {
                if (matched.checked_in) {
                    showToast(`${matched.names} is already checked in!`, 'warning');
                } else {
                    await markAttendance(selectedEventId, matched.id || matched.registration_id, 'manual');
                    showToast(`Checked in ${matched.names}!`);
                    setManualSearch('');
                    await fetchAttendance(true);
                }
            } else {
                showToast('No matching attendee found for check-in', 'warning');
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Check-in failed';
            showToast(msg, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // QR scan callback
    const handleQRScan = async (qrData) => {
        try {
            let reg = attendees.find(a => a.qr_token === qrData || String(a.id) === String(qrData));
            if (reg) {
                await markAttendance(selectedEventId, reg.id, 'qr');
                showToast(`${reg.names} checked in via QR!`);
                await fetchAttendance(true);
            } else {
                showToast('Attendee not found for this QR code', 'warning');
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'QR check-in failed';
            showToast(msg, 'error');
        }
    };

    // Undo check-in
    const handleUndoCheckin = async (registrationId) => {
        setActionLoading(registrationId);
        try {
            const res = await undoAttendance(selectedEventId, registrationId);
            if (res?.success) {
                showToast('Check-in reversed');
                await fetchAttendance(true);
            }
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to undo check-in', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Send QR email to single registrant
    const handleSendEmail = async (registrationId) => {
        setEmailLoading(registrationId);
        try {
            const res = await api.post('/send_event_qr_email.php', {
                registration_id: registrationId
            });
            if (res?.success) {
                if (res.data?.failed > 0) {
                    showToast(`Email error: ${res.data.errors?.[0] || 'Delivery failure'}`, 'error');
                } else {
                    showToast(res.message || 'Invitation with QR sent!');
                }
            }
        } catch (err) {
            const errData = err.response?.data;
            showToast(errData?.error || 'Failed to send email', 'error');
        } finally {
            setEmailLoading(null);
        }
    };

    // Send QR emails to all registrants for the event
    const handleBulkEmail = async () => {
        setShowEmailConfirm(false);
        setEmailLoading('bulk');
        try {
            const res = await api.post('/send_event_qr_email.php', {
                event_id: parseInt(selectedEventId)
            });
            if (res?.success) {
                const d = res.data;
                showToast(
                    `Sent ${d.sent} of ${d.total} emails${d.failed > 0 ? ` (${d.failed} failed)` : '!'}`,
                    d.failed > 0 ? 'warning' : 'success'
                );
            }
        } catch (err) {
            const errData = err.response?.data;
            showToast(errData?.error || 'Failed to send bulk emails', 'error');
        } finally {
            setEmailLoading(null);
        }
    };

    // Register attendee on the spot
    const handleRegister = async () => {
        const { names, phone_no, email, residence, gender } = regForm;
        if (!names || !phone_no || !email || !residence || !gender) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        setRegLoading(true);
        try {
            const res = await registerAttendee(selectedEventId, regForm);
            if (res?.success) {
                const regId = res.data?.id || res.data?.registration_id;
                showToast(`${names} registered successfully!`);
                if (regId) {
                    try {
                        await markAttendance(selectedEventId, regId, 'walkin');
                        showToast(`${names} registered & checked in!`);
                    } catch (e) {
                        // Registration saved
                    }
                }
                setRegForm({ names: '', phone_no: '', email: '', residence: '', gender: '' });
                setShowRegister(false);
                await fetchAttendance(true);
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Registration failed';
            showToast(msg, 'error');
        } finally {
            setRegLoading(false);
        }
    };

    // Download PDF Report
    const handleDownloadPdf = async () => {
        if (!selectedEventId) return;
        setPdfLoading(true);
        try {
            await downloadEventAttendancePdf(selectedEventId);
            showToast('Attendance PDF report downloaded!');
        } catch (e) {
            showToast('Failed to generate attendance PDF', 'error');
        } finally {
            setPdfLoading(false);
        }
    };

    // Filter attendees
    const filteredAttendees = useMemo(() => {
        return attendees.filter(a => {
            const matchesSearch = !searchTerm ||
                (a.names || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.phone_no || '').includes(searchTerm) ||
                (a.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.residence || '').toLowerCase().includes(searchTerm.toLowerCase());

            const isCheckedIn = Boolean(a.checked_in || a.is_checked_in);
            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'checked-in' && isCheckedIn) ||
                (filterStatus === 'not-checked-in' && !isCheckedIn);

            return matchesSearch && matchesFilter;
        });
    }, [attendees, searchTerm, filterStatus]);

    // Pagination slice
    const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAttendees = filteredAttendees.slice(startIndex, startIndex + itemsPerPage);
    const startItem = filteredAttendees.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(startIndex + itemsPerPage, filteredAttendees.length);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);
            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }
            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    const formatTime = (dt) => {
        if (!dt) return '-';
        return new Date(dt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleExportCsv = () => {
        if (!filteredAttendees || filteredAttendees.length === 0) {
            showToast('No attendees to export', 'warning');
            return;
        }
        const headers = ['#', 'Full Name', 'Phone', 'Email', 'Residence', 'Gender', 'Status', 'Check-in Time', 'Method'];
        const rows = filteredAttendees.map((a, idx) => [
            idx + 1,
            `"${(a.names || '').replace(/"/g, '""')}"`,
            `"${a.phone_no || ''}"`,
            `"${a.email || ''}"`,
            `"${(a.residence || '').replace(/"/g, '""')}"`,
            `"${a.gender || ''}"`,
            a.checked_in || a.is_checked_in ? 'Checked In' : 'Pending',
            a.check_in_time || '',
            a.check_in_method || 'manual'
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `event_attendance_${selectedEventId}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate dynamic stats
    const totalCount = stats?.total_registered ?? attendees.length;
    const checkedInCount = stats?.total_checked_in ?? attendees.filter(a => a.checked_in || a.is_checked_in).length;
    const pendingCount = stats?.pending_checkin ?? Math.max(0, totalCount - checkedInCount);
    const ratePct = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

    return (
        <div className="stitch-attendance-container">
            {/* Toast Feedback */}
            {toast && (
                <div className={`stitch-toast ${toast.type}`}>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Breadcrumbs Header Bar */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Calendar & Events</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Event Attendance & Check-in</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Sync live</span>
                    <span className="sync-sep">•</span>
                    <span>{eventInfo ? eventInfo.ename : 'All Events'}</span>
                    <button className="sync-refresh-btn" onClick={() => fetchAttendance(false)} title="Refresh data">
                        ⟳
                    </button>
                </div>
            </div>

            {/* Action Bar & Event Selector */}
            <div className="attendance-action-bar">
                <div className="event-selector-wrap">
                    <div className="event-selector-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="event-selector-dropdown"
                    >
                        <option value="">-- Select Church Event --</option>
                        {events.map(ev => (
                            <option key={ev.id} value={ev.id}>
                                {ev.ename} — {new Date(ev.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({ev.venue || 'Sanctuary'})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="action-buttons-group">
                    <button
                        className="stitch-action-btn primary"
                        onClick={() => setShowRegister(true)}
                        disabled={!selectedEventId}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Register Attendee</span>
                    </button>

                    <button
                        className="stitch-action-btn qr"
                        onClick={() => setShowScanner(true)}
                        disabled={!selectedEventId}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                            <rect x="14" y="14" width="3" height="3"></rect>
                            <rect x="18" y="14" width="3" height="3"></rect>
                            <rect x="14" y="18" width="3" height="3"></rect>
                            <rect x="18" y="18" width="3" height="3"></rect>
                        </svg>
                        <span>Scan QR Code</span>
                    </button>

                    <button
                        className="stitch-action-btn outline"
                        onClick={() => setShowEmailConfirm(true)}
                        disabled={emailLoading === 'bulk' || attendees.length === 0}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span>{emailLoading === 'bulk' ? 'Sending Emails...' : 'Email QR Passes'}</span>
                    </button>

                    <button
                        className="stitch-action-btn pdf"
                        onClick={handleDownloadPdf}
                        disabled={pdfLoading || attendees.length === 0}
                    >
                        {pdfLoading ? (
                            <div className="btn-spinner"></div>
                        ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="12" y2="18"></line>
                                <line x1="15" y1="15" x2="12" y2="18"></line>
                            </svg>
                        )}
                        <span>Roster PDF</span>
                    </button>
                </div>
            </div>

            {/* 4 Stitch KPI Cards */}
            <div className="stitch-stats-grid">
                {/* Total Registered */}
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>Roster</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">TOTAL REGISTERED</span>
                        <div className="kpi-value">{totalCount}</div>
                    </div>
                    <div className="kpi-footer">
                        <div className="kpi-progress-track">
                            <div className="kpi-progress-fill" style={{ background: '#2563eb', width: '100%' }}></div>
                        </div>
                        <span className="kpi-subtext">{eventInfo?.target_attendees ? `Goal: ${eventInfo.target_attendees} attendees` : 'Official event registrations'}</span>
                    </div>
                </div>

                {/* Checked In */}
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#ecfdf5', color: '#059669' }}>Verified</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">CHECKED IN SOULS</span>
                        <div className="kpi-value">{checkedInCount}</div>
                    </div>
                    <div className="kpi-footer">
                        <div className="kpi-progress-track">
                            <div className="kpi-progress-fill" style={{ background: '#10b981', width: `${ratePct}%` }}></div>
                        </div>
                        <span className="kpi-subtext">Present inside sanctuary</span>
                    </div>
                </div>

                {/* Pending */}
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#fffbeb', color: '#d97706' }}>Awaiting</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">PENDING CHECK-IN</span>
                        <div className="kpi-value">{pendingCount}</div>
                    </div>
                    <div className="kpi-footer">
                        <div className="kpi-progress-track">
                            <div className="kpi-progress-fill" style={{ background: '#f59e0b', width: `${totalCount > 0 ? (pendingCount / totalCount) * 100 : 0}%` }}></div>
                        </div>
                        <span className="kpi-subtext">Registered but not checked in</span>
                    </div>
                </div>

                {/* Attendance Rate */}
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#faf5ff', color: '#9333ea' }}>Rate</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">ATTENDANCE TURNOUT</span>
                        <div className="kpi-value">{ratePct}%</div>
                    </div>
                    <div className="kpi-footer">
                        <div className="kpi-progress-track">
                            <div className="kpi-progress-fill" style={{ background: '#9333ea', width: `${ratePct}%` }}></div>
                        </div>
                        <span className="kpi-subtext">Conversion from registrations</span>
                    </div>
                </div>
            </div>

            {/* Quick Check-In Command Bar */}
            {selectedEventId && (
                <div className="quick-checkin-bar">
                    <div className="quick-search-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Quick Check-in: Type phone number, name, or email and press Enter..."
                        value={manualSearch}
                        onChange={(e) => setManualSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchCheckin()}
                        className="quick-search-input"
                    />
                    <button
                        onClick={handleSearchCheckin}
                        disabled={actionLoading === 'search' || !manualSearch.trim()}
                        className="quick-checkin-btn"
                    >
                        {actionLoading === 'search' ? 'Verifying...' : 'Fast Check In'}
                    </button>
                </div>
            )}

            {/* Attendees Data Table Wrapper */}
            <div className="stitch-table-wrapper">
                {/* Table Toolbar */}
                <div className="table-top-toolbar">
                    <div className="filter-tabs-group">
                        <button
                            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
                        >
                            All Attendees ({attendees.length})
                        </button>
                        <button
                            className={`filter-tab ${filterStatus === 'checked-in' ? 'active' : ''}`}
                            onClick={() => { setFilterStatus('checked-in'); setCurrentPage(1); }}
                        >
                            Checked In ({checkedInCount})
                        </button>
                        <button
                            className={`filter-tab ${filterStatus === 'not-checked-in' ? 'active' : ''}`}
                            onClick={() => { setFilterStatus('not-checked-in'); setCurrentPage(1); }}
                        >
                            Pending ({pendingCount})
                        </button>
                    </div>

                    <div className="toolbar-controls-right">
                        {/* Table Search */}
                        <div className="table-search-box">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                placeholder="Filter roster..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="table-search-input"
                            />
                            {searchTerm && (
                                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>
                            )}
                        </div>

                        {/* Export CSV */}
                        <button className="tool-btn" title="Export Roster CSV" onClick={handleExportCsv}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>

                        {/* Print */}
                        <button className="tool-btn" title="Print Attendance Roster" onClick={() => window.print()}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Table Contents */}
                <div className="table-scroll-container">
                    <table className="stitch-data-table">
                        <thead>
                            <tr>
                                <th>ATTENDEE</th>
                                <th>CONTACT DETAILS</th>
                                <th>RESIDENCE</th>
                                <th>GENDER</th>
                                <th>STATUS</th>
                                <th>CHECK-IN TIME</th>
                                <th>METHOD</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="table-loading-cell">
                                        <div className="table-spinner-wrap">
                                            <div className="table-spinner"></div>
                                            <span>Loading event attendance records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedAttendees.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="table-empty-cell">
                                        <div className="empty-state-box">
                                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            <p className="empty-title">No attendees match your selection</p>
                                            <p className="empty-sub">Adjust your filters or register a new participant</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedAttendees.map((a, idx) => {
                                    const isChecked = Boolean(a.checked_in || a.is_checked_in);
                                    const initials = (a.names || 'A')
                                        .split(' ')
                                        .map(n => n[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase();

                                    return (
                                        <tr key={a.registration_id || a.id || idx} className="attendee-table-row">
                                            {/* Attendee Info */}
                                            <td className="cell-attendee">
                                                <div className="avatar-chip">{initials}</div>
                                                <div className="attendee-text">
                                                    <span className="attendee-name">{a.names}</span>
                                                    <span className="attendee-code">{a.registration_number || `REG-${String(a.id || idx + 1).padStart(5, '0')}`}</span>
                                                </div>
                                            </td>

                                            {/* Contact Details */}
                                            <td>
                                                <div className="contact-text">
                                                    <span className="contact-phone">{a.phone_no || '—'}</span>
                                                    {a.email && (
                                                        <a href={`mailto:${a.email}`} className="contact-email">
                                                            {a.email}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Residence */}
                                            <td>
                                                <span className="residence-text">{a.residence || a.travelling_from || '—'}</span>
                                            </td>

                                            {/* Gender */}
                                            <td>
                                                <span className="gender-pill">{a.gender || '—'}</span>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span className={`status-pill ${isChecked ? 'checked' : 'pending'}`}>
                                                    {isChecked ? '✓ Checked In' : 'Pending'}
                                                </span>
                                            </td>

                                            {/* Check-in Time */}
                                            <td>
                                                <span className="time-text">
                                                    {isChecked ? formatTime(a.check_in_time) : '—'}
                                                </span>
                                            </td>

                                            {/* Method */}
                                            <td>
                                                {isChecked ? (
                                                    <span className={`method-pill ${a.check_in_method === 'qr' ? 'qr' : 'manual'}`}>
                                                        {a.check_in_method === 'qr' ? 'QR Scan' : 'Manual'}
                                                    </span>
                                                ) : (
                                                    <span className="time-text">—</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="cell-actions">
                                                {!isChecked ? (
                                                    <button
                                                        className="action-btn checkin"
                                                        onClick={() => handleManualCheckin(a.registration_id || a.id)}
                                                        disabled={actionLoading === (a.registration_id || a.id)}
                                                    >
                                                        {actionLoading === (a.registration_id || a.id) ? '...' : 'Check In'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn undo"
                                                        onClick={() => handleUndoCheckin(a.registration_id || a.id)}
                                                        disabled={actionLoading === (a.registration_id || a.id)}
                                                        title="Undo Check-in"
                                                    >
                                                        Undo
                                                    </button>
                                                )}

                                                <button
                                                    className="icon-action-btn"
                                                    onClick={() => setShowQRPreview(a.registration_id || a.id)}
                                                    title="View QR Code Pass"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="3" width="7" height="7"></rect>
                                                        <rect x="14" y="3" width="7" height="7"></rect>
                                                        <rect x="3" y="14" width="7" height="7"></rect>
                                                        <rect x="14" y="14" width="3" height="3"></rect>
                                                        <rect x="18" y="14" width="3" height="3"></rect>
                                                        <rect x="14" y="18" width="3" height="3"></rect>
                                                        <rect x="18" y="18" width="3" height="3"></rect>
                                                    </svg>
                                                </button>

                                                {a.email && (
                                                    <button
                                                        className="icon-action-btn email"
                                                        onClick={() => handleSendEmail(a.registration_id || a.id)}
                                                        disabled={emailLoading === (a.registration_id || a.id)}
                                                        title="Email QR Pass"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                            <polyline points="22,6 12,13 2,6"></polyline>
                                                        </svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Google Stitch Pagination Footer */}
                <div className="stitch-pagination-footer">
                    <div className="pagination-left">
                        <span className="pagination-info">
                            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{filteredAttendees.length}</strong> attendees
                        </span>
                        <div className="pagination-rows-selector">
                            <label htmlFor="attendance-rows-select">Rows per page:</label>
                            <select
                                id="attendance-rows-select"
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="rows-select"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="pagination-right">
                        {/* First */}
                        <button
                            className="page-nav-btn"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1 || loading}
                            title="First Page"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="11 17 6 12 11 7"></polyline>
                                <polyline points="18 17 13 12 18 7"></polyline>
                            </svg>
                        </button>

                        {/* Prev */}
                        <button
                            className="page-nav-btn"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            title="Previous Page"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        {/* Numbered Pills */}
                        <div className="page-numbers-group">
                            {getPageNumbers().map(pageNum => (
                                <button
                                    key={pageNum}
                                    className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                    disabled={loading}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>

                        {/* Next */}
                        <button
                            className="page-nav-btn"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages || loading}
                            title="Next Page"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>

                        {/* Last */}
                        <button
                            className="page-nav-btn"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage >= totalPages || loading}
                            title="Last Page"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="13 17 18 12 13 7"></polyline>
                                <polyline points="6 17 11 12 6 7"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Preview Modal */}
            {showQRPreview && (
                <QRPreviewModal
                    registrationId={showQRPreview}
                    eventId={selectedEventId}
                    attendee={attendees.find(a => (a.registration_id || a.id) === showQRPreview)}
                    eventName={eventInfo?.ename}
                    onClose={() => setShowQRPreview(null)}
                />
            )}

            {/* Bulk Email Confirmation Modal */}
            {showEmailConfirm && (
                <div className="modal-backdrop" onClick={() => setShowEmailConfirm(false)}>
                    <div className="stitch-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Email Passes to All Registrants?</h3>
                                <p className="modal-sub">
                                    Send personal QR check-in passes to {attendees.filter(a => a.email).length} registrants for <strong>{eventInfo?.ename}</strong>.
                                </p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowEmailConfirm(false)}>×</button>
                        </div>
                        <p className="modal-body-note">
                            Each attendee receives full schedule instructions and their encrypted check-in barcode for rapid entrance scanning.
                        </p>
                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setShowEmailConfirm(false)}>
                                Cancel
                            </button>
                            <button className="modal-btn primary" onClick={handleBulkEmail}>
                                Send All Emails
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* On-The-Spot Registration Modal */}
            {showRegister && (
                <div className="modal-backdrop" onClick={() => setShowRegister(false)}>
                    <div className="stitch-modal-card reg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Register Walk-in Attendee</h3>
                                <p className="modal-sub">{eventInfo?.ename} — will be immediately registered and checked in.</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowRegister(false)}>×</button>
                        </div>

                        <div className="modal-form-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={regForm.names}
                                    onChange={e => setRegForm(prev => ({ ...prev, names: e.target.value }))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. 0712345678"
                                    value={regForm.phone_no}
                                    onChange={e => setRegForm(prev => ({ ...prev, phone_no: e.target.value }))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input
                                    type="email"
                                    placeholder="e.g. john@example.com"
                                    value={regForm.email}
                                    onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Residence / Estate *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nairobi, Westlands"
                                    value={regForm.residence}
                                    onChange={e => setRegForm(prev => ({ ...prev, residence: e.target.value }))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender *</label>
                                <select
                                    value={regForm.gender}
                                    onChange={e => setRegForm(prev => ({ ...prev, gender: e.target.value }))}
                                    className="form-select"
                                >
                                    <option value="">-- Select Gender --</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setShowRegister(false)}>
                                Cancel
                            </button>
                            <button
                                className="modal-btn primary"
                                onClick={handleRegister}
                                disabled={regLoading}
                            >
                                {regLoading ? 'Registering...' : 'Register & Check In'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Scanner Modal */}
            {showScanner && (
                <QRScannerModal
                    onClose={() => setShowScanner(false)}
                    onScan={handleQRScan}
                    eventName={eventInfo?.ename}
                />
            )}

            <style>{`
                .stitch-attendance-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding-bottom: 2.5rem;
                }

                /* Toast notification */
                .stitch-toast {
                    position: fixed;
                    top: 1.5rem;
                    right: 1.5rem;
                    z-index: 10000;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
                    animation: slideIn 0.25s ease;
                    color: #ffffff;
                }
                .stitch-toast.success { background: #059669; }
                .stitch-toast.error { background: #dc2626; }
                .stitch-toast.warning { background: #d97706; }
                @keyframes slideIn {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                /* Breadcrumbs Bar */
                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.8rem;
                }
                .crumb-segment {
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .crumb-segment {
                    color: #94a3b8;
                }
                .crumb-sep {
                    color: #cbd5e1;
                    font-size: 0.75rem;
                }
                .crumb-current {
                    color: #0f172a;
                    font-weight: 700;
                }
                .portal-wrapper.dark-mode .crumb-current {
                    color: #ffffff;
                }
                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .sync-live-status {
                    color: #94a3b8;
                }
                .sync-live-dot {
                    color: #10b981;
                    font-size: 0.7rem;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 0.85rem;
                    padding: 0.1rem;
                }

                /* Action Bar */
                .attendance-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .event-selector-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 0.75rem;
                    padding: 0.4rem 0.85rem;
                    min-width: 340px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
                    transition: border-color 0.15s;
                }
                .portal-wrapper.dark-mode .event-selector-wrap {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .event-selector-wrap:focus-within {
                    border-color: #2563eb;
                }
                .event-selector-icon {
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                }
                .portal-wrapper.dark-mode .event-selector-icon {
                    color: #60a5fa;
                }
                .event-selector-dropdown {
                    border: none;
                    background: transparent;
                    font-size: 0.84rem;
                    font-weight: 600;
                    color: #0f172a;
                    outline: none;
                    width: 100%;
                    cursor: pointer;
                }
                .portal-wrapper.dark-mode .event-selector-dropdown {
                    color: #ffffff;
                }
                .portal-wrapper.dark-mode .event-selector-dropdown option {
                    background: #151128;
                    color: #ffffff;
                }

                .action-buttons-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .stitch-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.5rem 0.95rem;
                    border-radius: 0.5rem;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .stitch-action-btn.primary {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
                }
                .stitch-action-btn.primary:hover:not(:disabled) {
                    background: #1d4ed8;
                }
                .stitch-action-btn.qr {
                    background: #eff6ff;
                    color: #2563eb;
                    border: 1px solid #bfdbfe;
                }
                .stitch-action-btn.qr:hover:not(:disabled) {
                    background: #dbeafe;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.qr {
                    background: rgba(37, 99, 235, 0.15);
                    border-color: rgba(37, 99, 235, 0.3);
                    color: #60a5fa;
                }
                .stitch-action-btn.outline {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                }
                .stitch-action-btn.outline:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #94a3b8;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.outline {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #cbd5e1;
                }
                .stitch-action-btn.pdf {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }
                .stitch-action-btn.pdf:hover:not(:disabled) {
                    background: #fee2e2;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.pdf {
                    background: rgba(220, 38, 38, 0.15);
                    border-color: rgba(220, 38, 38, 0.3);
                    color: #f87171;
                }
                .stitch-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* 4 KPI Cards Grid */
                .stitch-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }
                @media (max-width: 1100px) {
                    .stitch-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .stitch-stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .stitch-kpi-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.2rem 1.35rem 1.1rem 1.35rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 140px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .portal-wrapper.dark-mode .stitch-kpi-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .stitch-kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.06);
                }
                .kpi-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }
                .kpi-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-badge {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .kpi-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .kpi-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .portal-wrapper.dark-mode .kpi-label {
                    color: #94a3b8;
                }
                .kpi-value {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                }
                .portal-wrapper.dark-mode .kpi-value {
                    color: #ffffff;
                }
                .kpi-footer {
                    margin-top: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .kpi-progress-track {
                    height: 3.5px;
                    border-radius: 2px;
                    background: #f1f5f9;
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .kpi-progress-track {
                    background: rgba(255, 255, 255, 0.08);
                }
                .kpi-progress-fill {
                    height: 100%;
                    border-radius: 2px;
                }
                .kpi-subtext {
                    font-size: 0.72rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .portal-wrapper.dark-mode .kpi-subtext {
                    color: #94a3b8;
                }

                /* Quick Check-in Bar */
                .quick-checkin-bar {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.85rem;
                    padding: 0.65rem 1rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
                }
                .portal-wrapper.dark-mode .quick-checkin-bar {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .quick-checkin-bar:focus-within {
                    border-color: #2563eb;
                }
                .quick-search-icon {
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                }
                .portal-wrapper.dark-mode .quick-search-icon {
                    color: #60a5fa;
                }
                .quick-search-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    font-size: 0.84rem;
                    color: #0f172a;
                    outline: none;
                }
                .portal-wrapper.dark-mode .quick-search-input {
                    color: #ffffff;
                }
                .quick-checkin-btn {
                    padding: 0.45rem 1rem;
                    border-radius: 0.5rem;
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    font-size: 0.78rem;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: background 0.15s;
                }
                .quick-checkin-btn:hover:not(:disabled) {
                    background: #1d4ed8;
                }
                .quick-checkin-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                /* Table Wrapper */
                .stitch-table-wrapper {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    overflow: hidden;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .stitch-table-wrapper {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                /* Top Toolbar */
                .table-top-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    padding: 0.85rem 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .table-top-toolbar {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }

                .filter-tabs-group {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    flex-wrap: wrap;
                }
                .filter-tab {
                    padding: 0.35rem 0.75rem;
                    border-radius: 9999px;
                    border: 1px solid transparent;
                    background: transparent;
                    color: #64748b;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .filter-tab:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .filter-tab:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #ffffff;
                }
                .filter-tab.active {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                .portal-wrapper.dark-mode .filter-tab.active {
                    background: rgba(37, 99, 235, 0.15);
                    border-color: rgba(37, 99, 235, 0.3);
                    color: #60a5fa;
                }

                .toolbar-controls-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .table-search-box {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    padding: 0.35rem 0.65rem;
                    color: #64748b;
                    transition: border-color 0.15s, background 0.15s;
                }
                .portal-wrapper.dark-mode .table-search-box {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .table-search-box:focus-within {
                    border-color: #2563eb;
                    background: #ffffff;
                }
                .portal-wrapper.dark-mode .table-search-box:focus-within {
                    background: #100c22;
                    border-color: #3b82f6;
                }
                .table-search-input {
                    border: none;
                    background: transparent;
                    font-size: 0.78rem;
                    color: #0f172a;
                    outline: none;
                    width: 140px;
                }
                .portal-wrapper.dark-mode .table-search-input {
                    color: #ffffff;
                }
                .clear-search-btn {
                    border: none;
                    background: transparent;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 0.85rem;
                    padding: 0;
                    line-height: 1;
                }

                .tool-btn {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    width: 32px;
                    height: 32px;
                    border-radius: 0.45rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .tool-btn:hover {
                    background: #f8fafc;
                    color: #0f172a;
                    border-color: #cbd5e1;
                }
                .portal-wrapper.dark-mode .tool-btn {
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }

                /* Data Table */
                .table-scroll-container {
                    overflow-x: auto;
                }
                .stitch-data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.82rem;
                    text-align: left;
                }
                .stitch-data-table thead {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .portal-wrapper.dark-mode .stitch-data-table thead {
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }
                .stitch-data-table th {
                    padding: 0.75rem 1rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .portal-wrapper.dark-mode .stitch-data-table th {
                    color: #94a3b8;
                }

                .attendee-table-row {
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.15s;
                }
                .portal-wrapper.dark-mode .attendee-table-row {
                    border-bottom-color: rgba(255, 255, 255, 0.04);
                }
                .attendee-table-row:hover {
                    background: #f8fafc;
                }
                .portal-wrapper.dark-mode .attendee-table-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                .stitch-data-table td {
                    padding: 0.85rem 1rem;
                    vertical-align: middle;
                }

                .cell-attendee {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .avatar-chip {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    background: #eff6ff;
                    color: #2563eb;
                    font-weight: 700;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .portal-wrapper.dark-mode .avatar-chip {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }
                .attendee-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .attendee-name {
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 0.84rem;
                }
                .portal-wrapper.dark-mode .attendee-name {
                    color: #ffffff;
                }
                .attendee-code {
                    font-size: 0.68rem;
                    color: #64748b;
                    font-family: monospace;
                }
                .portal-wrapper.dark-mode .attendee-code {
                    color: #94a3b8;
                }

                .contact-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .contact-phone {
                    color: #334155;
                    font-weight: 500;
                    font-size: 0.8rem;
                }
                .portal-wrapper.dark-mode .contact-phone {
                    color: #cbd5e1;
                }
                .contact-email {
                    color: #2563eb;
                    font-size: 0.72rem;
                    text-decoration: none;
                }
                .contact-email:hover {
                    text-decoration: underline;
                }

                .residence-text {
                    color: #475569;
                    font-size: 0.8rem;
                }
                .portal-wrapper.dark-mode .residence-text {
                    color: #94a3b8;
                }

                .gender-pill {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #475569;
                    background: #f1f5f9;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                }
                .portal-wrapper.dark-mode .gender-pill {
                    background: rgba(255, 255, 255, 0.05);
                    color: #cbd5e1;
                }

                .status-pill {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    display: inline-block;
                    white-space: nowrap;
                }
                .status-pill.checked {
                    background: #ecfdf5;
                    color: #059669;
                }
                .portal-wrapper.dark-mode .status-pill.checked {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                }
                .status-pill.pending {
                    background: #fffbeb;
                    color: #d97706;
                }
                .portal-wrapper.dark-mode .status-pill.pending {
                    background: rgba(217, 119, 6, 0.15);
                    color: #fbbf24;
                }

                .time-text {
                    color: #64748b;
                    font-size: 0.75rem;
                    white-space: nowrap;
                }
                .portal-wrapper.dark-mode .time-text {
                    color: #94a3b8;
                }

                .method-pill {
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                }
                .method-pill.qr {
                    background: #faf5ff;
                    color: #9333ea;
                }
                .portal-wrapper.dark-mode .method-pill.qr {
                    background: rgba(147, 51, 234, 0.15);
                    color: #c084fc;
                }
                .method-pill.manual {
                    background: #eff6ff;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .method-pill.manual {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }

                .cell-actions {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.35rem;
                }
                .action-btn {
                    padding: 0.35rem 0.75rem;
                    border-radius: 0.4rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    border: none;
                    transition: all 0.15s;
                }
                .action-btn.checkin {
                    background: #2563eb;
                    color: #ffffff;
                }
                .action-btn.checkin:hover:not(:disabled) {
                    background: #1d4ed8;
                }
                .action-btn.undo {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }
                .action-btn.undo:hover:not(:disabled) {
                    background: #fee2e2;
                }
                .portal-wrapper.dark-mode .action-btn.undo {
                    background: rgba(220, 38, 38, 0.15);
                    border-color: rgba(220, 38, 38, 0.3);
                    color: #f87171;
                }

                .icon-action-btn {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    width: 28px;
                    height: 28px;
                    border-radius: 0.35rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .icon-action-btn:hover {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                .portal-wrapper.dark-mode .icon-action-btn {
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .icon-action-btn.email:hover {
                    background: #ecfeff;
                    color: #0891b2;
                    border-color: #a5f3fc;
                }

                /* Table Loading & Empty */
                .table-loading-cell, .table-empty-cell {
                    padding: 3.5rem 1rem !important;
                    text-align: center;
                }
                .table-spinner-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    color: #64748b;
                    font-size: 0.85rem;
                }
                .portal-wrapper.dark-mode .table-spinner-wrap {
                    color: #94a3b8;
                }
                .table-spinner, .btn-spinner {
                    width: 24px;
                    height: 24px;
                    border: 2.5px solid #e2e8f0;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                .btn-spinner {
                    width: 14px;
                    height: 14px;
                    border-width: 2px;
                    border-top-color: #dc2626;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .empty-state-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.35rem;
                    color: #94a3b8;
                }
                .empty-title {
                    margin: 0.5rem 0 0 0;
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 0.95rem;
                }
                .portal-wrapper.dark-mode .empty-title {
                    color: #ffffff;
                }
                .empty-sub {
                    margin: 0;
                    font-size: 0.78rem;
                    color: #64748b;
                }

                /* Pagination Footer */
                .stitch-pagination-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    padding: 0.85rem 1.25rem;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                }
                .portal-wrapper.dark-mode .stitch-pagination-footer {
                    background: rgba(255, 255, 255, 0.02);
                    border-top-color: rgba(255, 255, 255, 0.06);
                }
                .pagination-left {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    flex-wrap: wrap;
                }
                .pagination-info {
                    font-size: 0.78rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .pagination-info {
                    color: #94a3b8;
                }
                .pagination-info strong {
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .pagination-info strong {
                    color: #ffffff;
                }

                .pagination-rows-selector {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.78rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .pagination-rows-selector {
                    color: #94a3b8;
                }
                .rows-select {
                    padding: 0.25rem 0.55rem;
                    border-radius: 0.4rem;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #0f172a;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    outline: none;
                }
                .portal-wrapper.dark-mode .rows-select {
                    background: #1a1630;
                    border-color: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                }

                .pagination-right {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .page-nav-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 0.4rem;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .portal-wrapper.dark-mode .page-nav-btn {
                    background: #1a1630;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .page-nav-btn:hover:not(:disabled) {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                .portal-wrapper.dark-mode .page-nav-btn:hover:not(:disabled) {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }
                .page-nav-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .page-numbers-group {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .page-number-btn {
                    min-width: 30px;
                    height: 30px;
                    padding: 0 0.4rem;
                    border-radius: 0.4rem;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #475569;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .portal-wrapper.dark-mode .page-number-btn {
                    background: #1a1630;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .page-number-btn:hover:not(.active) {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .page-number-btn.active {
                    background: #2563eb;
                    color: #ffffff;
                    border-color: #2563eb;
                    font-weight: 700;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
                }

                /* Modals Styling */
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                }
                .portal-wrapper.dark-mode .modal-backdrop {
                    background: rgba(0, 0, 0, 0.75);
                }
                .stitch-modal-card {
                    background: #ffffff;
                    border-radius: 1.25rem;
                    padding: 1.75rem 2rem;
                    max-width: 480px;
                    width: 100%;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
                    color: #0f172a;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .stitch-modal-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #f8fafc;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                .modal-title {
                    margin: 0;
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .modal-title {
                    color: #ffffff;
                }
                .modal-sub {
                    margin: 0.25rem 0 0 0;
                    font-size: 0.8rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .modal-sub {
                    color: #94a3b8;
                }
                .modal-close-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-size: 1.5rem;
                    cursor: pointer;
                    line-height: 1;
                }
                .modal-body-note {
                    font-size: 0.82rem;
                    color: #64748b;
                    line-height: 1.5;
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .modal-body-note {
                    color: #94a3b8;
                }
                .modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.65rem;
                }
                .modal-btn {
                    padding: 0.55rem 1.15rem;
                    border-radius: 0.5rem;
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .modal-btn.primary {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.25);
                }
                .modal-btn.primary:hover {
                    background: #1d4ed8;
                }
                .modal-btn.secondary {
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                }
                .modal-btn.secondary:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .modal-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #cbd5e1;
                }

                /* Form groups */
                .modal-form-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                    margin-bottom: 1.5rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                }
                .form-label {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #334155;
                }
                .portal-wrapper.dark-mode .form-label {
                    color: #cbd5e1;
                }
                .form-input, .form-select {
                    padding: 0.6rem 0.85rem;
                    border-radius: 0.5rem;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #0f172a;
                    font-size: 0.84rem;
                    outline: none;
                }
                .portal-wrapper.dark-mode .form-input, .portal-wrapper.dark-mode .form-select {
                    background: #0d0a1a;
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #ffffff;
                }
                .form-input:focus, .form-select:focus {
                    border-color: #2563eb;
                }
            `}</style>
        </div>
    );
};

// QR Preview Modal
const QRPreviewModal = ({ registrationId, eventId, attendee, eventName, onClose }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQR = async () => {
            try {
                if (attendee?.qr_token) {
                    setQrData({ qr_data: attendee.qr_token });
                    setLoading(false);
                    return;
                }
                const res = await getRegistrationDetail(eventId, registrationId);
                const token = res?.data?.qr_token || attendee?.qr_token || `JEN-EVT-${eventId}-REG-${registrationId}`;
                setQrData({ qr_data: token });
            } catch (err) {
                // Fallback to deterministic token
                setQrData({ qr_data: attendee?.qr_token || `JEN-EVT-${eventId}-REG-${registrationId}` });
            } finally {
                setLoading(false);
            }
        };
        fetchQR();
    }, [registrationId, eventId, attendee]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="stitch-modal-card qr-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '380px' }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                    {attendee?.names || 'Event Attendee'}
                </h3>
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {eventName || 'Church Conference'}
                </p>

                {loading ? (
                    <div style={{ padding: '2.5rem', color: isDark ? '#94a3b8' : '#64748b' }}>Generating QR code...</div>
                ) : qrData ? (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '0.85rem',
                        padding: '1.25rem',
                        display: 'inline-block',
                        marginBottom: '1rem',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                    }}>
                        <QRCodeSVG
                            value={qrData.qr_data}
                            size={200}
                            level="H"
                            includeMargin={false}
                        />
                    </div>
                ) : (
                    <div style={{ padding: '2rem', color: '#dc2626' }}>Failed to generate QR code</div>
                )}

                <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.78rem', margin: '0.25rem 0 1.25rem', lineHeight: 1.4 }}>
                    Scan this barcode at the venue check-in desk for instant verified attendance.
                </p>

                <button
                    onClick={onClose}
                    style={{
                        padding: '0.55rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1'}`,
                        background: isDark ? '#252038' : '#f1f5f9',
                        color: isDark ? '#cbd5e1' : '#475569',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}
                >
                    Close Pass
                </button>
            </div>
        </div>
    );
};

export default EventAttendancePage;
