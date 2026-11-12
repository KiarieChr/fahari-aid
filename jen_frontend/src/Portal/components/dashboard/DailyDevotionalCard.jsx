import React from 'react';
import { Link } from 'react-router-dom';

const DailyDevotionalCard = () => {
    return (
        <div className="stitch-devotional-card">
            {/* Header */}
            <div className="devotional-header">
                <div className="devotional-header-left">
                    <span className="devotional-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                    </span>
                    <h3 className="devotional-title">Daily Word & Devotional</h3>
                </div>
                <span className="today-badge">Today</span>
            </div>

            {/* Banner Image Container */}
            <div className="devotional-banner">
                <img
                    src="https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=700&q=80"
                    alt="Devotional Study"
                    className="banner-img"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
                <div className="banner-overlay">
                    <span className="theme-badge">THEME OF THE MONTH</span>
                </div>
            </div>

            {/* Content */}
            <div className="devotional-body">
                <h4 className="study-title">Reigning in Life Through Righteousness</h4>
                <p className="study-verse">
                    "For if by the one man's offense death reigned through the one, much more those who receive abundance of grace and the gift of righteousness will reign in life through the One, Jesus Christ." — Romans 5:17
                </p>

                {/* Footer Controls */}
                <div className="devotional-footer">
                    <div className="read-meta">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>5 min read</span>
                    </div>

                    <div className="footer-actions">
                        <button className="audio-listen-btn" title="Listen to Devotional Audio">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        </button>
                        <Link to="/portal/devotionals" className="read-study-btn">
                            <span>Read Study</span>
                            <span className="arrow">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                .stitch-devotional-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .stitch-devotional-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .devotional-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                .devotional-header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .devotional-icon {
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                }
                .portal-wrapper.dark-mode .devotional-icon {
                    color: #22c1e6;
                }
                .devotional-title {
                    font-size: 1.02rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .devotional-title {
                    color: #ffffff;
                }

                .today-badge {
                    background: #f1f5f9;
                    color: #2563eb;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 0.15rem 0.55rem;
                    border-radius: 9999px;
                }
                .portal-wrapper.dark-mode .today-badge {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }

                .devotional-banner {
                    position: relative;
                    height: 120px;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    background: linear-gradient(135deg, #1e3a8a, #0f172a);
                    margin-bottom: 0.85rem;
                }
                .banner-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.65;
                }
                .banner-overlay {
                    position: absolute;
                    bottom: 0.65rem;
                    left: 0.75rem;
                }
                .theme-badge {
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(4px);
                    color: #22c1e6;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }

                .devotional-body {
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                }
                .study-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    line-height: 1.3;
                }
                .portal-wrapper.dark-mode .study-title {
                    color: #ffffff;
                }

                .study-verse {
                    font-size: 0.76rem;
                    color: #64748b;
                    line-height: 1.45;
                    margin: 0;
                    font-style: italic;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .study-verse {
                    color: #94a3b8;
                }

                .devotional-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 0.65rem;
                    padding-top: 0.65rem;
                    border-top: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .devotional-footer {
                    border-top-color: rgba(255, 255, 255, 0.06);
                }

                .read-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.72rem;
                    color: #94a3b8;
                }

                .footer-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                }
                .audio-listen-btn {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .audio-listen-btn:hover {
                    background: #f1f5f9;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .audio-listen-btn {
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }

                .read-study-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    background: #1e1b4b;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.35rem 0.75rem;
                    border-radius: 9999px;
                    transition: background 0.15s;
                }
                .read-study-btn:hover {
                    background: #2e1065;
                }
                .portal-wrapper.dark-mode .read-study-btn {
                    background: #3b82f6;
                }
            `}</style>
        </div>
    );
};

export default DailyDevotionalCard;

