import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AnnouncementsSection = ({ announcements: propAnnouncements, calendarSchedule, loading }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeAnnouncement, setActiveAnnouncement] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        const section = document.getElementById('announcements-section');
        if (section) observer.observe(section);

        return () => observer.disconnect();
    }, []);

    // Fallback announcements if API data not available
    const defaultAnnouncements = [
        {
            id: 1,
            type: 'urgent',
            title: 'Special Prayer Meeting This Friday',
            message: 'Join us for a special prayer and intercession meeting this Friday at 7:00 PM. We will be praying for our nation and community.',
            date: 'March 8, 2026',
            icon: '🙏'
        },
        {
            id: 2,
            type: 'event',
            title: 'Youth Conference Registration Open',
            message: 'Registration for the Annual Youth Conference is now open! Early bird discounts available until March 15th.',
            date: 'March 20-22, 2026',
            icon: '🎉'
        },
        {
            id: 3,
            type: 'info',
            title: 'New Small Group Starting',
            message: 'A new small group for young professionals is starting next month. Sign up at the information desk or online.',
            date: 'Starting April 2026',
            icon: '👥'
        }
    ];

    // Fallback calendar schedule if API data not available
    const defaultEvents = [
        {
            title: 'Sunday Service',
            date: 'Every Sunday',
            time: '9:00 AM & 11:00 AM',
            location: 'Main Sanctuary',
            color: '#22c1e6'
        },
        {
            title: 'Bible Study',
            date: 'Wednesday',
            time: '7:00 PM',
            location: 'Fellowship Hall',
            color: '#a855f7'
        },
        {
            title: 'Youth Meeting',
            date: 'Saturday',
            time: '4:00 PM',
            location: 'Youth Center',
            color: '#10b981'
        },
        {
            title: 'Men\'s Breakfast',
            date: 'March 15',
            time: '8:00 AM',
            location: 'Cafeteria',
            color: '#f59e0b'
        }
    ];

    // Use API data if available, otherwise use defaults
    const announcements = propAnnouncements?.length > 0 ? propAnnouncements : defaultAnnouncements;
    const upcomingEvents = calendarSchedule?.length > 0 
        ? calendarSchedule.map(item => ({
            title: item.title,
            date: item.date,
            time: item.time,
            location: item.type || item.facilitator || 'TBA',
            color: item.color
        }))
        : defaultEvents;

    // Auto-rotate announcements
    useEffect(() => {
        if (announcements.length === 0) return;
        const interval = setInterval(() => {
            setActiveAnnouncement(prev => (prev + 1) % announcements.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [announcements.length]);

    const getTypeBadge = (type) => {
        switch (type) {
            case 'urgent':
                return { bg: '#fee2e2', color: '#ef4444', text: 'Urgent' };
            case 'event':
                return { bg: '#dcfce7', color: '#10b981', text: 'Event' };
            default:
                return { bg: '#e0f2fe', color: '#0ea5e9', text: 'Info' };
        }
    };

    return (
        <section id="announcements-section" className="announcements-section">
            <div className="announcements-bg"></div>

            <div className="container">
                <div className={`section-header ${isVisible ? 'animate-in' : ''}`}>
                    <span className="section-badge">📢 Stay Connected</span>
                    <h2 className="section-title">Announcements & Events</h2>
                    <p className="section-subtitle">Stay updated with what's happening in our community</p>
                </div>

                <div className="announcements-grid">
                    {/* Announcements Carousel */}
                    <div className={`announcements-carousel ${isVisible ? 'animate-in' : ''}`}>
                        <div className="carousel-header">
                            <h3>
                                <span className="header-icon">📣</span>
                                Latest Announcements
                            </h3>
                            <div className="carousel-dots">
                                {announcements.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`dot ${activeAnnouncement === index ? 'active' : ''}`}
                                        onClick={() => setActiveAnnouncement(index)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="carousel-content">
                            {announcements.map((announcement, index) => (
                                <div
                                    key={announcement.id}
                                    className={`announcement-card ${activeAnnouncement === index ? 'active' : ''}`}
                                >
                                    <div className="announcement-icon">{announcement.icon}</div>
                                    <div
                                        className="announcement-badge"
                                        style={{
                                            background: getTypeBadge(announcement.type).bg,
                                            color: getTypeBadge(announcement.type).color
                                        }}
                                    >
                                        {getTypeBadge(announcement.type).text}
                                    </div>
                                    <h4 className="announcement-title">{announcement.title}</h4>
                                    <p className="announcement-message">{announcement.message}</p>
                                    <div className="announcement-date">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        {announcement.date}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link to="/announcements" className="view-all-btn">
                            View All Announcements
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {/* Upcoming Events */}
                    <div className={`events-list ${isVisible ? 'animate-in' : ''}`}>
                        <div className="events-header">
                            <h3>
                                <span className="header-icon">📅</span>
                                Upcoming Events
                            </h3>
                        </div>

                        <div className="events-content">
                            {upcomingEvents.map((event, index) => (
                                <div key={index} className="event-item" style={{ '--accent-color': event.color }}>
                                    <div className="event-date-badge">
                                        <span className="event-day">{event.date.split(' ')[0]}</span>
                                        {event.date.split(' ')[1] && (
                                            <span className="event-month">{event.date.split(' ')[1]}</span>
                                        )}
                                    </div>
                                    <div className="event-details">
                                        <h4 className="event-title">{event.title}</h4>
                                        <div className="event-meta">
                                            <span className="event-time">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                </svg>
                                                {event.time}
                                            </span>
                                            <span className="event-location">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                    <circle cx="12" cy="10" r="3"></circle>
                                                </svg>
                                                {event.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link to="/events" className="view-all-btn secondary">
                            View Full Calendar
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                .announcements-section {
                    position: relative;
                    padding: 6rem 0;
                    background: linear-gradient(180deg, #1e1b2e 0%, #120D20 100%);
                    overflow: hidden;
                }

                .announcements-bg {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        radial-gradient(ellipse at 20% 50%, rgba(34, 193, 230, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%);
                    pointer-events: none;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .section-header.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }

                .section-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    padding: 0.5rem 1.25rem;
                    border-radius: 2rem;
                    font-size: 0.9rem;
                    color: #22c1e6;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .section-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 0.75rem;
                }

                .section-subtitle {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .announcements-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Announcements Carousel */
                .announcements-carousel {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    opacity: 0;
                    transform: translateX(-30px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
                }
                .announcements-carousel.animate-in {
                    opacity: 1;
                    transform: translateX(0);
                }

                .carousel-header, .events-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                }
                .carousel-header h3, .events-header h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #ffffff;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                }
                .header-icon {
                    font-size: 1.3rem;
                }

                .carousel-dots {
                    display: flex;
                    gap: 0.5rem;
                }
                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .dot.active {
                    background: #22c1e6;
                    transform: scale(1.2);
                }

                .carousel-content {
                    position: relative;
                    min-height: 280px;
                }

                .announcement-card {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transform: translateX(20px);
                    transition: all 0.5s ease;
                    pointer-events: none;
                }
                .announcement-card.active {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: auto;
                }

                .announcement-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }

                .announcement-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                }

                .announcement-title {
                    color: #ffffff;
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                }

                .announcement-message {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 1rem;
                    line-height: 1.7;
                    margin-bottom: 1.5rem;
                }

                .announcement-date {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.9rem;
                }

                .view-all-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, #22c1e6 0%, #1aa3c4 100%);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    text-decoration: none;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    transition: all 0.3s ease;
                }
                .view-all-btn:hover {
                    transform: translateX(5px);
                    box-shadow: 0 4px 20px rgba(34, 193, 230, 0.4);
                }
                .view-all-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .view-all-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.15);
                }

                /* Events List */
                .events-list {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    opacity: 0;
                    transform: translateX(30px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
                }
                .events-list.animate-in {
                    opacity: 1;
                    transform: translateX(0);
                }

                .events-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .event-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 0.75rem;
                    border-left: 3px solid var(--accent-color);
                    transition: all 0.3s ease;
                }
                .event-item:hover {
                    background: rgba(255, 255, 255, 0.06);
                    transform: translateX(5px);
                }

                .event-date-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-width: 55px;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                }
                .event-day {
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                .event-month {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.75rem;
                }

                .event-details {
                    flex: 1;
                }
                .event-title {
                    color: #ffffff;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .event-meta {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .event-time, .event-location {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.85rem;
                }

                @media (max-width: 968px) {
                    .announcements-section {
                        padding: 4rem 0;
                    }
                    .section-title {
                        font-size: 2rem;
                    }
                    .announcements-grid {
                        grid-template-columns: 1fr;
                        padding: 0 1rem;
                    }
                    .announcements-carousel,
                    .events-list {
                        padding: 1.5rem;
                    }
                    .carousel-content {
                        min-height: 320px;
                    }
                }

                @media (max-width: 480px) {
                    .carousel-header, .events-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .announcement-title {
                        font-size: 1.2rem;
                    }
                    .event-meta {
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default AnnouncementsSection;
