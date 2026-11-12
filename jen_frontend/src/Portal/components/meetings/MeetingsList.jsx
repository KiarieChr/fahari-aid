import React, { useState, useEffect } from 'react';
import MeetingDetailsModal from './MeetingDetailsModal';
import { getMeetings, downloadMeetingMinutesPdf } from '../../../services/meetingsApi';

const MeetingsList = ({ categoryFilter = '', statusFilter = 'All' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Selected modal
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    // Reset to page 1 whenever filters or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, statusFilter, searchTerm]);

    useEffect(() => {
        fetchMeetings();
    }, [categoryFilter, statusFilter, currentPage, itemsPerPage, searchTerm]);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const response = await getMeetings({
                status: statusFilter === 'All' ? '' : statusFilter,
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
            });

            if (response.success && response.data.meetings) {
                let list = response.data.meetings;
                if (categoryFilter) {
                    list = list.filter(m => 
                        (m.category || '').toLowerCase().includes(categoryFilter.toLowerCase()) ||
                        (m.meeting_type_name || '').toLowerCase().includes(categoryFilter.toLowerCase())
                    );
                }
                setMeetings(list);
                setTotalPages(response.data.pagination?.total_pages || 1);
                setTotalItems(response.data.pagination?.total || list.length);
            } else {
                setMeetings([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (err) {
            console.error('Error fetching meetings:', err);
            setError('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadMinutes = async (meetingId, e) => {
        e.stopPropagation();
        try {
            setDownloadingId(meetingId);
            await downloadMeetingMinutesPdf(meetingId);
        } catch (err) {
            alert('Failed to generate meeting minutes PDF.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleExportCsv = () => {
        if (!meetings || meetings.length === 0) {
            alert('No meetings available to export.');
            return;
        }
        const headers = ['ID', 'Meeting Code', 'Title', 'Category', 'Date', 'Start Time', 'End Time', 'Location', 'Facilitator', 'Status', 'Attendance'];
        const rows = meetings.map(m => [
            m.id,
            `"${m.meeting_code || ''}"`,
            `"${(m.title || '').replace(/"/g, '""')}"`,
            `"${m.category || 'General'}"`,
            m.date || '',
            m.start_time || '',
            m.end_time || '',
            `"${m.location || ''}"`,
            `"${m.facilitator || ''}"`,
            m.status || '',
            m.attendance_count || 0
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `meetings_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    // Calculate pagination slice items
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Page numbers generator with windowing
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

    return (
        <div className="stitch-meetings-list-wrapper">
            {/* Top Toolbar */}
            <div className="meetings-toolbar">
                <div className="toolbar-left">
                    <span className="souls-counter">
                        Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> recorded sessions
                    </span>
                    {categoryFilter && (
                        <span className="active-filter-badge">
                            Category: {categoryFilter}
                        </span>
                    )}
                    {statusFilter !== 'All' && (
                        <span className="active-filter-badge status">
                            Status: {statusFilter}
                        </span>
                    )}
                </div>

                <div className="toolbar-right">
                    <div className="toolbar-search-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="toolbar-search-input"
                        />
                        {searchTerm && (
                            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>
                        )}
                    </div>

                    <button className="tool-btn" title="Export CSV" onClick={handleExportCsv}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    <button className="tool-btn" title="Print Sessions" onClick={handlePrint}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-scroll-container">
                <table className="stitch-data-table">
                    <thead>
                        <tr>
                            <th>SESSION DETAILS</th>
                            <th>CATEGORY</th>
                            <th>SCHEDULE</th>
                            <th>LOCATION</th>
                            <th>FACILITATOR</th>
                            <th>ATTENDANCE</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="table-loading-cell">
                                    <div className="table-spinner-wrap">
                                        <div className="table-spinner"></div>
                                        <span>Loading meetings from database...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : meetings.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="table-empty-cell">
                                    <div className="empty-state-box">
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <p className="empty-title">No meetings found</p>
                                        <p className="empty-sub">Try adjusting your search terms or filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            meetings.map(m => (
                                <tr
                                    key={m.id}
                                    className="meeting-table-row"
                                    onClick={() => setSelectedMeeting(m)}
                                >
                                    {/* Session Details */}
                                    <td className="cell-session">
                                        <div className="session-icon-box">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                        </div>
                                        <div className="session-text">
                                            <span className="session-title">{m.title}</span>
                                            <span className="session-code">{m.meeting_code || `MTG-${m.id}`}</span>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td>
                                        <span className="category-pill">{m.category || 'General'}</span>
                                    </td>

                                    {/* Schedule */}
                                    <td>
                                        <div className="schedule-text">
                                            <span className="schedule-date">{m.date || 'TBD'}</span>
                                            <span className="schedule-time">{m.start_time ? `${m.start_time} - ${m.end_time || ''}` : 'Scheduled'}</span>
                                        </div>
                                    </td>

                                    {/* Location */}
                                    <td>
                                        <span className="location-text">{m.location || 'Sanctuary'}</span>
                                    </td>

                                    {/* Facilitator */}
                                    <td>
                                        <span className="facilitator-text">{m.facilitator || 'Pastoral Team'}</span>
                                    </td>

                                    {/* Attendance */}
                                    <td>
                                        <div className="attendance-chip">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                            </svg>
                                            <span>{m.attendance_count || 0}</span>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td>
                                        <span className={`status-pill ${m.status?.toLowerCase().replace(/\s+/g, '-') || 'upcoming'}`}>
                                            {m.status || 'Upcoming'}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="cell-actions" onClick={e => e.stopPropagation()}>
                                        <button
                                            className="row-action-btn pdf"
                                            onClick={(e) => handleDownloadMinutes(m.id, e)}
                                            disabled={downloadingId === m.id}
                                            title="Download Minutes PDF"
                                        >
                                            {downloadingId === m.id ? (
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
                                            className="row-action-btn view"
                                            onClick={() => setSelectedMeeting(m)}
                                            title="View Details"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="3"></circle>
                                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Google Stitch Pagination Footer */}
            <div className="stitch-pagination-footer">
                <div className="pagination-left">
                    <span className="pagination-info">
                        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> meetings
                    </span>
                    <div className="pagination-rows-selector">
                        <label htmlFor="meetings-rows-select">Rows per page:</label>
                        <select
                            id="meetings-rows-select"
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
                    {/* First Page */}
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

                    {/* Prev Page */}
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

                    {/* Page Numbers */}
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

                    {/* Next Page */}
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

                    {/* Last Page */}
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

            {/* Modal */}
            {selectedMeeting && (
                <MeetingDetailsModal
                    meeting={selectedMeeting}
                    onClose={() => setSelectedMeeting(null)}
                />
            )}

            <style>{`
                .stitch-meetings-list-wrapper {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    overflow: hidden;
                    margin-bottom: 2rem;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .stitch-meetings-list-wrapper {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .meetings-toolbar {
                    padding: 0.85rem 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .meetings-toolbar {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }
                .toolbar-left {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }
                .souls-counter {
                    font-size: 0.78rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .souls-counter {
                    color: #94a3b8;
                }
                .souls-counter strong {
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .souls-counter strong {
                    color: #ffffff;
                }

                .active-filter-badge {
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.15rem 0.55rem;
                    border-radius: 9999px;
                    background: #eff6ff;
                    color: #2563eb;
                    border: 1px solid #bfdbfe;
                }
                .portal-wrapper.dark-mode .active-filter-badge {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                    border-color: rgba(37, 99, 235, 0.3);
                }
                .active-filter-badge.status {
                    background: #ecfdf5;
                    color: #059669;
                    border-color: #a7f3d0;
                }
                .portal-wrapper.dark-mode .active-filter-badge.status {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                    border-color: rgba(16, 185, 129, 0.3);
                }

                .toolbar-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .toolbar-search-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    padding: 0.3rem 0.65rem;
                    color: #64748b;
                    transition: border-color 0.15s, background 0.15s;
                }
                .portal-wrapper.dark-mode .toolbar-search-wrap {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .toolbar-search-wrap:focus-within {
                    border-color: #2563eb;
                    background: #ffffff;
                }
                .portal-wrapper.dark-mode .toolbar-search-wrap:focus-within {
                    background: #100c22;
                    border-color: #3b82f6;
                }
                .toolbar-search-input {
                    border: none;
                    background: transparent;
                    font-size: 0.78rem;
                    color: #0f172a;
                    outline: none;
                    width: 140px;
                }
                .portal-wrapper.dark-mode .toolbar-search-input {
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
                .portal-wrapper.dark-mode .tool-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #ffffff;
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

                .meeting-table-row {
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .portal-wrapper.dark-mode .meeting-table-row {
                    border-bottom-color: rgba(255, 255, 255, 0.04);
                }
                .meeting-table-row:hover {
                    background: #f8fafc;
                }
                .portal-wrapper.dark-mode .meeting-table-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .stitch-data-table td {
                    padding: 0.85rem 1rem;
                    vertical-align: middle;
                }

                .cell-session {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .session-icon-box {
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
                .portal-wrapper.dark-mode .session-icon-box {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }
                .session-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .session-title {
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 0.84rem;
                }
                .portal-wrapper.dark-mode .session-title {
                    color: #ffffff;
                }
                .session-code {
                    font-size: 0.68rem;
                    color: #64748b;
                    font-family: monospace;
                }
                .portal-wrapper.dark-mode .session-code {
                    color: #94a3b8;
                }

                .category-pill {
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                    white-space: nowrap;
                }
                .portal-wrapper.dark-mode .category-pill {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }

                .schedule-text {
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

                .location-text {
                    color: #334155;
                    font-size: 0.8rem;
                }
                .portal-wrapper.dark-mode .location-text {
                    color: #cbd5e1;
                }

                .facilitator-text {
                    color: #334155;
                    font-weight: 500;
                    font-size: 0.8rem;
                }
                .portal-wrapper.dark-mode .facilitator-text {
                    color: #cbd5e1;
                }

                .attendance-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #475569;
                    background: #f1f5f9;
                    padding: 0.2rem 0.55rem;
                    border-radius: 6px;
                }
                .portal-wrapper.dark-mode .attendance-chip {
                    background: rgba(255, 255, 255, 0.05);
                    color: #cbd5e1;
                }

                .status-pill {
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    display: inline-block;
                }
                .status-pill.completed {
                    background: #ecfdf5;
                    color: #059669;
                }
                .portal-wrapper.dark-mode .status-pill.completed {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                }
                .status-pill.upcoming {
                    background: #eff6ff;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .status-pill.upcoming {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }
                .status-pill.in-progress {
                    background: #fef3c7;
                    color: #d97706;
                }
                .portal-wrapper.dark-mode .status-pill.in-progress {
                    background: rgba(217, 119, 6, 0.15);
                    color: #fbbf24;
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
                    border-color: rgba(37, 99, 235, 0.3);
                }
                .row-action-btn.pdf:hover {
                    background: #fef2f2;
                    color: #dc2626;
                    border-color: #fecaca;
                }
                .portal-wrapper.dark-mode .row-action-btn.pdf:hover {
                    background: rgba(220, 38, 38, 0.15);
                    color: #f87171;
                    border-color: rgba(220, 38, 38, 0.3);
                }

                /* Table Loading & Empty */
                .table-loading-cell, .table-empty-cell {
                    padding: 3rem 1rem !important;
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

export default MeetingsList;
