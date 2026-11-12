import React from 'react';

const DashboardTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'dashboard', label: 'My Dashboard', icon: '🎛️' },
        { id: 'cell', label: 'My Cell', icon: '👥' },
        { id: 'partnership', label: 'My Partnership', icon: '🤝' },
        { id: 'birthday', label: 'My Birthday', icon: '🎂' },
        { id: 'upcoming', label: 'Upcoming Birthdays', count: 2, icon: '🎁' },
    ];

    return (
        <div className="stitch-tabs-bar">
            {/* Left: Tab buttons */}
            <div className="stitch-tabs-list">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`stitch-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <span>{tab.label}</span>
                        {tab.id === 'dashboard' && activeTab === 'dashboard' && (
                            <span className="stitch-tab-dot">●</span>
                        )}
                        {tab.count && (
                            <span className="stitch-tab-counter">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Right: View mode controls */}
            <div className="stitch-view-toggles">
                <button className="view-toggle-btn active" title="Grid View">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                        <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                        <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                        <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                    </svg>
                </button>
                <button className="view-toggle-btn" title="List View">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
            </div>

            <style>{`
                .stitch-tabs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: transparent;
                    border-bottom: 1px solid #e2e8f0;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.25rem;
                    gap: 1rem;
                    overflow-x: auto;
                }
                .portal-wrapper.dark-mode .stitch-tabs-bar {
                    border-bottom-color: rgba(255, 255, 255, 0.08);
                }

                .stitch-tabs-list {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    overflow-x: auto;
                    scrollbar-width: none;
                }
                .stitch-tabs-list::-webkit-scrollbar {
                    display: none;
                }

                .stitch-tab-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.6rem 0.95rem;
                    border-radius: 9999px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-size: 0.84rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s ease;
                }
                .portal-wrapper.dark-mode .stitch-tab-btn {
                    color: #94a3b8;
                }
                .stitch-tab-btn:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }
                .portal-wrapper.dark-mode .stitch-tab-btn:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.06);
                }

                .stitch-tab-btn.active {
                    background: #eff6ff;
                    color: #2563eb;
                    font-weight: 600;
                }
                .portal-wrapper.dark-mode .stitch-tab-btn.active {
                    background: rgba(34, 193, 230, 0.12);
                    color: #22c1e6;
                }

                .stitch-tab-dot {
                    font-size: 0.65rem;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .stitch-tab-dot {
                    color: #22c1e6;
                }

                .stitch-tab-counter {
                    background: #ef4444;
                    color: #ffffff;
                    font-size: 0.65rem;
                    font-weight: 700;
                    min-width: 16px;
                    height: 16px;
                    border-radius: 9999px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                }

                .stitch-view-toggles {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    padding: 0.2rem;
                }
                .portal-wrapper.dark-mode .stitch-view-toggles {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .view-toggle-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    width: 28px;
                    height: 28px;
                    border-radius: 0.35rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .view-toggle-btn:hover {
                    color: #0f172a;
                }
                .view-toggle-btn.active {
                    background: #ffffff;
                    color: #2563eb;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
                }
                .portal-wrapper.dark-mode .view-toggle-btn.active {
                    background: rgba(255, 255, 255, 0.1);
                    color: #22c1e6;
                }

                @media (max-width: 640px) {
                    .stitch-view-toggles {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default DashboardTabs;
