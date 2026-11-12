import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { getCalendarEvents } from '../../services/calendarApi';

const CalendarPage = () => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'agenda'
    const [events, setEvents] = useState([]);
    const [summary, setSummary] = useState({ total_items: 0, events_count: 0, meetings_count: 0 });
    const [loading, setLoading] = useState(true);
    const [availableFilters, setAvailableFilters] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // Fetch calendar data from Django API
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await getCalendarEvents({ year, month });
            if (res?.success) {
                setEvents(res.events || []);
                setAvailableFilters(res.filters || []);
                setSummary(res.summary || { total_items: 0, events_count: 0, meetings_count: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch calendar events from Django:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [year, month]);

    // Navigation handlers
    const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month, 1));
    const goToday = () => setCurrentDate(new Date());

    // Filter events
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesFilter =
                activeFilter === 'all' ||
                (e.label && e.label.toLowerCase() === activeFilter.toLowerCase()) ||
                (e.item_type && e.item_type.toLowerCase() === activeFilter.toLowerCase());

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                (e.title && e.title.toLowerCase().includes(q)) ||
                (e.venue && e.venue.toLowerCase().includes(q)) ||
                (e.facilitator && e.facilitator.toLowerCase().includes(q)) ||
                (e.description && e.description.toLowerCase().includes(q));

            return matchesFilter && matchesSearch;
        });
    }, [events, activeFilter, searchQuery]);

    // Calendar grid calculations
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return filteredEvents.filter(e => {
            return (e.date && e.date.startsWith(dateStr)) || (e.start && e.start.startsWith(dateStr));
        });
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
    };

    const formatTimeDisplay = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.includes(':')) {
            const [h, m] = timeStr.split(':');
            const hr = parseInt(h, 10);
            const ampm = hr >= 12 ? 'PM' : 'AM';
            return `${hr % 12 || 12}:${m} ${ampm}`;
        }
        return timeStr;
    };

    // Group filtered events by date for Agenda view
    const agendaGroups = useMemo(() => {
        const groups = {};
        filteredEvents.forEach(e => {
            const d = e.date || (e.start ? e.start.split('T')[0] : 'Unspecified');
            if (!groups[d]) groups[d] = [];
            groups[d].push(e);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredEvents]);

    return (
        <div className="stitch-calendar-container">
            {/* Breadcrumb Bar */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Calendar & Events</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Master Calendar</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Django API live</span>
                    <span className="sync-sep">•</span>
                    <span>Updated just now</span>
                    <button className="sync-refresh-btn" onClick={fetchEvents} title="Refresh calendar">
                        ⟳
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="stitch-kpi-grid">
                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                            {currentDate.toLocaleString('default', { month: 'short' })} {year}
                        </span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Total Scheduled Activities</span>
                        <div className="kpi-value">{loading ? '...' : summary.total_items}</div>
                    </div>
                    <span className="kpi-subtext">Events, services & meetings combined</span>
                </div>

                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#faf5ff', color: '#9333ea' }}>
                            Conferences
                        </span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Major Conferences & Retreats</span>
                        <div className="kpi-value">{loading ? '...' : summary.events_count}</div>
                    </div>
                    <span className="kpi-subtext">Full church assemblies & workshops</span>
                </div>

                <div className="stitch-kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <span className="kpi-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                            Weekly Cycles
                        </span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Cell Meetings & Fellowships</span>
                        <div className="kpi-value">{loading ? '...' : summary.meetings_count}</div>
                    </div>
                    <span className="kpi-subtext">Word sessions, prayer & committees</span>
                </div>
            </div>

            {/* Action Bar & Controls */}
            <div className="stitch-action-bar">
                <div className="calendar-nav-controls">
                    <button className="nav-arrow-btn" onClick={prevMonth} title="Previous Month">
                        ‹
                    </button>
                    <h2 className="current-month-heading">
                        {currentDate.toLocaleString('default', { month: 'long' })} {year}
                    </h2>
                    <button className="nav-arrow-btn" onClick={nextMonth} title="Next Month">
                        ›
                    </button>
                    <button className="today-btn" onClick={goToday}>
                        Today
                    </button>
                </div>

                <div className="calendar-action-controls">
                    {/* Search */}
                    <div className="stitch-search-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search events, venue..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="stitch-view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Month Grid</span>
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'agenda' ? 'active' : ''}`}
                            onClick={() => setViewMode('agenda')}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                            <span>Agenda</span>
                        </button>
                    </div>

                    {/* Action buttons */}
                    <button
                        className="stitch-primary-btn"
                        onClick={() => navigate('/portal/meetings/events')}
                    >
                        <span>Events Hub</span>
                    </button>
                </div>
            </div>

            {/* Category Filter Chips */}
            <div className="stitch-filter-chips">
                <button
                    className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All Activities ({events.length})
                </button>
                <button
                    className={`filter-chip ${activeFilter === 'event' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('event')}
                >
                    Conferences & Events ({summary.events_count})
                </button>
                <button
                    className={`filter-chip ${activeFilter === 'meeting' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('meeting')}
                >
                    Meetings & Fellowships ({summary.meetings_count})
                </button>

                {availableFilters.map(filter => (
                    <button
                        key={filter}
                        className={`filter-chip ${activeFilter === filter.toLowerCase() ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter.toLowerCase())}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Calendar View Area */}
            {viewMode === 'grid' ? (
                <div className="stitch-calendar-card">
                    <div className="calendar-grid-header">
                        {dayLabels.map(label => (
                            <div key={label} className="grid-day-label">
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="calendar-grid-body">
                        {/* Leading Empty Cells */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="calendar-day-cell empty"></div>
                        ))}

                        {/* Days of the Month */}
                        {days.map(day => {
                            const dayEvents = getEventsForDay(day);
                            const now = new Date();
                            const isToday =
                                day === now.getDate() &&
                                month === (now.getMonth() + 1) &&
                                year === now.getFullYear();

                            return (
                                <div
                                    key={day}
                                    className={`calendar-day-cell ${isToday ? 'is-today' : ''}`}
                                >
                                    <div className="cell-top">
                                        <span className="day-number">{day}</span>
                                        {isToday && <span className="today-pill">Today</span>}
                                        {dayEvents.length > 0 && (
                                            <span className="cell-count-dot">{dayEvents.length}</span>
                                        )}
                                    </div>

                                    <div className="cell-events-list">
                                        {dayEvents.slice(0, 3).map(event => (
                                            <div
                                                key={event.id}
                                                className="calendar-event-chip"
                                                onClick={() => handleEventClick(event)}
                                                style={{ borderLeftColor: event.color || '#2563eb' }}
                                                title={`${event.title} (${formatTimeDisplay(event.start_time)})`}
                                            >
                                                <span className="chip-time">{formatTimeDisplay(event.start_time)}</span>
                                                <span className="chip-title">{event.title}</span>
                                            </div>
                                        ))}

                                        {dayEvents.length > 3 && (
                                            <div
                                                className="more-events-chip"
                                                onClick={() => handleEventClick(dayEvents[3])}
                                            >
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Agenda / Timeline View */
                <div className="stitch-agenda-card">
                    {loading ? (
                        <div className="agenda-empty-state">
                            <div className="loading-spinner"></div>
                            <p>Loading activities from Django...</p>
                        </div>
                    ) : agendaGroups.length === 0 ? (
                        <div className="agenda-empty-state">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <h3>No Activities Scheduled</h3>
                            <p>No church conferences, services, or fellowships found for this period.</p>
                        </div>
                    ) : (
                        <div className="agenda-timeline">
                            {agendaGroups.map(([dateStr, items]) => {
                                const parsedDate = new Date(`${dateStr}T12:00:00`);
                                const formattedDayHeader = parsedDate.toLocaleDateString('default', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                });

                                return (
                                    <div key={dateStr} className="agenda-date-group">
                                        <div className="agenda-date-header">
                                            <div className="date-header-dot"></div>
                                            <span className="date-header-text">{formattedDayHeader}</span>
                                            <span className="date-header-count">{items.length} {items.length === 1 ? 'activity' : 'activities'}</span>
                                        </div>

                                        <div className="agenda-items-list">
                                            {items.map(item => (
                                                <div
                                                    key={item.id}
                                                    className="agenda-item-card"
                                                    onClick={() => handleEventClick(item)}
                                                >
                                                    <div className="item-time-col">
                                                        <span className="time-badge">
                                                            {formatTimeDisplay(item.start_time)}
                                                        </span>
                                                        {item.end_time && (
                                                            <span className="time-end">to {formatTimeDisplay(item.end_time)}</span>
                                                        )}
                                                    </div>

                                                    <div className="item-info-col">
                                                        <div className="item-title-row">
                                                            <h4 className="item-title">{item.title}</h4>
                                                            <span
                                                                className="item-category-pill"
                                                                style={{ background: item.color ? `${item.color}15` : '#eff6ff', color: item.color || '#2563eb' }}
                                                            >
                                                                {item.label || item.type}
                                                            </span>
                                                        </div>

                                                        <div className="item-meta-row">
                                                            <div className="meta-entry">
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                                    <circle cx="12" cy="10" r="3"></circle>
                                                                </svg>
                                                                <span>{item.venue || item.location}</span>
                                                            </div>
                                                            <div className="meta-entry">
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                                    <circle cx="12" cy="7" r="4"></circle>
                                                                </svg>
                                                                <span>{item.facilitator}</span>
                                                            </div>
                                                        </div>

                                                        {item.description && (
                                                            <p className="item-desc-snippet">{item.description}</p>
                                                        )}
                                                    </div>

                                                    <div className="item-action-col">
                                                        <button className="view-details-btn">
                                                            Inspect →
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Event & Meeting Details Modal */}
            {modalOpen && selectedEvent && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="stitch-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-badge-strip">
                                    <span
                                        className="modal-type-badge"
                                        style={{ background: selectedEvent.color || '#2563eb' }}
                                    >
                                        {selectedEvent.label || selectedEvent.type}
                                    </span>
                                    <span className="modal-item-type">
                                        {selectedEvent.item_type === 'event' ? 'Church Conference' : 'Ministry Meeting'}
                                    </span>
                                </div>
                                <h3 className="modal-title">{selectedEvent.title}</h3>
                            </div>
                            <button className="modal-close-btn" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-detail-row">
                                <span className="detail-label">Date & Time</span>
                                <span className="detail-value">
                                    {selectedEvent.date} • {formatTimeDisplay(selectedEvent.start_time)}
                                    {selectedEvent.end_time ? ` - ${formatTimeDisplay(selectedEvent.end_time)}` : ''}
                                </span>
                            </div>

                            <div className="modal-detail-row">
                                <span className="detail-label">Location / Venue</span>
                                <span className="detail-value">{selectedEvent.venue || selectedEvent.location}</span>
                            </div>

                            <div className="modal-detail-row">
                                <span className="detail-label">Facilitator / Leadership</span>
                                <span className="detail-value">{selectedEvent.facilitator}</span>
                            </div>

                            {selectedEvent.meeting_code && (
                                <div className="modal-detail-row">
                                    <span className="detail-label">Meeting Code</span>
                                    <span className="detail-value mono">{selectedEvent.meeting_code}</span>
                                </div>
                            )}

                            {selectedEvent.meeting_link && (
                                <div className="modal-detail-row">
                                    <span className="detail-label">Virtual Link</span>
                                    <span className="detail-value">
                                        <a
                                            href={selectedEvent.meeting_link.startsWith('http') ? selectedEvent.meeting_link : `https://${selectedEvent.meeting_link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="external-link"
                                        >
                                            {selectedEvent.meeting_link} ↗
                                        </a>
                                    </span>
                                </div>
                            )}

                            {selectedEvent.target_attendees > 0 && (
                                <div className="modal-detail-row">
                                    <span className="detail-label">Capacity Target</span>
                                    <span className="detail-value">{selectedEvent.target_attendees} attendees</span>
                                </div>
                            )}

                            {selectedEvent.description && (
                                <div className="modal-desc-box">
                                    <div className="desc-box-label">Description & Notes</div>
                                    <p className="desc-box-text">{selectedEvent.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="stitch-secondary-btn" onClick={closeModal}>
                                Close
                            </button>
                            {selectedEvent.item_type === 'event' && (
                                <button
                                    className="stitch-primary-btn"
                                    onClick={() => {
                                        closeModal();
                                        navigate('/portal/meetings/event-attendance');
                                    }}
                                >
                                    View Attendance
                                </button>
                            )}
                            {selectedEvent.meeting_link && (
                                <a
                                    href={selectedEvent.meeting_link.startsWith('http') ? selectedEvent.meeting_link : `https://${selectedEvent.meeting_link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="stitch-primary-btn link"
                                >
                                    Join Meeting ↗
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .stitch-calendar-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding-bottom: 3rem;
                    font-family: inherit;
                }

                /* Breadcrumbs */
                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.25rem;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .crumb-sep {
                    color: ${isDark ? '#475569' : '#cbd5e1'};
                }
                .crumb-current {
                    color: #2563eb;
                    font-weight: 600;
                }
                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.75rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .sync-live-dot {
                    color: #10b981;
                    font-size: 0.85rem;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    cursor: pointer;
                    font-size: 0.95rem;
                    padding: 0 0.2rem;
                    transition: transform 0.2s;
                }
                .sync-refresh-btn:hover {
                    color: #2563eb;
                    transform: rotate(45deg);
                }

                /* KPI Grid */
                .stitch-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .stitch-kpi-card {
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    border-radius: 1rem;
                    padding: 1.25rem 1.35rem 1.15rem 1.35rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 140px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
                }
                .kpi-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                }
                .kpi-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 0.65rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-badge {
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 1rem;
                }
                .kpi-content {
                    margin-bottom: 0.5rem;
                }
                .kpi-label {
                    display: block;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    margin-bottom: 0.2rem;
                }
                .kpi-value {
                    font-size: 1.65rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .kpi-subtext {
                    font-size: 0.72rem;
                    color: ${isDark ? '#64748b' : '#94a3b8'};
                }

                /* Action Bar */
                .stitch-action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }
                .calendar-nav-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .nav-arrow-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 0.55rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                    font-size: 1.25rem;
                    line-height: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .nav-arrow-btn:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                }
                .current-month-heading {
                    font-size: 1.35rem;
                    font-weight: 800;
                    margin: 0;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                    min-width: 170px;
                }
                .today-btn {
                    padding: 0.35rem 0.75rem;
                    border-radius: 0.55rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .today-btn:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                }

                .calendar-action-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }

                .stitch-search-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.45rem 0.8rem;
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    border-radius: 0.65rem;
                    font-size: 0.85rem;
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                }
                .stitch-search-wrap input {
                    border: none;
                    background: transparent;
                    outline: none;
                    color: inherit;
                    font-size: 0.85rem;
                    width: 160px;
                }
                .clear-search-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 0.75rem;
                }

                /* View Toggle */
                .stitch-view-toggle {
                    display: flex;
                    background: ${isDark ? '#171324' : '#f1f5f9'};
                    border-radius: 0.65rem;
                    padding: 0.2rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                }
                .toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 0.5rem;
                    border: none;
                    background: transparent;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .toggle-btn.active {
                    background: ${isDark ? '#252038' : '#ffffff'};
                    color: #2563eb;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                }

                .stitch-primary-btn {
                    padding: 0.55rem 1rem;
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.65rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.22);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                }
                .stitch-primary-btn:hover {
                    background: #1d4ed8;
                }
                .stitch-secondary-btn {
                    padding: 0.55rem 1rem;
                    background: ${isDark ? '#2a2438' : '#f1f5f9'};
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    border-radius: 0.65rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* Filter Chips */
                .stitch-filter-chips {
                    display: flex;
                    gap: 0.45rem;
                    overflow-x: auto;
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.25rem;
                }
                .filter-chip {
                    padding: 0.35rem 0.8rem;
                    border-radius: 1rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s;
                }
                .filter-chip:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                }
                .filter-chip.active {
                    background: ${isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff'};
                    border-color: #2563eb;
                    color: #2563eb;
                }

                /* Calendar Month Grid */
                .stitch-calendar-card {
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
                }
                .calendar-grid-header {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background: ${isDark ? '#252038' : '#f8fafc'};
                    border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                }
                .grid-day-label {
                    padding: 0.75rem;
                    text-align: center;
                    font-size: 0.76rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .calendar-grid-body {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1px;
                    background: ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'};
                }
                .calendar-day-cell {
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    min-height: 110px;
                    padding: 0.6rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    transition: background 0.15s;
                }
                .calendar-day-cell.empty {
                    background: ${isDark ? '#171324' : '#fafafa'};
                }
                .calendar-day-cell.is-today {
                    background: ${isDark ? 'rgba(37, 99, 235, 0.08)' : '#eff6ff'};
                    box-shadow: inset 0 0 0 1px #2563eb;
                }
                .cell-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                .day-number {
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: ${isDark ? '#cbd5e1' : '#334155'};
                }
                .calendar-day-cell.is-today .day-number {
                    color: #2563eb;
                    font-size: 0.95rem;
                }
                .today-pill {
                    font-size: 0.65rem;
                    font-weight: 700;
                    background: #2563eb;
                    color: #ffffff;
                    padding: 0.1rem 0.45rem;
                    border-radius: 1rem;
                }
                .cell-count-dot {
                    font-size: 0.68rem;
                    font-weight: 600;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    background: ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'};
                    padding: 0.1rem 0.4rem;
                    border-radius: 0.4rem;
                }

                .cell-events-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .calendar-event-chip {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.25rem 0.45rem;
                    background: ${isDark ? '#252038' : '#f8fafc'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    border-left-width: 3px;
                    border-radius: 0.35rem;
                    font-size: 0.73rem;
                    cursor: pointer;
                    overflow: hidden;
                    transition: transform 0.1s;
                }
                .calendar-event-chip:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                }
                .chip-time {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    white-space: nowrap;
                }
                .chip-title {
                    font-weight: 600;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .more-events-chip {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #2563eb;
                    padding: 0.15rem 0.4rem;
                    cursor: pointer;
                    text-align: center;
                }

                /* Agenda View */
                .stitch-agenda-card {
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
                }
                .agenda-empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .agenda-empty-state h3 {
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                    margin: 0.75rem 0 0.25rem;
                }
                .agenda-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 1.75rem;
                }
                .agenda-date-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .agenda-date-header {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    padding-bottom: 0.35rem;
                    border-bottom: 2px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'};
                }
                .date-header-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #2563eb;
                }
                .date-header-text {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .date-header-count {
                    font-size: 0.75rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    background: ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'};
                    padding: 0.15rem 0.5rem;
                    border-radius: 1rem;
                }
                .agenda-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                }
                .agenda-item-card {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 0.9rem 1.2rem;
                    border-radius: 0.75rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    background: ${isDark ? '#252038' : '#f8fafc'};
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .agenda-item-card:hover {
                    border-color: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .item-time-col {
                    min-width: 100px;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .time-badge {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #2563eb;
                }
                .time-end {
                    font-size: 0.7rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .item-info-col {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .item-title-row {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .item-title {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .item-category-pill {
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 0.15rem 0.55rem;
                    border-radius: 1rem;
                }
                .item-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    font-size: 0.78rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .meta-entry {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .item-desc-snippet {
                    margin: 0;
                    font-size: 0.78rem;
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                }
                .item-action-col {
                    display: flex;
                    align-items: center;
                }
                .view-details-btn {
                    padding: 0.4rem 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    background: transparent;
                    color: #2563eb;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* Details Modal */
                .modal-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .stitch-modal-card {
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    border-radius: 1rem;
                    width: 100%;
                    max-width: 520px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'};
                    overflow: hidden;
                    animation: modalIn 0.2s ease-out;
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.96) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                }
                .modal-badge-strip {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.4rem;
                }
                .modal-type-badge {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #ffffff;
                    padding: 0.15rem 0.55rem;
                    border-radius: 1rem;
                }
                .modal-item-type {
                    font-size: 0.72rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    font-weight: 600;
                }
                .modal-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin: 0;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .modal-close-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 1.1rem;
                }
                .modal-body {
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                }
                .modal-detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'};
                }
                .detail-label {
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    font-weight: 500;
                }
                .detail-value {
                    font-weight: 600;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .detail-value.mono {
                    font-family: monospace;
                    font-size: 0.8rem;
                }
                .external-link {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                }
                .modal-desc-box {
                    background: ${isDark ? '#171324' : '#f8fafc'};
                    padding: 0.85rem;
                    border-radius: 0.65rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0'};
                    margin-top: 0.25rem;
                }
                .desc-box-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    margin-bottom: 0.35rem;
                }
                .desc-box-text {
                    font-size: 0.82rem;
                    color: ${isDark ? '#cbd5e1' : '#334155'};
                    margin: 0;
                    line-height: 1.5;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.65rem;
                    padding: 1.15rem 1.5rem;
                    border-top: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    background: ${isDark ? '#252038' : '#f8fafc'};
                }
                .loading-spinner {
                    width: 28px;
                    height: 28px;
                    border: 3px solid rgba(37, 99, 235, 0.2);
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 0.75rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CalendarPage;
