import React, { useState, useContext, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getMediaUrl } from '../../services/api';

const TopBar = ({ onToggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [appsDropdown, setAppsDropdown] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    const appsRef = useRef(null);
    const notifRef = useRef(null);

    const isLight = theme === 'light';

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (appsRef.current && !appsRef.current.contains(e.target)) {
                setAppsDropdown(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = user?.full_name || user?.profile?.full_name || user?.firstname || user?.first_name || user?.username || 'James K.';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const rawPhoto = user?.photo || user?.profile?.avatar || user?.profile_picture || user?.avatar;
    const avatarUrl = getMediaUrl(rawPhoto);
    const userRole = user?.is_staff ? 'Administrator' : (user?.profile?.role || 'Cell Overseer');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/portal/members?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="stitch-topbar">
            {/* Left: Mobile Toggle + Global Stitch Search Bar */}
            <div className="stitch-topbar-left">
                <button className="stitch-mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                <form className="stitch-search-container" onSubmit={handleSearchSubmit}>
                    <svg className="stitch-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        className="stitch-search-input"
                        placeholder="Search members, cells, devotionals, events, reports... (⌘K)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="button"
                        className="stitch-search-filter-btn"
                        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <line x1="1" y1="14" x2="7" y2="14"></line>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="17" y1="16" x2="23" y2="16"></line>
                        </svg>
                        <span>Filters</span>
                    </button>
                </form>
            </div>

            {/* Right: Quick Controls, Notification, Apps, Profile */}
            <div className="stitch-topbar-right">
                {/* Theme Toggle Pill */}
                <button
                    className="stitch-theme-pill"
                    onClick={toggleTheme}
                    title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    <span className={`theme-indicator ${isLight ? 'sun-active' : ''}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        <span>Light</span>
                    </span>
                    <span className="theme-divider">/</span>
                    <span className={`theme-indicator ${!isLight ? 'moon-active' : ''}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                        <span>Dark</span>
                    </span>
                </button>

                {/* Notifications Bell */}
                <div className="stitch-relative-wrap" ref={notifRef}>
                    <button
                        className="stitch-icon-btn"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        aria-label="Notifications"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span className="stitch-notif-badge">3</span>
                    </button>
                    {notificationsOpen && (
                        <div className="stitch-popover notif-popover">
                            <div className="popover-header">
                                <span className="popover-title">Notifications</span>
                                <span className="popover-action">Mark all read</span>
                            </div>
                            <div className="notif-item unread">
                                <span className="notif-dot"></span>
                                <div className="notif-text">
                                    <p className="notif-msg"><strong>Grace Cell</strong> reported 18 attendees for midweek fellowship.</p>
                                    <span className="notif-time">10 mins ago</span>
                                </div>
                            </div>
                            <div className="notif-item unread">
                                <span className="notif-dot"></span>
                                <div className="notif-text">
                                    <p className="notif-msg">Upcoming <strong>Sunday Service</strong> registration opens in 2 hours.</p>
                                    <span className="notif-time">1 hour ago</span>
                                </div>
                            </div>
                            <div className="notif-item">
                                <div className="notif-text">
                                    <p className="notif-msg">New member profile <strong>Debra Wanjiku</strong> added to Faith Cell.</p>
                                    <span className="notif-time">Yesterday</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Apps Grid Icon */}
                <div className="stitch-relative-wrap" ref={appsRef}>
                    <button
                        className="stitch-icon-btn"
                        onClick={() => setAppsDropdown(!appsDropdown)}
                        aria-label="Apps Menu"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="5" cy="5" r="2"></circle>
                            <circle cx="12" cy="5" r="2"></circle>
                            <circle cx="19" cy="5" r="2"></circle>
                            <circle cx="5" cy="12" r="2"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                            <circle cx="19" cy="12" r="2"></circle>
                            <circle cx="5" cy="19" r="2"></circle>
                            <circle cx="12" cy="19" r="2"></circle>
                            <circle cx="19" cy="19" r="2"></circle>
                        </svg>
                    </button>
                    {appsDropdown && (
                        <div className="stitch-popover apps-grid-popover">
                            <Link to="/portal/calendar" className="app-grid-item" onClick={() => setAppsDropdown(false)}>
                                <span className="app-icon">📅</span>
                                <span className="app-label">Calendar</span>
                            </Link>
                            <Link to="/portal/cells" className="app-grid-item" onClick={() => setAppsDropdown(false)}>
                                <span className="app-icon">🏘️</span>
                                <span className="app-label">Cells</span>
                            </Link>
                            <Link to="/portal/members" className="app-grid-item" onClick={() => setAppsDropdown(false)}>
                                <span className="app-icon">👥</span>
                                <span className="app-label">Members</span>
                            </Link>
                            <Link to="/portal/meetings" className="app-grid-item" onClick={() => setAppsDropdown(false)}>
                                <span className="app-icon">📋</span>
                                <span className="app-label">Meetings</span>
                            </Link>
                            <Link to="/portal/finance" className="app-grid-item" onClick={() => setAppsDropdown(false)}>
                                <span className="app-icon">💳</span>
                                <span className="app-label">Giving</span>
                            </Link>
                            <Link to="/portal/devotionals" className="app-grid-item" onClick={() => setAppsDropdown(false)}>
                                <span className="app-icon">📖</span>
                                <span className="app-label">Daily Word</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Profile Pill */}
                <Link to="/portal/users/account" className="stitch-profile-pill">
                    <div className="stitch-profile-avatar" style={{ backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none' }}>
                        {!avatarUrl && initials}
                        <span className="stitch-online-pip"></span>
                    </div>
                    <div className="stitch-profile-info">
                        <span className="profile-name">{displayName}</span>
                        <span className="profile-badge">{userRole}</span>
                    </div>
                </Link>
            </div>

            <style>{`
                .stitch-topbar {
                    height: 60px;
                    background: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    transition: background 0.2s, border-color 0.2s;
                }

                .portal-wrapper.dark-mode .stitch-topbar {
                    background: #141024;
                    border-bottom-color: rgba(255, 255, 255, 0.08);
                }

                .stitch-topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                    max-width: 650px;
                }

                .stitch-mobile-menu-btn {
                    display: none;
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 0.35rem;
                }

                /* Stitch Global Search */
                .stitch-search-container {
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.35rem 0.5rem 0.35rem 0.9rem;
                    width: 100%;
                    gap: 0.5rem;
                    transition: all 0.15s ease;
                }
                .stitch-search-container:focus-within {
                    background: #ffffff;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                .portal-wrapper.dark-mode .stitch-search-container {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .portal-wrapper.dark-mode .stitch-search-container:focus-within {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: #22c1e6;
                }

                .stitch-search-icon {
                    color: #94a3b8;
                    flex-shrink: 0;
                }
                .stitch-search-input {
                    border: none;
                    background: transparent;
                    font-size: 0.82rem;
                    color: #0f172a;
                    outline: none;
                    width: 100%;
                }
                .portal-wrapper.dark-mode .stitch-search-input {
                    color: #f8fafc;
                }
                .stitch-search-input::placeholder {
                    color: #94a3b8;
                }

                .stitch-search-filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.28rem 0.65rem;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #475569;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s;
                }
                .portal-wrapper.dark-mode .stitch-search-filter-btn {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #cbd5e1;
                }
                .stitch-search-filter-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                /* Right Section */
                .stitch-topbar-right {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                }

                /* Theme Pill */
                .stitch-theme-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.3rem 0.65rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    font-size: 0.72rem;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .portal-wrapper.dark-mode .stitch-theme-pill {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .theme-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .theme-indicator.sun-active {
                    color: #0284c7;
                    font-weight: 600;
                }
                .theme-indicator.moon-active {
                    color: #22c1e6;
                    font-weight: 600;
                }
                .theme-divider {
                    opacity: 0.4;
                }

                .stitch-relative-wrap {
                    position: relative;
                }
                .stitch-icon-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    transition: background 0.15s;
                }
                .stitch-icon-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .stitch-icon-btn {
                    color: #94a3b8;
                }
                .portal-wrapper.dark-mode .stitch-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #ffffff;
                }

                .stitch-notif-badge {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: #ef4444;
                    color: #ffffff;
                    font-size: 0.62rem;
                    font-weight: 700;
                    min-width: 15px;
                    height: 15px;
                    border-radius: 9999px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 3px;
                }

                /* Popovers */
                .stitch-popover {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
                    z-index: 1100;
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .stitch-popover {
                    background: #1e1b2e;
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .notif-popover {
                    width: 320px;
                }
                .popover-header {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .portal-wrapper.dark-mode .popover-header {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }
                .popover-title {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .popover-title {
                    color: #ffffff;
                }
                .popover-action {
                    font-size: 0.72rem;
                    color: #2563eb;
                    cursor: pointer;
                }
                .notif-item {
                    padding: 0.65rem 1rem;
                    display: flex;
                    gap: 0.5rem;
                    border-bottom: 1px solid #f8fafc;
                    font-size: 0.78rem;
                }
                .portal-wrapper.dark-mode .notif-item {
                    border-bottom-color: rgba(255, 255, 255, 0.04);
                }
                .notif-item.unread {
                    background: #f8fafc;
                }
                .portal-wrapper.dark-mode .notif-item.unread {
                    background: rgba(34, 193, 230, 0.05);
                }
                .notif-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #2563eb;
                    margin-top: 5px;
                    flex-shrink: 0;
                }
                .notif-msg {
                    margin: 0;
                    color: #334155;
                    line-height: 1.35;
                }
                .portal-wrapper.dark-mode .notif-msg {
                    color: #cbd5e1;
                }
                .notif-time {
                    font-size: 0.68rem;
                    color: #94a3b8;
                }

                .apps-grid-popover {
                    width: 260px;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    padding: 0.75rem;
                    gap: 0.5rem;
                }
                .app-grid-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.65rem 0.25rem;
                    border-radius: 0.5rem;
                    text-decoration: none;
                    transition: background 0.15s;
                }
                .app-grid-item:hover {
                    background: #f1f5f9;
                }
                .portal-wrapper.dark-mode .app-grid-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
                .app-icon {
                    font-size: 1.3rem;
                }
                .app-label {
                    font-size: 0.72rem;
                    color: #475569;
                    font-weight: 500;
                }
                .portal-wrapper.dark-mode .app-label {
                    color: #cbd5e1;
                }

                /* Profile Pill */
                .stitch-profile-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
                    border-radius: 9999px;
                    text-decoration: none;
                    transition: background 0.15s;
                }
                .stitch-profile-pill:hover {
                    background: #f1f5f9;
                }
                .portal-wrapper.dark-mode .stitch-profile-pill:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
                .stitch-profile-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #2563eb;
                    color: #ffffff;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-size: cover;
                    background-position: center;
                    position: relative;
                }
                .stitch-online-pip {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                    border: 1.5px solid #ffffff;
                }
                .stitch-profile-info {
                    display: flex;
                    flex-direction: column;
                }
                .profile-name {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #0f172a;
                    line-height: 1.15;
                }
                .portal-wrapper.dark-mode .profile-name {
                    color: #ffffff;
                }
                .profile-badge {
                    font-size: 0.65rem;
                    color: #64748b;
                }

                @media (max-width: 968px) {
                    .stitch-mobile-menu-btn {
                        display: block;
                    }
                    .stitch-profile-info {
                        display: none;
                    }
                    .stitch-theme-pill span:not(.theme-divider) span {
                        display: none;
                    }
                }
                @media (max-width: 640px) {
                    .stitch-topbar {
                        padding: 0 0.75rem;
                    }
                    .stitch-search-filter-btn {
                        display: none;
                    }
                    .stitch-theme-pill {
                        display: none;
                    }
                }
            `}</style>
        </header>
    );
};

export default TopBar;
