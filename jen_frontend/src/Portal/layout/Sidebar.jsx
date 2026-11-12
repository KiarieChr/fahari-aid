import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMediaUrl } from '../../services/api';

// SVG Icon Components matching Stitch minimal line style
const Icons = {
    Dashboard: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
        </svg>
    ),
    Calendar: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    ),
    Cells: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3"></path>
            <circle cx="12" cy="3" r="1.5"></circle>
            <circle cx="12" cy="21" r="1.5"></circle>
            <circle cx="3" cy="12" r="1.5"></circle>
            <circle cx="21" cy="12" r="1.5"></circle>
        </svg>
    ),
    Members: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    ),
    Meetings: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        </svg>
    ),
    Contributions: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
    ),
    Devotionals: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
    ),
    SoulWinning: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="12 8 8 12 12 16 16 12 12 8"></polygon>
        </svg>
    ),
    Analytics: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
        </svg>
    ),
    Prayers: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a5 5 0 0 0-5 5c0 5 5 11 5 11s5-6 5-11a5 5 0 0 0-5-5z"></path>
            <circle cx="12" cy="7" r="2"></circle>
        </svg>
    ),
    ShoppingBag: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
    ),
    Help: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    Settings: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    ),
    Users: () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
    ),
    ChevronDown: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    ),
    Logout: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
    ),
    Plus: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    ),
    Close: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    )
};

const SidebarItem = ({ icon: Icon, label, path, badge, active, subItems, isOpen, onToggle, onClose }) => {
    const location = useLocation();

    return (
        <div className="stitch-nav-item-wrap">
            {subItems ? (
                <div
                    onClick={onToggle}
                    className={`stitch-nav-item ${active ? 'active' : ''}`}
                >
                    <span className="stitch-nav-icon"><Icon /></span>
                    <span className="stitch-nav-label">{label}</span>
                    {badge && <span className="stitch-nav-badge">{badge}</span>}
                    <span className={`stitch-chevron ${isOpen ? 'open' : ''}`}>
                        <Icons.ChevronDown />
                    </span>
                    {active && <span className="stitch-active-dot">●</span>}
                </div>
            ) : (
                <Link
                    to={path}
                    onClick={onClose}
                    className={`stitch-nav-item ${active ? 'active' : ''}`}
                >
                    <span className="stitch-nav-icon"><Icon /></span>
                    <span className="stitch-nav-label">{label}</span>
                    {badge && <span className="stitch-nav-badge">{badge}</span>}
                    {active && <span className="stitch-active-dot">●</span>}
                </Link>
            )}

            {/* Submenu */}
            {subItems && isOpen && (
                <div className="stitch-submenu">
                    {subItems.map(sub => (
                        sub.external ? (
                            <a
                                key={sub.path}
                                href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/', '') : ''}/db/sync.php`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={onClose}
                                className="stitch-submenu-item"
                            >
                                <span className="sub-bullet">•</span>
                                <span>{sub.label}</span>
                            </a>
                        ) : (
                            <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={onClose}
                                className={`stitch-submenu-item ${location.pathname === sub.path ? 'active' : ''}`}
                            >
                                <span className="sub-bullet">•</span>
                                <span>{sub.label}</span>
                            </Link>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState(null);
    const { user, logout } = useAuth();

    const displayName = user?.full_name || user?.profile?.full_name || user?.firstname || user?.first_name || user?.username || 'James K.';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const rawPhoto = user?.photo || user?.profile?.avatar || user?.profile_picture || user?.avatar;
    const avatarUrl = getMediaUrl(rawPhoto);
    const userRole = user?.is_staff ? 'Administrator' : (user?.profile?.role || user?.employment_status || 'Cell Overseer');

    const hasAdminAccess = Boolean(
        user?.is_superuser ||
        user?.is_staff ||
        user?.role === 'Super Admin' ||
        user?.role === 'Administrator' ||
        user?.role === 'Admin' ||
        user?.roles?.some(r => r.id === 'superuser' || r.id === 'admin' || r.name?.toLowerCase().includes('admin')) ||
        user?.permissions?.includes('admin') ||
        user?.permissions?.includes('manage_users')
    );

    const toggleMenu = (path) => {
        setOpenMenu(openMenu === path ? null : path);
    };

    // Primary Stitch Navigation items matching mockup
    const primaryNav = [
        { icon: Icons.Dashboard, label: 'Dashboard', path: '/portal/dashboard' },
        { icon: Icons.Calendar, label: 'Calendar & Events', path: '/portal/calendar' },
        {
            icon: Icons.Cells,
            label: 'Follow up & Cells',
            path: '/portal/cell-management',
            badge: '6 cells',
            subItems: [
                { label: 'Cells Directory', path: '/portal/cells' },
                { label: 'Assign Members', path: '/portal/cells/assign' },
                { label: 'Cell Attendance', path: '/portal/cells/attendance' },
                { label: 'Cell Analytics', path: '/portal/cells/analytics' },
                { label: 'Follow-Ups Log', path: '/portal/followups' },
                { label: 'My Personal Cell', path: '/portal/my-cell' }
            ]
        },
        { icon: Icons.Members, label: 'Members Directory', path: '/portal/members', badge: '518' },
        {
            icon: Icons.Meetings,
            label: 'Meetings & Services',
            path: '/portal/meetings-module',
            subItems: [
                { label: 'All Meetings', path: '/portal/meetings' },
                { label: 'Events Hub', path: '/portal/meetings/events' },
                { label: 'Event Attendance', path: '/portal/meetings/event-attendance' },
                { label: 'Event Schedule', path: '/portal/meetings/event-schedule' },
                { label: 'Event Budget', path: '/portal/meetings/event-budget' },
                { label: 'General Attendance', path: '/portal/meetings/attendance' }
            ]
        },
        {
            icon: Icons.Contributions,
            label: 'Contributions & Giving',
            path: '/portal/finance-module',
            badge: '267k',
            subItems: [
                { label: 'Giving Overview', path: '/portal/finance' },
                { label: 'Contributions', path: '/portal/finance/contributions' },
                { label: 'Pledges & Partners', path: '/portal/finance/pledges' },
                { label: 'Budgets', path: '/portal/finance/budgets' },
                { label: 'Finance Settings', path: '/portal/finance/settings' }
            ]
        },
        {
            icon: Icons.Devotionals,
            label: 'Devotionals & Media',
            path: '/portal/media-module',
            subItems: [
                { label: 'Daily Devotionals', path: '/portal/devotionals' },
                { label: 'Media & Sermons', path: '/portal/media' },
                { label: 'Watch Live', path: '/portal/watch' }
            ]
        },
        { icon: Icons.SoulWinning, label: 'Soul Winning', path: '/portal/evangelism' },
        {
            icon: Icons.Analytics,
            label: 'Reports & Analytics',
            path: '/portal/accounting-module',
            subItems: [
                { label: 'General Ledger', path: '/portal/accounting/general-ledger' },
                { label: 'Income Statement', path: '/portal/accounting/income-statement' },
                { label: 'Balance Sheet', path: '/portal/accounting/balance-sheet' },
                { label: 'Audit Log', path: '/portal/accounting/audit-log' }
            ]
        },
        ...(hasAdminAccess ? [{
            icon: Icons.Users,
            label: 'Users & Permissions',
            path: '/portal/users',
            badge: 'Admin'
        }] : [])
    ];

    return (
        <aside className={`stitch-sidebar ${isOpen ? 'mobile-visible' : ''}`}>
            {/* Top Branding */}
            <div className="stitch-brand-header">
                <div className="stitch-brand-left">
                    <div className="stitch-logo-box">
                        <img src="/favicon.ico" alt="JEN" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="stitch-brand-titles">
                        <span className="brand-main">Jesus Enthroned</span>
                        <span className="brand-sub">NETWORK PORTAL</span>
                    </div>
                </div>
                <button className="stitch-close-btn" onClick={onClose} aria-label="Close sidebar">
                    <Icons.Close />
                </button>
            </div>

            {/* Quick Action Pill Button */}
            <div className="stitch-quick-action-wrap">
                <Link to="/portal/members" className="stitch-quick-action-btn" onClick={onClose}>
                    <Icons.Plus />
                    <span>Quick Action</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="stitch-nav-scroll">
                {primaryNav.map((item) => (
                    <SidebarItem
                        key={item.path}
                        {...item}
                        active={location.pathname === item.path || (item.path !== '/portal/dashboard' && location.pathname.startsWith(item.path))}
                        isOpen={openMenu === item.path}
                        onToggle={() => toggleMenu(item.path)}
                        onClose={onClose}
                    />
                ))}
            </nav>

            {/* Bottom Utilities & Usage */}
            <div className="stitch-sidebar-bottom">
                <div className="stitch-db-usage">
                    <div className="db-usage-labels">
                        <span>Database Usage</span>
                        <span className="usage-pct">42% utilized</span>
                    </div>
                    <div className="db-progress-track">
                        <div className="db-progress-bar" style={{ width: '42%' }}></div>
                    </div>
                </div>

                <div className="stitch-bottom-links">
                    <Link to="/portal/help" className="stitch-bottom-link" onClick={onClose}>
                        <Icons.Help />
                        <span>Help Center</span>
                    </Link>
                    <Link to="/portal/users/account" className="stitch-bottom-link" onClick={onClose}>
                        <Icons.Settings />
                        <span>Settings</span>
                    </Link>
                </div>

                {/* User Profile Footer */}
                <div className="stitch-user-bar">
                    <Link
                        to="/portal/users/account"
                        onClick={onClose}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0, overflow: 'hidden' }}
                        title="View & Edit My Profile"
                    >
                        <div className="stitch-user-avatar" style={{ backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none' }}>
                            {!avatarUrl && initials}
                        </div>
                        <div className="stitch-user-meta" style={{ minWidth: 0 }}>
                            <span className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{displayName}</span>
                            <span className="user-role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{userRole}</span>
                        </div>
                    </Link>
                    <button className="stitch-logout-btn" onClick={logout} title="Sign Out">
                        <Icons.Logout />
                    </button>
                </div>
            </div>

            <style>{`
                .stitch-sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 260px;
                    background: #0d0a1a;
                    color: #ffffff;
                    display: flex;
                    flex-direction: column;
                    z-index: 1050;
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    font-family: inherit;
                }

                .stitch-brand-header {
                    padding: 1.25rem 1.25rem 0.75rem 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .stitch-brand-left {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .stitch-logo-box {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #22c1e6 0%, #1e40af 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .stitch-logo-box img {
                    width: 22px;
                    height: 22px;
                    object-fit: contain;
                }
                .stitch-brand-titles {
                    display: flex;
                    flex-direction: column;
                }
                .brand-main {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #ffffff;
                    line-height: 1.15;
                    letter-spacing: -0.01em;
                }
                .brand-sub {
                    font-size: 0.62rem;
                    font-weight: 700;
                    color: #22c1e6;
                    letter-spacing: 0.1em;
                    margin-top: 1px;
                }
                .stitch-close-btn {
                    display: none;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0.25rem;
                }

                /* Quick Action Button */
                .stitch-quick-action-wrap {
                    padding: 0.5rem 1.25rem 0.75rem 1.25rem;
                }
                .stitch-quick-action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.45rem;
                    width: 100%;
                    padding: 0.55rem 1rem;
                    border-radius: 9999px;
                    background: #ffffff;
                    color: #0d0a1a;
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-decoration: none;
                    transition: all 0.15s ease;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                }
                .stitch-quick-action-btn:hover {
                    background: #f1f5f9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(34, 193, 230, 0.2);
                }

                /* Nav Items */
                .stitch-nav-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.25rem 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255,255,255,0.1) transparent;
                }
                .stitch-nav-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .stitch-nav-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                }

                .stitch-nav-item-wrap {
                    position: relative;
                }
                .stitch-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.55rem 0.85rem;
                    border-radius: 0.65rem;
                    color: #94a3b8;
                    text-decoration: none;
                    font-size: 0.84rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    position: relative;
                }
                .stitch-nav-item:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.05);
                }
                .stitch-nav-item.active {
                    color: #ffffff;
                    background: rgba(34, 193, 230, 0.14);
                    font-weight: 600;
                }
                .stitch-nav-item.active .stitch-nav-icon {
                    color: #22c1e6;
                }
                .stitch-nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    transition: color 0.15s;
                    flex-shrink: 0;
                }
                .stitch-nav-item:hover .stitch-nav-icon {
                    color: #e2e8f0;
                }
                .stitch-nav-label {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .stitch-nav-badge {
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.15rem 0.5rem;
                    border-radius: 9999px;
                    background: rgba(255, 255, 255, 0.08);
                    color: #cbd5e1;
                    letter-spacing: 0.01em;
                }
                .stitch-active-dot {
                    color: #22c1e6;
                    font-size: 0.7rem;
                    margin-left: 0.25rem;
                }
                .stitch-chevron {
                    color: #64748b;
                    transition: transform 0.2s;
                    display: flex;
                    align-items: center;
                }
                .stitch-chevron.open {
                    transform: rotate(180deg);
                }

                /* Submenu */
                .stitch-submenu {
                    margin-left: 1.75rem;
                    padding-left: 0.75rem;
                    border-left: 1px solid rgba(255,255,255,0.08);
                    margin-top: 0.2rem;
                    margin-bottom: 0.35rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .stitch-submenu-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.35rem 0.5rem;
                    color: #94a3b8;
                    text-decoration: none;
                    font-size: 0.78rem;
                    border-radius: 0.35rem;
                    transition: color 0.15s;
                }
                .stitch-submenu-item:hover {
                    color: #ffffff;
                }
                .stitch-submenu-item.active {
                    color: #22c1e6;
                    font-weight: 600;
                }
                .sub-bullet {
                    font-size: 0.9rem;
                    opacity: 0.4;
                }

                /* Bottom Section */
                .stitch-sidebar-bottom {
                    padding: 0.75rem 1rem 1rem 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .stitch-db-usage {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 0.55rem;
                    padding: 0.55rem 0.75rem;
                }
                .db-usage-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.68rem;
                    color: #94a3b8;
                    margin-bottom: 0.35rem;
                }
                .usage-pct {
                    color: #22c1e6;
                    font-weight: 600;
                }
                .db-progress-track {
                    height: 4px;
                    border-radius: 2px;
                    background: rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }
                .db-progress-bar {
                    height: 100%;
                    border-radius: 2px;
                    background: linear-gradient(90deg, #22c1e6, #3b82f6);
                }

                .stitch-bottom-links {
                    display: flex;
                    justify-content: space-between;
                    gap: 0.5rem;
                }
                .stitch-bottom-link {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: #94a3b8;
                    text-decoration: none;
                    font-size: 0.75rem;
                    padding: 0.3rem 0.4rem;
                    border-radius: 0.35rem;
                    transition: color 0.15s;
                }
                .stitch-bottom-link:hover {
                    color: #ffffff;
                }

                /* User Profile */
                .stitch-user-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }
                .stitch-user-avatar {
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
                    flex-shrink: 0;
                }
                .stitch-user-meta {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                }
                .user-name {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #ffffff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .user-role {
                    font-size: 0.68rem;
                    color: #94a3b8;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .stitch-logout-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 0.35rem;
                    border-radius: 0.35rem;
                    display: flex;
                    align-items: center;
                    transition: all 0.15s;
                }
                .stitch-logout-btn:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                @media (max-width: 968px) {
                    .stitch-sidebar {
                        transform: translateX(-100%);
                    }
                    .stitch-sidebar.mobile-visible {
                        transform: translateX(0);
                    }
                    .stitch-close-btn {
                        display: block;
                    }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
