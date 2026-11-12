import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const UpcomingFellowshipsCard = () => {
    const [fellowships, setFellowships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFellowships = async () => {
            try {
                // Try fetching live events from Django
                const res = await api.get('events/');
                const eventList = res?.results || res?.data || (Array.isArray(res) ? res : []);
                
                if (eventList.length > 0) {
                    const mapped = eventList.slice(0, 3).map((ev, idx) => {
                        const dateObj = ev.start_date ? new Date(ev.start_date) : new Date();
                        const monthDay = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                        const dayNum = String(dateObj.getDate()).padStart(2, '0');
                        const timeStr = ev.start_time || '09:30 AM';
                        const venueStr = ev.location || ev.venue || 'Sanctuary A';

                        return {
                            id: ev.id,
                            monthDay,
                            dayNum,
                            title: ev.ename || ev.name || ev.title || 'Supernatural Increase Service',
                            time: `${timeStr} • ${venueStr}`,
                            minister: ev.speaker ? `Minister: ${ev.speaker}` : 'Minister: Pastor Daniel Mutua',
                            actionType: idx === 0 ? 'rsvp' : 'confirmed',
                            actionLabel: idx === 0 ? 'RSVP' : 'Confirmed'
                        };
                    });
                    setFellowships(mapped);
                } else {
                    useBaseline();
                }
            } catch (err) {
                // Overview fallback
                try {
                    const overview = await api.get('analytics/overview/');
                    if (overview?.upcoming_events && overview.upcoming_events.length > 0) {
                        const mapped = overview.upcoming_events.slice(0, 2).map((ev, idx) => ({
                            id: ev.id,
                            monthDay: idx === 0 ? 'SUN' : 'WED',
                            dayNum: idx === 0 ? '03' : '06',
                            title: ev.title || 'Supernatural Increase Sunday',
                            time: `09:30 AM • Sanctuary A`,
                            minister: 'Minister: Pastor Daniel Mutua',
                            actionType: idx === 0 ? 'rsvp' : 'confirmed',
                            actionLabel: idx === 0 ? 'RSVP' : 'Confirmed'
                        }));
                        setFellowships(mapped);
                        return;
                    }
                } catch (fallbackErr) {
                    // Ignore and use baseline
                }
                useBaseline();
            } finally {
                setLoading(false);
            }
        };

        const useBaseline = () => {
            setFellowships([
                {
                    id: 1,
                    monthDay: 'SUN',
                    dayNum: '03',
                    title: 'Supernatural Increase Sunday',
                    time: '09:30 AM • Sanctuary A',
                    minister: 'Minister: Pastor Daniel Mutua',
                    actionType: 'rsvp',
                    actionLabel: 'RSVP'
                },
                {
                    id: 2,
                    monthDay: 'WED',
                    dayNum: '06',
                    title: 'Midweek Word & Miracle Communion',
                    time: '06:00 PM • Grace Cell Center',
                    minister: 'Host: Sis. Esther Mwangi',
                    actionType: 'confirmed',
                    actionLabel: 'Confirmed'
                }
            ]);
        };

        fetchFellowships();
    }, []);

    return (
        <div className="stitch-fellowships-card">
            {/* Header */}
            <div className="fellowships-header">
                <div className="fellowships-header-left">
                    <span className="fellowships-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </span>
                    <h3 className="fellowships-title">Upcoming Fellowships</h3>
                </div>
                <span className="fellowships-counter">{fellowships.length} This Week</span>
            </div>

            {/* List */}
            <div className="fellowships-list">
                {fellowships.map(f => (
                    <div key={f.id} className="fellowship-item">
                        {/* Date Leaf */}
                        <div className="fellowship-date-box">
                            <span className="date-month">{f.monthDay}</span>
                            <span className="date-num">{f.dayNum}</span>
                        </div>

                        {/* Details */}
                        <div className="fellowship-info">
                            <h4 className="fellowship-name">{f.title}</h4>
                            <p className="fellowship-time">{f.time}</p>
                            <span className="fellowship-minister">{f.minister}</span>
                        </div>

                        {/* Action Pill */}
                        <div className="fellowship-action-wrap">
                            {f.actionType === 'rsvp' ? (
                                <button className="rsvp-btn" onClick={() => alert(`RSVP confirmed for ${f.title}`)}>
                                    RSVP
                                </button>
                            ) : (
                                <span className="confirmed-pill">Confirmed</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .stitch-fellowships-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .stitch-fellowships-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .fellowships-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.25rem;
                }
                .fellowships-header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .fellowships-icon {
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                }
                .portal-wrapper.dark-mode .fellowships-icon {
                    color: #22c1e6;
                }
                .fellowships-title {
                    font-size: 1.02rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .fellowships-title {
                    color: #ffffff;
                }
                .fellowships-counter {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .fellowships-counter {
                    color: #94a3b8;
                }

                .fellowships-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .fellowship-item {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #f8fafc;
                }
                .fellowship-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .portal-wrapper.dark-mode .fellowship-item {
                    border-bottom-color: rgba(255, 255, 255, 0.04);
                }

                .fellowship-date-box {
                    width: 44px;
                    height: 48px;
                    border-radius: 0.65rem;
                    background: #eff6ff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .portal-wrapper.dark-mode .fellowship-date-box {
                    background: rgba(37, 99, 235, 0.15);
                }
                .date-month {
                    font-size: 0.62rem;
                    font-weight: 700;
                    color: #2563eb;
                    letter-spacing: 0.05em;
                }
                .portal-wrapper.dark-mode .date-month {
                    color: #60a5fa;
                }
                .date-num {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                }
                .portal-wrapper.dark-mode .date-num {
                    color: #ffffff;
                }

                .fellowship-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .fellowship-name {
                    font-size: 0.84rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .portal-wrapper.dark-mode .fellowship-name {
                    color: #f1f5f9;
                }
                .fellowship-time {
                    font-size: 0.72rem;
                    color: #64748b;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .fellowship-time {
                    color: #94a3b8;
                }
                .fellowship-minister {
                    font-size: 0.68rem;
                    color: #94a3b8;
                    font-style: italic;
                }

                .fellowship-action-wrap {
                    flex-shrink: 0;
                }
                .rsvp-btn {
                    background: #06b6d4;
                    color: #ffffff;
                    border: none;
                    border-radius: 9999px;
                    padding: 0.28rem 0.75rem;
                    font-size: 0.72rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .rsvp-btn:hover {
                    background: #0891b2;
                }

                .confirmed-pill {
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 0.28rem 0.65rem;
                    border-radius: 9999px;
                }
                .portal-wrapper.dark-mode .confirmed-pill {
                    background: rgba(255, 255, 255, 0.08);
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default UpcomingFellowshipsCard;
