import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ThemeContext } from '../../context/ThemeContext';

const PortalLayout = () => {
    const { theme } = useContext(ThemeContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    const isLight = theme === 'light';

    return (
        <div className={`portal-wrapper ${isLight ? 'light-mode' : 'dark-mode'}`}>
            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            {/* Main Content Area */}
            <div className="portal-main">
                <TopBar onToggleSidebar={toggleSidebar} />

                <main className="portal-content">
                    <Outlet />
                </main>
            </div>

            <style>{`
                .portal-wrapper {
                    display: flex;
                    min-height: 100vh;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    background: #f8fafc;
                    color: #0f172a;
                    transition: background 0.2s ease, color 0.2s ease;
                }

                /* Light Mode */
                .portal-wrapper.light-mode {
                    background: #f8fafc;
                    color: #0f172a;
                }
                .portal-wrapper.light-mode .portal-main {
                    background: #f8fafc;
                }
                .portal-wrapper.light-mode .portal-content {
                    background: #f8fafc;
                }

                /* Dark Mode */
                .portal-wrapper.dark-mode {
                    background: #0f0c1b;
                    color: #f8fafc;
                }
                .portal-wrapper.dark-mode .portal-main {
                    background: #0f0c1b;
                }
                .portal-wrapper.dark-mode .portal-content {
                    background: #0f0c1b;
                }

                .sidebar-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(13, 10, 26, 0.6);
                    z-index: 1040;
                    backdrop-filter: blur(4px);
                }

                .portal-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    margin-left: 260px;
                    min-height: 100vh;
                    max-width: calc(100vw - 260px);
                    transition: margin-left 0.25s ease;
                }

                .portal-content {
                    flex: 1;
                    padding: 1.5rem 2rem 2.5rem 2rem;
                    overflow-y: auto;
                }

                /* Responsive */
                @media (max-width: 968px) {
                    .portal-main {
                        margin-left: 0 !important;
                        max-width: 100vw !important;
                        overflow-x: hidden !important;
                    }
                    .portal-content {
                        padding: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PortalLayout;
