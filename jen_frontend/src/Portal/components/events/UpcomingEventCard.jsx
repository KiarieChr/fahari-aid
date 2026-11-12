import React, { useState, useContext } from 'react';
import { getEventAttendance } from '../../../services/eventsApi';
import { ThemeContext } from '../../../context/ThemeContext';

const UpcomingEventCard = ({ event }) => {
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [attendeesData, setAttendeesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchAttendees = async () => {
        if (!event?.id) return;
        try {
            setLoading(true);
            const response = await getEventAttendance(event.id);
            if (response?.success) {
                const list = response.data?.attendees || [];
                setAttendeesData({
                    total: response.data?.stats?.total_registered ?? list.length,
                    self_funded_count: list.filter(a => !a.sponsorship || a.sponsorship === 'self').length,
                    sponsored_count: list.filter(a => a.sponsorship && a.sponsorship !== 'self').length,
                    attendees: list,
                    event: event
                });
            }
        } catch (err) {
            console.error('Error fetching attendees:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendingClick = () => {
        fetchAttendees();
        setShowAttendeesModal(true);
    };

    const copyRegistrationLink = () => {
        const link = `${window.location.origin}/events/${event?.id}/register`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!event) {
        return (
            <div className="stitch-upcoming-card empty">
                <div className="empty-icon-wrap">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
                <p className="empty-text">No upcoming featured events</p>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysUntil = (dateStr) => {
        const eventDate = new Date(dateStr);
        const today = new Date();
        const diffTime = eventDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysUntil = getDaysUntil(event.start_date);

    return (
        <div className="stitch-upcoming-card">
            {/* Top Badge & Countdown */}
            <div className="card-top-row">
                <div className="featured-badge">
                    <span className="live-dot">●</span>
                    <span>FEATURED UPCOMING CONVENTION</span>
                </div>
                {daysUntil >= 0 && (
                    <span className="countdown-pill">
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days to go`}
                    </span>
                )}
            </div>

            {/* Event Title */}
            <h3 className="event-name">{event.ename}</h3>

            {/* Meta Information Grid */}
            <div className="event-meta-grid">
                <div className="meta-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{formatDate(event.start_date)} • {formatTime(event.start_date)}</span>
                </div>

                <div className="meta-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{event.venue || 'Main Sanctuary'}</span>
                </div>

                <div className="meta-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span><strong>{event.total_registered || event.registered || 0}</strong> Registered ({event.target_attendees || 500} capacity)</span>
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="card-actions-row">
                <button
                    className="stitch-action-btn primary"
                    onClick={handleAttendingClick}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span>Attendees ({event.registered || event.total_registered || 0})</span>
                </button>

                <button
                    className={`stitch-action-btn copy ${copied ? 'copied' : ''}`}
                    onClick={copyRegistrationLink}
                >
                    {copied ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Link Copied</span>
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            <span>Copy Registration Link</span>
                        </>
                    )}
                </button>
            </div>

            {/* Attendees Modal */}
            {showAttendeesModal && (
                <AttendeesModal
                    data={attendeesData}
                    loading={loading}
                    onClose={() => setShowAttendeesModal(false)}
                    onCopyLink={copyRegistrationLink}
                    copied={copied}
                    registrationLink={`${window.location.origin}/events/${event?.id}/register`}
                />
            )}

            <style>{`
                .stitch-upcoming-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.4rem 1.6rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .stitch-upcoming-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .stitch-upcoming-card.empty {
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                }
                .empty-icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.5rem;
                }
                .empty-text {
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .card-top-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }
                .featured-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    color: #2563eb;
                    background: #eff6ff;
                    padding: 0.22rem 0.6rem;
                    border-radius: 9999px;
                }
                .portal-wrapper.dark-mode .featured-badge {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }
                .live-dot {
                    font-size: 0.6rem;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .live-dot {
                    color: #60a5fa;
                }

                .countdown-pill {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #d97706;
                    background: #fffbeb;
                    padding: 0.22rem 0.6rem;
                    border-radius: 9999px;
                }
                .portal-wrapper.dark-mode .countdown-pill {
                    background: rgba(217, 119, 6, 0.15);
                    color: #fbbf24;
                }

                .event-name {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 0.85rem 0;
                    letter-spacing: -0.01em;
                    line-height: 1.3;
                }
                .portal-wrapper.dark-mode .event-name {
                    color: #ffffff;
                }

                .event-meta-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                    margin-bottom: 1.25rem;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .meta-item {
                    color: #94a3b8;
                }
                .meta-item strong {
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .meta-item strong {
                    color: #ffffff;
                }

                .card-actions-row {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }
                .stitch-action-btn {
                    padding: 0.5rem 0.95rem;
                    border-radius: 0.5rem;
                    font-size: 0.78rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .stitch-action-btn.primary {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
                }
                .stitch-action-btn.primary:hover {
                    background: #1d4ed8;
                }
                .stitch-action-btn.copy {
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                }
                .stitch-action-btn.copy:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.copy {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #cbd5e1;
                }
                .stitch-action-btn.copy.copied {
                    background: #ecfdf5;
                    border-color: #10b981;
                    color: #059669;
                }
            `}</style>
        </div>
    );
};

// Attendees Modal Component
const AttendeesModal = ({ data, loading, onClose, onCopyLink, copied, registrationLink }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1rem'
        }} onClick={onClose}>
            <div
                style={{
                    background: isDark ? '#151128' : '#ffffff',
                    borderRadius: '1.25rem',
                    width: '100%',
                    maxWidth: '720px',
                    maxHeight: '82vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                    boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    transition: 'background 0.2s, border-color 0.2s'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{
                    padding: '1.25rem 1.6rem',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>
                            Registered Attendees
                        </h3>
                        {data && (
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                {data.event?.ename} • {data.total || 0} registered souls
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Copy Link Bar */}
                <div style={{
                    padding: '0.75rem 1.6rem',
                    background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <input
                        type="text"
                        readOnly
                        value={registrationLink || ''}
                        style={{
                            flex: 1,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                            background: isDark ? '#0d0a1a' : '#ffffff',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            fontSize: '0.8rem',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={onCopyLink}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: copied ? '#10b981' : '#2563eb',
                            color: '#fff',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {copied ? '✓ Copied' : 'Copy Link'}
                    </button>
                </div>

                {/* Stats Bar */}
                {data && (
                    <div style={{
                        padding: '0.75rem 1.6rem',
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f1f5f9',
                        display: 'flex',
                        gap: '1.5rem',
                        fontSize: '0.78rem',
                        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0'}`
                    }}>
                        <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                            Total: <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{data.total || 0}</strong>
                        </span>
                        <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                            Self-funded: <strong style={{ color: '#10b981' }}>{data.self_funded_count || 0}</strong>
                        </span>
                        <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                            Need Sponsorship: <strong style={{ color: '#f59e0b' }}>{data.sponsored_count || 0}</strong>
                        </span>
                    </div>
                )}

                {/* Attendees List */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.6rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                            Loading registered attendees...
                        </div>
                    ) : !data?.attendees?.length ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                            <p style={{ margin: 0, fontWeight: '600', color: isDark ? '#f8fafc' : '#0f172a' }}>No registrations yet</p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem' }}>Share the registration link to start registering participants</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}` }}>
                                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>#</th>
                                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>Name</th>
                                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>Contact</th>
                                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>Location</th>
                                    <th style={{ padding: '0.65rem 0.5rem', textAlign: 'left', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.attendees.map((attendee, index) => (
                                    <tr key={attendee.id || index} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9'}` }}>
                                        <td style={{ padding: '0.75rem 0.5rem', color: isDark ? '#94a3b8' : '#64748b' }}>{index + 1}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '600' }}>
                                            {attendee.names || 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <div style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.78rem' }}>{attendee.phone_no || '-'}</div>
                                            <div style={{ color: '#2563eb', fontSize: '0.74rem' }}>{attendee.email || '-'}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.78rem' }}>
                                            {attendee.residence || attendee.travelling_from || '-'}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.55rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.68rem',
                                                fontWeight: '600',
                                                background: attendee.sponsorship === 'sponsored-fully' || attendee.sponsorship === 'half-sponsored'
                                                    ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb')
                                                    : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5'),
                                                color: attendee.sponsorship === 'sponsored-fully' || attendee.sponsorship === 'half-sponsored'
                                                    ? '#d97706'
                                                    : '#059669'
                                            }}>
                                                {attendee.sponsorship === 'sponsored-fully' ? 'Need Full Sponsor' :
                                                    attendee.sponsorship === 'half-sponsored' ? 'Need Half Sponsor' : 'Self-funded'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpcomingEventCard;
