import React, { useState, useEffect } from 'react';
import { API_BASE_URL as API_URL } from '../../../services/api';

const EventsCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [focusedDay, setFocusedDay] = useState(new Date().getDate());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Color mapping for labels (excluding planning)
    const labelColors = {
        'personal': '#ef4444',
        'family': '#f59e0b',
        'events': '#f59e0b',
        'jesus enthroned events': '#22c1e6',
        'word session': '#4ade80',
        'holiday': '#4ade80',
        'prayer': '#6366f1',
        'etc': '#a855f7',
        'business': '#22c1e6'
    };

    // Fetch events from API - exclude planning
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}get_calendar_events.php?year=${year}&month=${month}&exclude=planning`);
                const data = await response.json();
                if (data.success) {
                    // Filter out planning events on client side as well
                    const filteredEvents = (data.events || []).filter(
                        e => e.label?.toLowerCase() !== 'planning'
                    );
                    setEvents(filteredEvents);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.error('Failed to fetch events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [year, month]);

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1));
        setFocusedDay(1);
    };
    
    const nextMonth = () => {
        setCurrentDate(new Date(year, month, 1));
        setFocusedDay(1);
    };

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.start?.startsWith(dateStr) || e.date?.startsWith(dateStr));
    };

    const handleEventClick = (event, e) => {
        if (e) e.stopPropagation();
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleDayClick = (day) => {
        setFocusedDay(day);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('default', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFocusedDateString = () => {
        const date = new Date(year, month - 1, focusedDay);
        return date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const focusedEvents = getEventsForDay(focusedDay);

    return (
        <section className="events-calendar-section">
            <div className="events-calendar-container">
                <div className="calendar-section-header">
                    <span className="calendar-eyebrow">Schedule & Plans</span>
                    <h2>Events Calendar</h2>
                    <p>Select a date to inspect scheduled gatherings and programs</p>
                </div>

                <div className="calendar-two-column">
                    {/* Left Column: Interactive Calendar grid */}
                    <div className="calendar-left-col">
                        <div className="calendar-wrapper">
                            <div className="calendar-header">
                                <button onClick={prevMonth} className="calendar-nav-btn">
                                    ← Previous
                                </button>
                                <h3 className="calendar-month-title">
                                    {currentDate.toLocaleString('default', { month: 'long' })} {year}
                                </h3>
                                <button onClick={nextMonth} className="calendar-nav-btn">
                                    Next →
                                </button>
                            </div>

                            <div className="calendar-scroll-wrapper">
                                {loading ? (
                                    <div className="calendar-loading">Loading events...</div>
                                ) : (
                                    <div className="calendar-grid">
                                        {dayLabels.map(label => (
                                            <div key={label} className="calendar-day-label">
                                                {label}
                                            </div>
                                        ))}

                                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                            <div key={`empty-${i}`} className="calendar-day empty"></div>
                                        ))}

                                        {days.map(day => {
                                            const dayEvents = getEventsForDay(day);
                                            const isToday = day === new Date().getDate() && 
                                                            month === (new Date().getMonth() + 1) && 
                                                            year === new Date().getFullYear();
                                            const isFocused = day === focusedDay;

                                            return (
                                                <div 
                                                    key={day} 
                                                    className={`calendar-day ${isToday ? 'today' : ''} ${isFocused ? 'focused-day' : ''}`}
                                                    onClick={() => handleDayClick(day)}
                                                >
                                                    <div className="day-number-row">
                                                        <span className="day-number">{day}</span>
                                                        {dayEvents.length > 0 && (
                                                            <span className="day-event-dot"></span>
                                                        )}
                                                    </div>
                                                    <div className="day-events">
                                                        {dayEvents.map(event => (
                                                            <div
                                                                key={event.id}
                                                                className="event-pill"
                                                                style={{ 
                                                                    background: event.color || labelColors[event.label?.toLowerCase()] || '#22c1e6' 
                                                                }}
                                                                onClick={(e) => handleEventClick(event, e)}
                                                                title={`Click for details: ${event.title}`}
                                                            >
                                                                {event.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Schedule Panel on Focus */}
                    <div className="calendar-right-col">
                        <div className="schedule-panel-glass">
                            <div className="schedule-panel-header">
                                <span className="schedule-date-subtitle">Agenda For</span>
                                <h3 className="schedule-date-title">{getFocusedDateString()}</h3>
                            </div>

                            <div className="schedule-panel-body">
                                {focusedEvents.length === 0 ? (
                                    <div className="empty-schedule-state">
                                        <div className="empty-calendar-icon">📅</div>
                                        <h4>No Gatherings Scheduled</h4>
                                        <p>There are no public network events scheduled on this day.</p>

                                        {events.length > 0 && (
                                            <div className="other-upcoming-list">
                                                <h5>Upcoming This Month</h5>
                                                {events.slice(0, 3).map(evt => (
                                                    <div 
                                                        key={evt.id} 
                                                        className="upcoming-quick-card"
                                                        onClick={() => {
                                                            const evtDate = new Date(evt.start || evt.date);
                                                            setFocusedDay(evtDate.getDate());
                                                        }}
                                                    >
                                                        <span className="quick-card-badge" style={{ background: evt.color || '#22c1e6' }}>
                                                            {evt.label || 'Meeting'}
                                                        </span>
                                                        <div className="quick-card-details">
                                                            <span className="quick-card-title">{evt.title}</span>
                                                            <span className="quick-card-date">
                                                                {new Date(evt.start || evt.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="schedule-events-list">
                                        {focusedEvents.map(evt => (
                                            <div key={evt.id} className="focused-event-card">
                                                <div className="focused-event-card-header">
                                                    <span className="focused-event-badge" style={{ background: evt.color || labelColors[evt.label?.toLowerCase()] || '#22c1e6' }}>
                                                        {evt.label || 'Gathering'}
                                                    </span>
                                                    {evt.start && (
                                                        <span className="focused-event-time">
                                                            🕒 {new Date(evt.start).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="focused-event-title">{evt.title}</h4>
                                                
                                                {evt.description && (
                                                    <p className="focused-event-desc">{evt.description}</p>
                                                )}

                                                <div className="focused-event-meta">
                                                    {evt.venue && (
                                                        <div className="meta-item">
                                                            <span>📍 Venue:</span> {evt.venue}
                                                        </div>
                                                    )}
                                                    {evt.end && (
                                                        <div className="meta-item">
                                                            <span>⏱ Ends:</span> {formatDateTime(evt.end)}
                                                        </div>
                                                    )}
                                                </div>

                                                {evt.url && (
                                                    <a 
                                                        href={evt.url.startsWith('http') ? evt.url : `https://${evt.url}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="schedule-join-btn"
                                                    >
                                                        Join Online Gathering →
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Details Modal (Backup inspector) */}
            {modalOpen && selectedEvent && (
                <div className="event-modal-overlay" onClick={closeModal}>
                    <div className="event-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h2>{selectedEvent.title}</h2>
                            <button className="modal-close-btn" onClick={closeModal}>×</button>
                        </div>
                        <div className="event-modal-body">
                            <div className="event-detail-row">
                                <span className="event-detail-label">Category</span>
                                <span className="event-detail-value">
                                    <span
                                        className="event-label-badge"
                                        style={{ background: selectedEvent.color || '#22c1e6' }}
                                    >
                                        {selectedEvent.label || 'Event'}
                                    </span>
                                </span>
                            </div>
                            <div className="event-detail-row">
                                <span className="event-detail-label">Start</span>
                                <span className="event-detail-value">{formatDateTime(selectedEvent.start)}</span>
                            </div>
                            {selectedEvent.end && (
                                <div className="event-detail-row">
                                    <span className="event-detail-label">End</span>
                                    <span className="event-detail-value">{formatDateTime(selectedEvent.end)}</span>
                                </div>
                            )}
                            {selectedEvent.venue && (
                                <div className="event-detail-row">
                                    <span className="event-detail-label">Venue</span>
                                    <span className="event-detail-value">{selectedEvent.venue}</span>
                                </div>
                            )}
                            {selectedEvent.description && (
                                <div className="event-detail-row">
                                    <span className="event-detail-label">Details</span>
                                    <span className="event-detail-value">{selectedEvent.description}</span>
                                </div>
                            )}
                        </div>
                        <div className="event-modal-footer">
                            <button className="modal-btn secondary" onClick={closeModal}>Close</button>
                            {selectedEvent.url && (
                                <a
                                    href={selectedEvent.url.startsWith('http') ? selectedEvent.url : `https://${selectedEvent.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="modal-btn primary"
                                >
                                    Join Meeting
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .events-calendar-section {
                    padding: 4rem 0;
                    background: transparent;
                }

                .events-calendar-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 4%;
                }

                .calendar-section-header {
                    text-align: center;
                    margin-bottom: 3.5rem;
                }

                .calendar-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 700;
                    margin-bottom: 12px;
                    display: block;
                }

                .calendar-section-header h2 {
                    font-size: 2.5rem;
                    font-family: 'Playfair Display', serif;
                    color: #ffffff;
                    margin: 0 0 0.5rem 0;
                    font-weight: 700;
                }

                .calendar-section-header p {
                    color: #94a3b8;
                    font-size: 1.1rem;
                    margin: 0;
                }

                /* Two Column Layout Grid */
                .calendar-two-column {
                    display: grid;
                    grid-template-columns: 1.35fr 0.85fr;
                    gap: 32px;
                    align-items: start;
                }

                .calendar-left-col {
                    width: 100%;
                }

                .calendar-wrapper {
                    background: rgba(26, 22, 37, 0.4);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1.5rem;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                }

                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 1.75rem;
                    background: rgba(26, 22, 37, 0.6);
                    color: white;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .calendar-month-title {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    font-family: 'Playfair Display', serif;
                }

                .calendar-nav-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: white;
                    padding: 0.6rem 1.2rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.25s ease;
                }

                .calendar-nav-btn:hover {
                    background: var(--primary, #22c1e6);
                    color: #120D20;
                    border-color: var(--primary, #22c1e6);
                    box-shadow: 0 0 15px rgba(34, 193, 230, 0.35);
                }

                .calendar-scroll-wrapper {
                    overflow-x: auto;
                }

                .calendar-loading {
                    padding: 4rem;
                    text-align: center;
                    color: #94a3b8;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, minmax(80px, 1fr));
                    min-width: 600px;
                    background: rgba(255, 255, 255, 0.005);
                }

                .calendar-day-label {
                    background: rgba(26, 22, 37, 0.5);
                    padding: 0.85rem 0.5rem;
                    text-align: center;
                    font-weight: 700;
                    color: #ffffff;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    letter-spacing: 0.05em;
                }

                .calendar-day {
                    min-height: 90px;
                    padding: 0.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-top: none;
                    background: transparent;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    transition: background 0.25s ease, border-color 0.25s ease;
                    cursor: pointer;
                }

                .calendar-day:hover {
                    background: rgba(255, 255, 255, 0.015);
                }

                .calendar-day.empty {
                    background: rgba(255, 255, 255, 0.005);
                    cursor: default;
                }

                .calendar-day.today {
                    background: rgba(34, 193, 230, 0.05);
                    border-color: rgba(34, 193, 230, 0.25);
                }

                .calendar-day.focused-day {
                    background: rgba(239, 243, 193, 0.06);
                    border-color: var(--secondary, #eff3c1);
                }

                .day-number-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }

                .day-number {
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .calendar-day.today .day-number {
                    color: #22c1e6;
                }

                .calendar-day.focused-day .day-number {
                    color: var(--secondary, #eff3c1);
                }

                .day-event-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background-color: var(--primary, #22c1e6);
                    box-shadow: 0 0 6px var(--primary);
                }

                .day-events {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    overflow: hidden;
                    margin-top: 4px;
                }

                .event-pill {
                    color: white;
                    font-size: 0.65rem;
                    padding: 3px 6px;
                    border-radius: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s, box-shadow 0.2s;
                    font-weight: 600;
                }

                .event-pill:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                    filter: brightness(1.1);
                }

                /* Right Column: Schedule Panel */
                .calendar-right-col {
                    position: sticky;
                    top: 100px;
                }

                .schedule-panel-glass {
                    background: rgba(26, 22, 37, 0.4);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1.5rem;
                    padding: 32px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    min-height: 420px;
                }

                .schedule-panel-header {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    padding-bottom: 20px;
                    margin-bottom: 24px;
                }

                .schedule-date-subtitle {
                    font-size: 11px;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 700;
                    display: block;
                    margin-bottom: 6px;
                }

                .schedule-date-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.4rem;
                    color: #ffffff;
                    margin: 0;
                    font-weight: 700;
                }

                /* Schedule List */
                .schedule-events-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .focused-event-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 16px;
                    padding: 20px;
                    transition: border-color 0.25s;
                }

                .focused-event-card:hover {
                    border-color: rgba(34, 193, 230, 0.2);
                }

                .focused-event-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .focused-event-badge {
                    display: inline-block;
                    padding: 0.25rem 0.65rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .focused-event-time {
                    font-size: 0.8rem;
                    color: #22c1e6;
                    font-weight: 600;
                }

                .focused-event-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #ffffff;
                    margin: 0 0 10px 0;
                    line-height: 1.3;
                }

                .focused-event-desc {
                    font-size: 0.88rem;
                    color: #94a3b8;
                    line-height: 1.6;
                    margin: 0 0 16px 0;
                }

                .focused-event-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 20px;
                    font-size: 0.85rem;
                    color: #94a3b8;
                }

                .focused-event-meta span {
                    font-weight: 600;
                    color: #ffffff;
                }

                .schedule-join-btn {
                    display: block;
                    width: 100%;
                    padding: 10px;
                    border-radius: 8px;
                    background: rgba(34, 193, 230, 0.08);
                    border: 1px solid rgba(34, 193, 230, 0.2);
                    color: #22c1e6;
                    font-size: 12px;
                    font-weight: 700;
                    text-align: center;
                    text-decoration: none;
                    transition: all 0.25s ease;
                }

                .schedule-join-btn:hover {
                    background: var(--primary, #22c1e6);
                    color: #120D20;
                    border-color: var(--primary, #22c1e6);
                    box-shadow: 0 4px 12px rgba(34, 193, 230, 0.25);
                }

                /* Empty Schedule State styling */
                .empty-schedule-state {
                    text-align: center;
                    padding: 30px 10px;
                }

                .empty-calendar-icon {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                    opacity: 0.4;
                }

                .empty-schedule-state h4 {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #ffffff;
                    margin: 0 0 8px 0;
                }

                .empty-schedule-state p {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    margin: 0 0 24px 0;
                    line-height: 1.5;
                }

                /* Other Month items */
                .other-upcoming-list {
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    padding-top: 24px;
                    text-align: left;
                }

                .other-upcoming-list h5 {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0 0 12px 0;
                }

                .upcoming-quick-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.015);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    padding: 10px 14px;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: border-color 0.25s;
                }

                .upcoming-quick-card:hover {
                    border-color: rgba(34, 193, 230, 0.25);
                }

                .quick-card-badge {
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    color: white;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .quick-card-details {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .quick-card-title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #ffffff;
                }

                .quick-card-date {
                    font-size: 0.72rem;
                    color: #94a3b8;
                }

                /* Event Modal details (backup) */
                .event-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 1rem;
                    animation: fadeIn 0.25s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .event-modal {
                    background: #161226;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1.5rem;
                    max-width: 480px;
                    width: 100%;
                    max-height: 90vh;
                    overflow: hidden;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
                }

                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .event-modal-header {
                    padding: 1.5rem 1.75rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                    background: #120D20;
                    color: white;
                    border-radius: 1.5rem 1.5rem 0 0;
                }

                .event-modal-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-family: 'Playfair Display', serif;
                    line-height: 1.4;
                }

                .modal-close-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .modal-close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .event-modal-body {
                    padding: 1.75rem;
                }

                .event-detail-row {
                    display: flex;
                    gap: 1rem;
                    padding: 0.9rem 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .event-detail-row:last-child {
                    border-bottom: none;
                }

                .event-detail-label {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    min-width: 85px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .event-detail-value {
                    font-size: 0.95rem;
                    color: #ffffff;
                    flex: 1;
                    line-height: 1.5;
                }

                .event-label-badge {
                    display: inline-block;
                    padding: 0.3rem 0.85rem;
                    border-radius: 1rem;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .event-link {
                    color: var(--primary, #22c1e6);
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .event-link:hover {
                    color: var(--secondary, #eff3c1);
                }

                .event-modal-footer {
                    padding: 1.25rem 1.75rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    gap: 0.85rem;
                    justify-content: flex-end;
                    background: #120D20;
                    border-radius: 0 0 1.5rem 1.5rem;
                }

                .modal-btn {
                    padding: 0.7rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-btn.secondary {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #ffffff;
                }

                .modal-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.08);
                }

                .modal-btn.primary {
                    background: linear-gradient(135deg, var(--primary) 0%, #1aa3c4 100%);
                    border: none;
                    color: white;
                    box-shadow: 0 4px 12px rgba(34, 193, 230, 0.2);
                }

                .modal-btn.primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(34, 193, 230, 0.35);
                }

                /* Responsive */
                @media (max-width: 968px) {
                    .calendar-two-column {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .calendar-right-col {
                        position: static;
                    }
                }

                @media (max-width: 768px) {
                    .events-calendar-section {
                        padding: 2rem 0;
                    }

                    .calendar-section-header h2 {
                        font-size: 1.8rem;
                    }

                    .calendar-header {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                        padding: 1rem;
                    }

                    .calendar-nav-btn {
                        padding: 0.5rem 1rem;
                        font-size: 0.8rem;
                    }

                    .calendar-month-title {
                        font-size: 1.3rem;
                    }

                    .calendar-grid {
                        grid-template-columns: repeat(7, minmax(45px, 1fr));
                        min-width: 315px;
                    }

                    .calendar-day {
                        min-height: 75px;
                        padding: 0.4rem;
                    }

                    .day-number {
                        font-size: 0.8rem;
                    }

                    .calendar-day-label {
                        padding: 0.65rem 0.25rem;
                        font-size: 0.65rem;
                    }

                    .event-pill {
                        font-size: 0.55rem;
                        padding: 2px 4px;
                    }

                    .event-modal {
                        margin: 0.5rem;
                    }

                    .event-detail-row {
                        flex-direction: column;
                        gap: 0.25rem;
                    }

                    .event-detail-label {
                        min-width: auto;
                    }
                }

                @media (max-width: 480px) {
                    .calendar-grid {
                        grid-template-columns: repeat(7, minmax(38px, 1fr));
                        min-width: 266px;
                    }

                    .calendar-day {
                        min-height: 60px;
                        padding: 0.3rem;
                    }

                    .day-number {
                        font-size: 0.7rem;
                    }

                    .calendar-day-label {
                        font-size: 0.55rem;
                    }

                    .event-pill {
                        font-size: 0.5rem;
                        padding: 1px 2px;
                    }
                }
            `}</style>
        </section>
    );
};

export default EventsCalendar;
