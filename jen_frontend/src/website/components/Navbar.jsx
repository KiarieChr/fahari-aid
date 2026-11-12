import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronDown,
    Menu,
    X,
    Heart,
    BookOpen,
    Users,
    Calendar,
    ShoppingBag,
    Radio,
    FileText,
    Sparkles,
    Phone,
    Info,
    Home,
    Layers,
    Share2,
    Compass
} from 'lucide-react';
import '../styles/index.css';
import '../styles/navbar.css';

const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(null);

    // Scroll listener for elevation effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
        setOpenAccordion(null);
    }, [location.pathname]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileOpen]);

    const navItems = [
        { path: '/', label: 'Home' },
        {
            label: 'About Us',
            id: 'about',
            dropdown: [
                { path: '/about', label: 'Our Story & Vision', desc: 'Who we are, mandate, and core foundational beliefs', icon: <Info size={18} /> },
                { path: '/about#team', label: 'Council & Leadership', desc: 'Meet our servant leadership and advisory council', icon: <Users size={18} /> },
                { path: '/#spheres', label: '7 Spheres of Influence', desc: 'Transforming governance, media, business, family & arts', icon: <Compass size={18} /> },
                { path: '/contact', label: 'Get in Touch', desc: 'Connect directly with our liaison and pastoral office', icon: <Phone size={18} /> },
            ]
        },
        {
            label: 'Media & Teachings',
            id: 'media',
            dropdown: [
                { path: '/sermons', label: 'Sermons & Broadcasts', desc: 'Watch and listen to prophetic & apostolic teachings', icon: <Radio size={18} /> },
                { path: '/devotionals', label: 'Daily Devotionals', desc: 'Scripture revelations and morning devotional guides', icon: <BookOpen size={18} /> },
                { path: '/talks', label: 'Kingdom Talks', desc: 'Practical roundtables on societal transformation', icon: <Sparkles size={18} /> },
                { path: '/blogs', label: 'Articles & Insights', desc: 'Thought leadership on ethics, economics, and faith', icon: <FileText size={18} /> },
            ]
        },
        {
            label: 'Connect',
            id: 'connect',
            dropdown: [
                { path: '/membership', label: 'Membership Pathway', desc: 'Walk the pathway to covenant kingdom partnership', icon: <Users size={18} /> },
                { path: '/cells', label: 'Chapters & Cell Fellowships', desc: 'Find local chapters, assemblies, and home cells', icon: <Layers size={18} /> },
                { path: '/dockets', label: 'Ministries & Dockets', desc: 'Serve across operational dockets and global arms', icon: <Share2 size={18} /> },
            ]
        },
        { path: '/events', label: 'Events' },
        { path: '/merchandise', label: 'Store' },
        { path: '/partners', label: 'Partners' },
    ];

    const toggleAccordion = (id) => {
        setOpenAccordion(prev => prev === id ? null : id);
    };

    return (
        <>
            <header className={`main-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container navbar-inner">
                    {/* Brand */}
                    <Link to="/" className="nav-brand">
                        <img
                            src="/favicon.ico"
                            alt="Jesus Enthroned Network Logo"
                            className="nav-brand-logo"
                        />
                        <div>
                            <div className="nav-brand-title">Jesus Enthroned</div>
                            <div className="nav-brand-subtitle">NETWORK</div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-menu-desktop" aria-label="Main Navigation">
                        {navItems.map((item) => {
                            if (item.dropdown) {
                                const isGroupActive = item.dropdown.some(d => location.pathname === d.path);
                                return (
                                    <div key={item.label} className="nav-dropdown-group">
                                        <button
                                            type="button"
                                            className={`nav-item-link ${isGroupActive ? 'active' : ''}`}
                                            aria-expanded="false"
                                        >
                                            <span>{item.label}</span>
                                            <ChevronDown size={14} className="dropdown-chevron" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div className="dropdown-popover">
                                            {item.dropdown.map((sub) => (
                                                <Link
                                                    key={sub.path}
                                                    to={sub.path}
                                                    className="dropdown-item"
                                                >
                                                    <div className="dropdown-icon-box">
                                                        {sub.icon}
                                                    </div>
                                                    <div>
                                                        <span className="dropdown-title">{sub.label}</span>
                                                        <span className="dropdown-desc">{sub.desc}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-item-link ${isActive ? 'active' : ''}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="nav-actions-desktop">
                        <Link to="/give" className="btn btn-outline" style={{ gap: '0.4rem', padding: '0.55rem 1.15rem' }}>
                            <Heart size={15} style={{ color: '#f43f5e' }} fill="#f43f5e" />
                            <span>Give</span>
                        </Link>
                        <Link to="/portal" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                            <span>Portal</span>
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        className="mobile-nav-toggle"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open mobile navigation menu"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </header>

            {/* Mobile Slide-Over Drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="mobile-drawer-backdrop"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                    <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
                        {/* Drawer Header */}
                        <div className="mobile-drawer-header">
                            <Link to="/" className="nav-brand" onClick={() => setMobileOpen(false)}>
                                <img src="/favicon.ico" alt="Logo" className="nav-brand-logo" style={{ width: '36px', height: '36px' }} />
                                <div>
                                    <div className="nav-brand-title" style={{ fontSize: '0.85rem' }}>Jesus Enthroned</div>
                                    <div className="nav-brand-subtitle" style={{ fontSize: '0.6rem' }}>NETWORK</div>
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                style={{ color: 'var(--text-muted)', padding: '0.4rem', cursor: 'pointer' }}
                                aria-label="Close menu"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <div className="mobile-drawer-body">
                            {navItems.map((item) => {
                                if (item.dropdown) {
                                    const isOpen = openAccordion === item.id;
                                    const isGroupActive = item.dropdown.some(d => location.pathname === d.path);
                                    return (
                                        <div key={item.label}>
                                            <button
                                                type="button"
                                                className={`mobile-nav-link ${isGroupActive ? 'active' : ''}`}
                                                onClick={() => toggleAccordion(item.id)}
                                                style={{ width: '100%', cursor: 'pointer' }}
                                            >
                                                <span>{item.label}</span>
                                                <ChevronDown
                                                    size={16}
                                                    style={{
                                                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                />
                                            </button>

                                            {isOpen && (
                                                <div className="mobile-sub-accordion">
                                                    {item.dropdown.map((sub) => (
                                                        <Link
                                                            key={sub.path}
                                                            to={sub.path}
                                                            className={`mobile-sub-link ${location.pathname === sub.path ? 'active' : ''}`}
                                                            onClick={() => setMobileOpen(false)}
                                                        >
                                                            <span style={{ color: 'var(--primary)' }}>{sub.icon}</span>
                                                            <span>{sub.label}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Drawer Actions */}
                        <div className="mobile-drawer-footer">
                            <Link
                                to="/give"
                                className="btn btn-gold"
                                onClick={() => setMobileOpen(false)}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <Heart size={16} fill="#0b0813" />
                                <span>Support / Give</span>
                            </Link>
                            <Link
                                to="/portal"
                                className="btn btn-primary"
                                onClick={() => setMobileOpen(false)}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <span>Member Portal</span>
                            </Link>
                        </div>
                    </aside>
                </>
            )}
        </>
    );
};

export default Navbar;
