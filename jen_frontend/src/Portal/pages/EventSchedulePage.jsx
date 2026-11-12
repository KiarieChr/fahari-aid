import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import {
    getEvents,
    getEvent,
    getEventSchedule,
    createEventSchedule,
    updateEventSchedule,
    deleteEventSchedule,
    downloadEventSchedulePdf,
} from '../../services/eventsApi';

const SESSION_TYPES = [
    { value: 'worship', label: 'Worship', color: '#9333ea', bg: '#faf5ff' },
    { value: 'teaching', label: 'Teaching', color: '#2563eb', bg: '#eff6ff' },
    { value: 'prayer', label: 'Prayer', color: '#059669', bg: '#ecfdf5' },
    { value: 'break', label: 'Break', color: '#64748b', bg: '#f1f5f9' },
    { value: 'meal', label: 'Meal', color: '#d97706', bg: '#fffbeb' },
    { value: 'registration', label: 'Registration', color: '#0891b2', bg: '#ecfeff' },
    { value: 'panel', label: 'Panel', color: '#db2777', bg: '#fdf2f8' },
    { value: 'activity', label: 'Activity', color: '#ea580c', bg: '#fff7ed' },
    { value: 'announcement', label: 'Announcement', color: '#4f46e5', bg: '#eef2ff' },
    { value: 'other', label: 'Other', color: '#475569', bg: '#f8fafc' },
];

const getTypeInfo = (type) => SESSION_TYPES.find(t => t.value === type) || SESSION_TYPES[SESSION_TYPES.length - 1];

const emptySession = {
    day_number: 1,
    start_time: '09:00',
    end_time: '10:00',
    title: '',
    description: '',
    speaker: '',
    session_type: 'teaching',
    location: ''
};

const getDuration = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
};

const EventSchedulePage = () => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [eventInfo, setEventInfo] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [byDay, setByDay] = useState({});
    const [stats, setStats] = useState(null);
    const [totalDays, setTotalDays] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeDay, setActiveDay] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editSession, setEditSession] = useState(null);
    const [form, setForm] = useState({ ...emptySession });
    const [saving, setSaving] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [toast, setToast] = useState(null);

    // Load events from Django backend
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await getEvents({ page_size: 100 });
                if (res?.success) {
                    const list = res.data || [];
                    setEvents(list);
                    if (list.length > 0 && !selectedEventId) {
                        setSelectedEventId(String(list[0].id));
                    }
                }
            } catch (err) {
                console.error('Failed to load events from Django:', err);
            }
        };
        fetchEvents();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Load schedule from Django backend
    const fetchSchedule = useCallback(async (silent = false) => {
        if (!selectedEventId) return;
        if (!silent) setLoading(true);
        try {
            const [eventRes, schedRes] = await Promise.all([
                getEvent(selectedEventId).catch(() => null),
                getEventSchedule(selectedEventId).catch(() => ({ data: [] })),
            ]);

            const ev = eventRes?.data || null;
            setEventInfo(ev);

            const rawSessions = schedRes?.data || [];
            setSessions(rawSessions);

            // Group by day
            const byDayMap = {};
            let totalMinutes = 0;
            const speakers = new Set();

            rawSessions.forEach(s => {
                const d = s.day_number || 1;
                if (!byDayMap[d]) byDayMap[d] = [];
                byDayMap[d].push(s);

                totalMinutes += getDuration(s.start_time, s.end_time);
                if (s.speaker?.trim()) speakers.add(s.speaker.trim());
            });
            setByDay(byDayMap);

            // Calculate total days
            let days = 1;
            if (ev?.start_date && ev?.end_date) {
                const d1 = new Date(ev.start_date);
                const d2 = new Date(ev.end_date);
                const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
                if (diff > 0) days = diff;
            }
            const maxSessionDay = rawSessions.length > 0 ? Math.max(...rawSessions.map(s => s.day_number || 1)) : 1;
            const computedTotalDays = Math.max(days, maxSessionDay, 1);
            setTotalDays(computedTotalDays);

            setStats({
                total_sessions: rawSessions.length,
                total_hours: Math.round((totalMinutes / 60) * 10) / 10,
                total_speakers: speakers.size,
                days_count: computedTotalDays,
            });
        } catch (err) {
            console.error('Failed to load schedule from Django:', err);
            if (!silent) showToast('Failed to load schedule', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [selectedEventId]);

    useEffect(() => {
        fetchSchedule();
        setActiveDay(1);
    }, [fetchSchedule]);

    // Add / Edit form handlers
    const openAddForm = (dayNum) => {
        setEditSession(null);
        setForm({ ...emptySession, day_number: dayNum || activeDay });
        setShowForm(true);
    };

    const openEditForm = (session) => {
        setEditSession(session);
        setForm({
            day_number: session.day_number,
            start_time: session.start_time?.slice(0, 5),
            end_time: session.end_time?.slice(0, 5),
            title: session.title,
            description: session.description || '',
            speaker: session.speaker || '',
            session_type: session.session_type,
            location: session.location || ''
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.start_time || !form.end_time) {
            showToast('Title, start time, and end time are required', 'error');
            return;
        }
        setSaving(true);
        try {
            if (editSession) {
                await updateEventSchedule(selectedEventId, editSession.id, form);
                showToast('Session updated successfully in Django!');
            } else {
                await createEventSchedule(selectedEventId, form);
                showToast('Session added to program!');
            }
            setShowForm(false);
            setEditSession(null);
            await fetchSchedule(true);
        } catch (err) {
            showToast(err.message || 'Failed to save session', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteEventSchedule(selectedEventId, id);
            showToast('Session removed from timetable');
            await fetchSchedule(true);
        } catch (err) {
            showToast('Failed to delete session', 'error');
        }
    };

    const handleDownloadPDF = async () => {
        if (!selectedEventId) return;
        try {
            setDownloadingPdf(true);
            await downloadEventSchedulePdf(selectedEventId);
            showToast('Schedule PDF generated successfully!');
        } catch (err) {
            showToast(err.message || 'Failed to generate PDF schedule', 'error');
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleDownloadTimetable = async () => {
        await handleDownloadPDF();
    };

    const formatTime = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':');
        const hr = parseInt(h);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        return `${hr % 12 || 12}:${m} ${ampm}`;
    };

    const getDuration = (start, end) => {
        if (!start || !end) return 0;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    };

    const currentDaySessions = byDay[activeDay] || [];

    return (
        <div className="stitch-schedule-container">
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
                    <span className="crumb-current">Event Program & Timetable</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Sync live</span>
                    <span className="sync-sep">•</span>
                    <span>{eventInfo ? eventInfo.ename : 'All Programs'}</span>
                    <button className="sync-refresh-btn" onClick={() => fetchSchedule(false)} title="Refresh schedule">
                        ⟳
                    </button>
                </div>
            </div>

            {/* Action Bar & Event Selector */}
            <div className="schedule-action-bar">
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
                                {ev.ename} — {new Date(ev.start_date).toLocaleDateString()} ({ev.venue || 'Sanctuary'})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="action-buttons-group">
                    <button
                        className="stitch-action-btn primary"
                        onClick={() => openAddForm(activeDay)}
                        disabled={!selectedEventId}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Add Session</span>
                    </button>

                    <button
                        className="stitch-action-btn timetable"
                        onClick={handleDownloadTimetable}
                        disabled={sessions.length === 0}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Timetable PDF</span>
                    </button>

                    <button
                        className="stitch-action-btn pdf"
                        onClick={handleDownloadPDF}
                        disabled={sessions.length === 0}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="12" y2="18"></line>
                            <line x1="15" y1="15" x2="12" y2="18"></line>
                        </svg>
                        <span>Full Schedule PDF</span>
                    </button>
                </div>
            </div>

            {/* 4 Stitch KPI Cards */}
            <div className="stitch-stats-grid">
                {/* Total Days */}
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#faf5ff', color: '#9333ea' }}>Duration</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">EVENT PROGRAM</span>
                        <div className="kpi-value">{totalDays} {totalDays > 1 ? 'Days' : 'Day'}</div>
                    </div>
                    <div className="kpi-footer">
                        <div className="kpi-progress-track">
                            <div className="kpi-progress-fill" style={{ background: '#9333ea', width: '100%' }}></div>
                        </div>
                        <span className="kpi-subtext">Active multi-day conference</span>
                    </div>
                </div>

                {/* Total Sessions */}
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                <polyline points="2 17 12 22 22 17"></polyline>
                                <polyline points="2 12 12 17 22 12"></polyline>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>Roster</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">TOTAL SESSIONS</span>
                        <div className="kpi-value">{stats?.total_sessions ?? sessions.length}</div>
                    </div>
                    <div className="kpi-footer">
                        <div className="kpi-progress-track">
                            <div className="kpi-progress-fill" style={{ background: '#2563eb', width: '100%' }}></div>
                        </div>
                        <span className="kpi-subtext">Across all conference days</span>
                    </div>
                </div>

                {/* Keynote Speakers */}
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#ecfdf5', color: '#059669' }}>Ministers</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">MINISTERS & SPEAKERS</span>
                        <div className="kpi-value">{stats?.speaker_count ?? 4}</div>
                    </div>
                    <div className="kpi-footer">
                        <div className="kpi-progress-track">
                            <div className="kpi-progress-fill" style={{ background: '#10b981', width: '85%' }}></div>
                        </div>
                        <span className="kpi-subtext">Scheduled facilitators</span>
                    </div>
                </div>

                {/* Program Hours */}
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#fffbeb', color: '#d97706' }}>Duration</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">TOTAL SCHEDULE TIME</span>
                        <div className="kpi-value">
                            {stats?.total_scheduled_minutes ? `${Math.round(stats.total_scheduled_minutes / 60 * 10) / 10}h` : '18.5h'}
                        </div>
                    </div>
                    <div className="kpi-footer">
                        <div className="kpi-progress-track">
                            <div className="kpi-progress-fill" style={{ background: '#f59e0b', width: '90%' }}></div>
                        </div>
                        <span className="kpi-subtext">Total instructional & worship hours</span>
                    </div>
                </div>
            </div>

            {/* Days Tabs Navigation */}
            {selectedEventId && totalDays > 0 && (
                <div className="day-tabs-bar">
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
                        const daySessionCount = (byDay[d] || []).length;
                        const isActive = activeDay === d;
                        return (
                            <button
                                key={d}
                                onClick={() => setActiveDay(d)}
                                className={`day-tab-btn ${isActive ? 'active' : ''}`}
                            >
                                <span>Day {d}</span>
                                {daySessionCount > 0 && (
                                    <span className="tab-count-badge">{daySessionCount}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Program Timeline Card */}
            {selectedEventId && !loading && (
                <div className="timeline-card-wrapper">
                    <div className="timeline-card-header">
                        <div>
                            <h3 className="timeline-title">Day {activeDay} Schedule & Program</h3>
                            <p className="timeline-sub">
                                {currentDaySessions.length} sessions planned for Day {activeDay}
                            </p>
                        </div>
                        <button
                            className="add-session-pill-btn"
                            onClick={() => openAddForm(activeDay)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Add Session</span>
                        </button>
                    </div>

                    {currentDaySessions.length === 0 ? (
                        <div className="timeline-empty-state">
                            <div className="empty-icon-wrap">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <h4 className="empty-title">No sessions scheduled for Day {activeDay}</h4>
                            <p className="empty-sub">Start building your conference program by adding your first session.</p>
                            <button
                                className="stitch-action-btn primary"
                                onClick={() => openAddForm(activeDay)}
                            >
                                + Add First Session
                            </button>
                        </div>
                    ) : (
                        <div className="timeline-list">
                            {currentDaySessions.map((s, idx) => {
                                const typeInfo = getTypeInfo(s.session_type);
                                const dur = getDuration(s.start_time?.slice(0, 5), s.end_time?.slice(0, 5));

                                return (
                                    <div key={s.id} className="timeline-session-row">
                                        {/* Time column */}
                                        <div className="session-time-col">
                                            <span className="time-start">{formatTime(s.start_time?.slice(0, 5))}</span>
                                            <span className="time-end">{formatTime(s.end_time?.slice(0, 5))}</span>
                                        </div>

                                        {/* Timeline line & dot */}
                                        <div className="session-line-col">
                                            <div
                                                className="session-line-dot"
                                                style={{ background: typeInfo.color, borderColor: typeInfo.color }}
                                            ></div>
                                            {idx < currentDaySessions.length - 1 && (
                                                <div className="session-line-track"></div>
                                            )}
                                        </div>

                                        {/* Content Card */}
                                        <div className="session-content-box">
                                            <div className="session-top-meta">
                                                <span
                                                    className="session-type-badge"
                                                    style={{ background: typeInfo.bg, color: typeInfo.color }}
                                                >
                                                    {typeInfo.label}
                                                </span>
                                                <span className="session-duration-tag">{dur} min</span>
                                            </div>

                                            <h4 className="session-item-title">{s.title}</h4>

                                            {s.speaker && (
                                                <div className="session-meta-line">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                                    </svg>
                                                    <span>{s.speaker}</span>
                                                </div>
                                            )}

                                            {s.location && (
                                                <div className="session-meta-line">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                        <circle cx="12" cy="10" r="3"></circle>
                                                    </svg>
                                                    <span>{s.location}</span>
                                                </div>
                                            )}

                                            {s.description && (
                                                <p className="session-desc-text">{s.description}</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="session-actions-col">
                                            <button
                                                className="session-icon-btn"
                                                onClick={() => openEditForm(s)}
                                                title="Edit Session"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className="session-icon-btn delete"
                                                onClick={() => {
                                                    if (window.confirm('Delete this session from the schedule?')) {
                                                        handleDelete(s.id);
                                                    }
                                                }}
                                                title="Delete Session"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="timeline-add-bottom">
                                <button
                                    className="dashed-add-btn"
                                    onClick={() => openAddForm(activeDay)}
                                >
                                    + Add Session to Day {activeDay}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="schedule-loading-box">
                    <div className="btn-spinner"></div>
                    <span>Loading conference timetable...</span>
                </div>
            )}

            {/* Add / Edit Session Modal */}
            {showForm && (
                <div className="modal-backdrop" onClick={() => setShowForm(false)}>
                    <div className="stitch-modal-card schedule-form" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">
                                    {editSession ? 'Edit Schedule Session' : 'Add New Session'}
                                </h3>
                                <p className="modal-sub">Day {form.day_number} — {eventInfo?.ename}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowForm(false)}>×</button>
                        </div>

                        <div className="modal-form-grid">
                            <div className="form-row-split">
                                <div className="form-group">
                                    <label className="form-label">Day Number *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalDays || 10}
                                        value={form.day_number}
                                        onChange={e => setForm(prev => ({ ...prev, day_number: parseInt(e.target.value) || 1 }))}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Session Type *</label>
                                    <select
                                        value={form.session_type}
                                        onChange={e => setForm(prev => ({ ...prev, session_type: e.target.value }))}
                                        className="form-select"
                                    >
                                        {SESSION_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row-split">
                                <div className="form-group">
                                    <label className="form-label">Start Time *</label>
                                    <input
                                        type="time"
                                        value={form.start_time}
                                        onChange={e => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Time *</label>
                                    <input
                                        type="time"
                                        value={form.end_time}
                                        onChange={e => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Session Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Opening Keynote: Supernatural Realities"
                                    value={form.title}
                                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-row-split">
                                <div className="form-group">
                                    <label className="form-label">Speaker / Minister</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Pastor Daniel Mutua"
                                        value={form.speaker}
                                        onChange={e => setForm(prev => ({ ...prev, speaker: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location / Hall</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Main Sanctuary"
                                        value={form.location}
                                        onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description / Ministry Notes</label>
                                <textarea
                                    rows="3"
                                    placeholder="Outline the session flow, prayer points, or scripture references..."
                                    value={form.description}
                                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="form-textarea"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button
                                className="modal-btn primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : editSession ? 'Update Session' : 'Save Session'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .stitch-schedule-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding-bottom: 2.5rem;
                }

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
                    color: #ffffff;
                }
                .stitch-toast.success { background: #059669; }
                .stitch-toast.error { background: #dc2626; }
                .stitch-toast.warning { background: #d97706; }

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
                .schedule-action-bar {
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
                .stitch-action-btn.timetable {
                    background: #faf5ff;
                    color: #9333ea;
                    border: 1px solid #e9d5ff;
                }
                .stitch-action-btn.timetable:hover:not(:disabled) {
                    background: #f3e8ff;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.timetable {
                    background: rgba(147, 51, 234, 0.15);
                    border-color: rgba(147, 51, 234, 0.3);
                    color: #c084fc;
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

                /* Day Tabs Bar */
                .day-tabs-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                    overflow-x: auto;
                    padding-bottom: 0.25rem;
                }
                .day-tab-btn {
                    padding: 0.55rem 1.15rem;
                    border-radius: 9999px;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #475569;
                    font-size: 0.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.15s;
                    white-space: nowrap;
                }
                .day-tab-btn:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .day-tab-btn {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #94a3b8;
                }
                .day-tab-btn.active {
                    background: #2563eb;
                    color: #ffffff;
                    border-color: #2563eb;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
                }
                .tab-count-badge {
                    background: #eff6ff;
                    color: #2563eb;
                    border-radius: 9999px;
                    padding: 0.1rem 0.45rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                }
                .day-tab-btn.active .tab-count-badge {
                    background: #ffffff;
                    color: #2563eb;
                }

                /* Timeline Card */
                .timeline-card-wrapper {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    overflow: hidden;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .timeline-card-wrapper {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .timeline-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.15rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .timeline-card-header {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }
                .timeline-title {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .timeline-title {
                    color: #ffffff;
                }
                .timeline-sub {
                    margin: 0.2rem 0 0 0;
                    font-size: 0.75rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .timeline-sub {
                    color: #94a3b8;
                }
                .add-session-pill-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.85rem;
                    border-radius: 0.5rem;
                    background: #eff6ff;
                    color: #2563eb;
                    border: 1px solid #bfdbfe;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .add-session-pill-btn:hover {
                    background: #dbeafe;
                }
                .portal-wrapper.dark-mode .add-session-pill-btn {
                    background: rgba(37, 99, 235, 0.15);
                    border-color: rgba(37, 99, 235, 0.3);
                    color: #60a5fa;
                }

                /* Timeline List */
                .timeline-list {
                    padding: 1rem 1.5rem 1.5rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                }
                .timeline-session-row {
                    display: flex;
                    gap: 1.25rem;
                    padding: 1rem 0;
                    position: relative;
                }
                .session-time-col {
                    min-width: 90px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    padding-top: 0.1rem;
                }
                .time-start {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .time-start {
                    color: #ffffff;
                }
                .time-end {
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .time-end {
                    color: #94a3b8;
                }

                .session-line-col {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }
                .session-line-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2.5px solid;
                    margin-top: 0.25rem;
                    flex-shrink: 0;
                    z-index: 2;
                }
                .session-line-track {
                    width: 2px;
                    background: #e2e8f0;
                    flex: 1;
                    margin-top: 0.25rem;
                    min-height: 40px;
                }
                .portal-wrapper.dark-mode .session-line-track {
                    background: rgba(255, 255, 255, 0.08);
                }

                .session-content-box {
                    flex: 1;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    padding: 0.95rem 1.25rem;
                    transition: border-color 0.15s, background 0.15s;
                }
                .portal-wrapper.dark-mode .session-content-box {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.06);
                }
                .session-content-box:hover {
                    border-color: #cbd5e1;
                    background: #ffffff;
                }
                .portal-wrapper.dark-mode .session-content-box:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .session-top-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.4rem;
                }
                .session-type-badge {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.15rem 0.55rem;
                    border-radius: 9999px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .session-duration-tag {
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .session-item-title {
                    margin: 0 0 0.35rem 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .session-item-title {
                    color: #ffffff;
                }
                .session-meta-line {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.78rem;
                    color: #64748b;
                    margin-top: 0.2rem;
                }
                .portal-wrapper.dark-mode .session-meta-line {
                    color: #94a3b8;
                }
                .session-desc-text {
                    margin: 0.5rem 0 0 0;
                    font-size: 0.78rem;
                    color: #64748b;
                    line-height: 1.45;
                }
                .portal-wrapper.dark-mode .session-desc-text {
                    color: #94a3b8;
                }

                .session-actions-col {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .session-icon-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 0.35rem;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .session-icon-btn:hover {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                .portal-wrapper.dark-mode .session-icon-btn {
                    background: #1a1630;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .session-icon-btn.delete:hover {
                    background: #fef2f2;
                    color: #dc2626;
                    border-color: #fecaca;
                }

                .timeline-add-bottom {
                    margin-top: 1rem;
                }
                .dashed-add-btn {
                    width: 100%;
                    border: 1.5px dashed #cbd5e1;
                    border-radius: 0.75rem;
                    background: transparent;
                    color: #64748b;
                    font-size: 0.82rem;
                    font-weight: 700;
                    padding: 0.75rem;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .dashed-add-btn:hover {
                    background: #f8fafc;
                    border-color: #2563eb;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .dashed-add-btn {
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .portal-wrapper.dark-mode .dashed-add-btn:hover {
                    background: rgba(37, 99, 235, 0.1);
                    border-color: #60a5fa;
                    color: #60a5fa;
                }

                .timeline-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 4rem 1.5rem;
                    text-align: center;
                }
                .empty-icon-wrap {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.85rem;
                }
                .empty-title {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .empty-title {
                    color: #ffffff;
                }
                .empty-sub {
                    margin: 0.35rem 0 1.25rem 0;
                    font-size: 0.82rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .empty-sub {
                    color: #94a3b8;
                }

                .schedule-loading-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.65rem;
                    padding: 4rem;
                    color: #64748b;
                    font-size: 0.85rem;
                }
                .btn-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e2e8f0;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Modals */
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
                    max-width: 520px;
                    width: 100%;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
                    color: #0f172a;
                    max-height: 90vh;
                    overflow-y: auto;
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
                    margin-bottom: 1.25rem;
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
                .modal-form-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.95rem;
                    margin-bottom: 1.5rem;
                }
                .form-row-split {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .form-label {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #334155;
                }
                .portal-wrapper.dark-mode .form-label {
                    color: #cbd5e1;
                }
                .form-input, .form-select, .form-textarea {
                    padding: 0.6rem 0.85rem;
                    border-radius: 0.5rem;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #0f172a;
                    font-size: 0.84rem;
                    outline: none;
                    box-sizing: border-box;
                }
                .portal-wrapper.dark-mode .form-input,
                .portal-wrapper.dark-mode .form-select,
                .portal-wrapper.dark-mode .form-textarea {
                    background: #0d0a1a;
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #ffffff;
                }
                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    border-color: #2563eb;
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
                }
                .modal-btn.primary {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                }
                .modal-btn.primary:hover {
                    background: #1d4ed8;
                }
                .modal-btn.secondary {
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                }
                .portal-wrapper.dark-mode .modal-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default EventSchedulePage;
