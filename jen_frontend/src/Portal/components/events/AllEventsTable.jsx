import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadEventAttendancePdf } from '../../../services/eventsApi';

const EVENT_TYPE_CONFIG = {
    conference: { label: 'Conference', color: '#2563eb', bg: '#eff6ff' },
    service: { label: 'Service', color: '#9333ea', bg: '#faf5ff' },
    concert: { label: 'Concert', color: '#d97706', bg: '#fffbeb' },
    workshop: { label: 'Workshop', color: '#ea580c', bg: '#fff7ed' },
    outreach: { label: 'Outreach', color: '#db2777', bg: '#fdf2f8' },
    prayer: { label: 'Prayer', color: '#4f46e5', bg: '#eef2ff' },
    training: { label: 'Training', color: '#0d9488', bg: '#f0fdfa' },
    general: { label: 'General', color: '#64748b', bg: '#f1f5f9' },
};

const AllEventsTable = ({ events = [], onCreateEvent }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [downloadingId, setDownloadingId] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleDownloadAttendance = async (eventId, e) => {
        if (e) e.stopPropagation();
        try {
            setDownloadingId(eventId);
            await downloadEventAttendancePdf(eventId);
        } catch (err) {
            console.error('Failed to download attendance PDF:', err);
            alert('Failed to generate event attendance PDF');
        } finally {
            setDownloadingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isPastEvent = (dateStr) => {
        return new Date(dateStr) < new Date();
    };

    // Filter events
    const filteredEvents = events.filter(event => {
        const matchesSearch = (event.ename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.venue || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || (event.type || 'general').toLowerCase() === typeFilter.toLowerCase();
        return matchesSearch && matchesType;
    });

    // Get unique types from data for dropdown
    const availableTypes = [...new Set(events.map(e => (e.type || 'general').toLowerCase()))].sort();

    // Pagination calculations
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);
    const startItem = filteredEvents.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(startIndex + itemsPerPage, filteredEvents.length);

    // Page numbers
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

    const handleExportCsv = () => {
        if (!filteredEvents || filteredEvents.length === 0) {
            alert('No events available to export.');
            return;
        }
        const headers = ['ID', 'Event Name', 'Type', 'Venue', 'Start Date', 'End Date', 'Target Attendees', 'Registered', 'Status'];
        const rows = filteredEvents.map(e => [
            e.id,
            `"${(e.ename || '').replace(/"/g, '""')}"`,
            `"${e.type || 'general'}"`,
            `"${(e.venue || '').replace(/"/g, '""')}"`,
            e.start_date || '',
            e.end_date || '',
            e.target_attendees || 0,
            e.total_registered || 0,
            isPastEvent(e.start_date) ? 'Completed' : 'Upcoming'
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `events_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="stitch-events-table-wrapper">
            {/* Header Toolbar */}
            <div className="events-table-toolbar">
                <div className="toolbar-left">
                    <div>
                        <h3 className="toolbar-title">All Church Events & Conferences</h3>
                        <p className="toolbar-sub">
                            Showing <strong>{startItem}–{endItem}</strong> of <strong>{filteredEvents.length}</strong> scheduled events
                        </p>
                    </div>
                </div>

                <div className="toolbar-right">
                    {/* Search Input */}
                    <div className="table-search-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="table-search-input"
                        />
                        {searchTerm && (
                            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>
                        )}
                    </div>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="table-filter-select"
                    >
                        <option value="">All Types</option>
                        {availableTypes.map(t => (
                            <option key={t} value={t}>
                                {(EVENT_TYPE_CONFIG[t]?.label) || t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* CSV Export */}
                    <button className="tool-btn" title="Export CSV" onClick={handleExportCsv}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>

                    {/* Print */}
                    <button className="tool-btn" title="Print List" onClick={() => window.print()}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                    </button>

                    {/* Create Event */}
                    {onCreateEvent && (
                        <button className="stitch-create-btn" onClick={onCreateEvent}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>New Event</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="table-scroll-container">
                <table className="stitch-data-table">
                    <thead>
                        <tr>
                            <th>EVENT DETAILS</th>
                            <th>TYPE</th>
                            <th>VENUE / LOCATION</th>
                            <th>SCHEDULE</th>
                            <th>ATTENDANCE & TARGET</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEvents.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="table-empty-cell">
                                    <div className="empty-state-box">
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <p className="empty-title">No events found</p>
                                        <p className="empty-sub">Try adjusting your search criteria or create a new event</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedEvents.map((event, index) => {
                                const t = (event.type || 'general').toLowerCase();
                                const cfg = EVENT_TYPE_CONFIG[t] || EVENT_TYPE_CONFIG.general;
                                const isPast = isPastEvent(event.start_date);
                                const target = Number(event.target_attendees) || 100;
                                const registered = Number(event.total_registered) || (event.registrations_count || 0);
                                const pct = Math.min(100, Math.round((registered / target) * 100)) || 0;

                                return (
                                    <tr
                                        key={event.id || index}
                                        className="event-table-row"
                                    >
                                        {/* Event Details */}
                                        <td className="cell-event">
                                            <div className="event-icon-box">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                            </div>
                                            <div className="event-info-text">
                                                <span className="event-title">{event.ename || 'Untitled Event'}</span>
                                                <span className="event-sub">Code: EVT-{event.id || index + 1}</span>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td>
                                            <span
                                                className="event-type-pill"
                                                style={{ background: cfg.bg, color: cfg.color }}
                                            >
                                                {cfg.label}
                                            </span>
                                        </td>

                                        {/* Venue */}
                                        <td>
                                            <div className="venue-cell">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                    <circle cx="12" cy="10" r="3"></circle>
                                                </svg>
                                                <span>{event.venue || 'Main Sanctuary'}</span>
                                            </div>
                                        </td>

                                        {/* Schedule */}
                                        <td>
                                            <div className="schedule-cell">
                                                <span className="schedule-date">{formatDate(event.start_date)}</span>
                                                <span className="schedule-time">{formatTime(event.start_date)}</span>
                                            </div>
                                        </td>

                                        {/* Attendance & Target */}
                                        <td>
                                            <div className="target-progress-wrap">
                                                <div className="target-numbers">
                                                    <span className="reg-count">{registered}</span>
                                                    <span className="target-count">/ {target} goal</span>
                                                    <span className="pct-badge">{pct}%</span>
                                                </div>
                                                <div className="progress-bar-bg">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{
                                                            width: `${pct}%`,
                                                            background: pct >= 80 ? '#10b981' : pct >= 50 ? '#2563eb' : '#f59e0b'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span className={`event-status-pill ${isPast ? 'completed' : 'upcoming'}`}>
                                                {isPast ? 'Completed' : 'Upcoming'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="cell-actions">
                                            <button
                                                type="button"
                                                className="row-action-btn pdf"
                                                title="Download Attendance PDF"
                                                onClick={(e) => handleDownloadAttendance(event.id, e)}
                                                disabled={downloadingId === event.id}
                                            >
                                                {downloadingId === event.id ? (
                                                    <div className="btn-spinner"></div>
                                                ) : (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <line x1="12" y1="18" x2="12" y2="12"></line>
                                                        <line x1="9" y1="15" x2="12" y2="18"></line>
                                                        <line x1="15" y1="15" x2="12" y2="18"></line>
                                                    </svg>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="row-action-btn attend"
                                                title="View Attendees & Check-In"
                                                onClick={() => navigate('/portal/meetings/event-attendance')}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="9" cy="7" r="4"></circle>
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                </svg>
                                            </button>

                                            <button
                                                type="button"
                                                className="row-action-btn view"
                                                title="Event Schedule"
                                                onClick={() => navigate('/portal/meetings/event-schedule')}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stitch Pagination Footer */}
            <div className="stitch-pagination-footer">
                <div className="pagination-left">
                    <span className="pagination-info">
                        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{filteredEvents.length}</strong> events
                    </span>
                    <div className="pagination-rows-selector">
                        <label htmlFor="events-rows-select">Rows per page:</label>
                        <select
                            id="events-rows-select"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rows-select"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                <div className="pagination-right">
                    {/* First */}
                    <button
                        className="page-nav-btn"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
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
                        disabled={currentPage === 1}
                        title="Previous Page"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    {/* Number Pills */}
                    <div className="page-numbers-group">
                        {getPageNumbers().map(pageNum => (
                            <button
                                key={pageNum}
                                className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                                onClick={() => setCurrentPage(pageNum)}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    {/* Next */}
                    <button
                        className="page-nav-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
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
                        disabled={currentPage >= totalPages}
                        title="Last Page"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="13 17 18 12 13 7"></polyline>
                            <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            <style>{`
                .stitch-events-table-wrapper {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    overflow: hidden;
                    margin-top: 1.5rem;
                    margin-bottom: 2rem;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .stitch-events-table-wrapper {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .events-table-toolbar {
                    padding: 1rem 1.35rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .events-table-toolbar {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }

                .toolbar-title {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }
                .portal-wrapper.dark-mode .toolbar-title {
                    color: #ffffff;
                }
                .toolbar-sub {
                    margin: 0.2rem 0 0 0;
                    font-size: 0.75rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .toolbar-sub {
                    color: #94a3b8;
                }
                .toolbar-sub strong {
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .toolbar-sub strong {
                    color: #ffffff;
                }

                .toolbar-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .table-search-wrap {
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
                .portal-wrapper.dark-mode .table-search-wrap {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .table-search-wrap:focus-within {
                    border-color: #2563eb;
                    background: #ffffff;
                }
                .portal-wrapper.dark-mode .table-search-wrap:focus-within {
                    background: #100c22;
                    border-color: #3b82f6;
                }
                .table-search-input {
                    border: none;
                    background: transparent;
                    font-size: 0.78rem;
                    color: #0f172a;
                    outline: none;
                    width: 135px;
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

                .table-filter-select {
                    padding: 0.4rem 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #334155;
                    font-size: 0.78rem;
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                }
                .portal-wrapper.dark-mode .table-filter-select {
                    background: #1a1630;
                    border-color: rgba(255, 255, 255, 0.15);
                    color: #cbd5e1;
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
                .portal-wrapper.dark-mode .tool-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #ffffff;
                }

                .stitch-create-btn {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.45rem 0.85rem;
                    font-size: 0.78rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    cursor: pointer;
                    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
                    transition: background 0.15s, transform 0.1s;
                }
                .stitch-create-btn:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                }

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
                }
                .portal-wrapper.dark-mode .stitch-data-table th {
                    color: #94a3b8;
                }

                .event-table-row {
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.15s;
                }
                .portal-wrapper.dark-mode .event-table-row {
                    border-bottom-color: rgba(255, 255, 255, 0.04);
                }
                .event-table-row:hover {
                    background: #f8fafc;
                }
                .portal-wrapper.dark-mode .event-table-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .stitch-data-table td {
                    padding: 0.85rem 1rem;
                    vertical-align: middle;
                }

                .cell-event {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .event-icon-box {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .portal-wrapper.dark-mode .event-icon-box {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }
                .event-info-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .event-title {
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 0.84rem;
                }
                .portal-wrapper.dark-mode .event-title {
                    color: #ffffff;
                }
                .event-sub {
                    font-size: 0.68rem;
                    color: #64748b;
                    font-family: monospace;
                }
                .portal-wrapper.dark-mode .event-sub {
                    color: #94a3b8;
                }

                .event-type-pill {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    display: inline-block;
                    text-transform: capitalize;
                }

                .venue-cell {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: #334155;
                    font-size: 0.8rem;
                }
                .portal-wrapper.dark-mode .venue-cell {
                    color: #cbd5e1;
                }

                .schedule-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 0.1rem;
                }
                .schedule-date {
                    font-weight: 600;
                    color: #0f172a;
                    font-size: 0.8rem;
                }
                .portal-wrapper.dark-mode .schedule-date {
                    color: #ffffff;
                }
                .schedule-time {
                    font-size: 0.7rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .schedule-time {
                    color: #94a3b8;
                }

                .target-progress-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                    min-width: 130px;
                }
                .target-numbers {
                    display: flex;
                    align-items: baseline;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                }
                .reg-count {
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .reg-count {
                    color: #ffffff;
                }
                .target-count {
                    color: #64748b;
                    font-size: 0.7rem;
                }
                .pct-badge {
                    margin-left: auto;
                    font-weight: 700;
                    font-size: 0.68rem;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .pct-badge {
                    color: #60a5fa;
                }
                .progress-bar-bg {
                    height: 5px;
                    border-radius: 3px;
                    background: #e2e8f0;
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .progress-bar-bg {
                    background: rgba(255, 255, 255, 0.08);
                }
                .progress-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.3s ease;
                }

                .event-status-pill {
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    display: inline-block;
                }
                .event-status-pill.completed {
                    background: #f1f5f9;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .event-status-pill.completed {
                    background: rgba(255, 255, 255, 0.05);
                    color: #94a3b8;
                }
                .event-status-pill.upcoming {
                    background: #ecfdf5;
                    color: #059669;
                }
                .portal-wrapper.dark-mode .event-status-pill.upcoming {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                }

                .cell-actions {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.35rem;
                }
                .row-action-btn {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    width: 30px;
                    height: 30px;
                    border-radius: 0.4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .row-action-btn:hover {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                .portal-wrapper.dark-mode .row-action-btn {
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .portal-wrapper.dark-mode .row-action-btn:hover {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }
                .row-action-btn.pdf:hover {
                    background: #fef2f2;
                    color: #dc2626;
                    border-color: #fecaca;
                }
                .portal-wrapper.dark-mode .row-action-btn.pdf:hover {
                    background: rgba(220, 38, 38, 0.15);
                    color: #f87171;
                }

                .btn-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid #e2e8f0;
                    border-top-color: #dc2626;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .table-empty-cell {
                    padding: 3rem 1rem !important;
                    text-align: center;
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

                /* Pagination */
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
                .portal-wrapper.dark-mode .page-number-btn:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.05);
                    color: #ffffff;
                }
                .page-number-btn.active {
                    background: #2563eb;
                    color: #ffffff;
                    border-color: #2563eb;
                    font-weight: 700;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
                }
            `}</style>
        </div>
    );
};

export default AllEventsTable;
