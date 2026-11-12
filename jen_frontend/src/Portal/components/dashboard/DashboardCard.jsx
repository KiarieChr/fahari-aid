import React, { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

/**
 * Modern Card Component
 * Theme-aware card with light/dark mode support
 */
const DashboardCard = ({
    title,
    subtitle,
    children,
    headerAction,
    className = '',
    noPadding = false,
    minHeight
}) => {
    const { theme } = useContext(ThemeContext);
    const isLight = theme === 'light';

    return (
        <div className={`dashboard-card ${isLight ? 'light' : 'dark'} ${className}`} style={{ minHeight }}>
            {(title || headerAction) && (
                <div className="card-header">
                    <div className="header-text">
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {headerAction && (
                        <div className="header-action">
                            {headerAction}
                        </div>
                    )}
                </div>
            )}
            <div className={`card-body ${noPadding ? 'no-padding' : ''}`}>
                {children}
            </div>

            <style>{`
                .dashboard-card {
                    border-radius: 1rem;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                }
                
                /* Light Mode */
                .dashboard-card.light {
                    background: #ffffff;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
                }
                .dashboard-card.light:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .dashboard-card.light .card-header {
                    border-bottom: 1px solid #f1f5f9;
                }
                .dashboard-card.light .card-title {
                    color: #1e293b;
                }
                .dashboard-card.light .card-subtitle {
                    color: #64748b;
                }

                /* Dark Mode */
                .dashboard-card.dark {
                    background: #1e1b2e;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15);
                }
                .dashboard-card.dark:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                }
                .dashboard-card.dark .card-header {
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .dashboard-card.dark .card-title {
                    color: #ffffff;
                }
                .dashboard-card.dark .card-subtitle {
                    color: rgba(255,255,255,0.6);
                }

                .card-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    padding: 1.25rem 1.5rem;
                    gap: 1rem;
                }

                .header-text {
                    flex: 1;
                }

                .card-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                }

                .card-subtitle {
                    font-size: 0.8rem;
                    margin: 0.25rem 0 0;
                }

                .header-action {
                    flex-shrink: 0;
                }

                .card-body {
                    flex: 1;
                    padding: 1.25rem 1.5rem;
                }

                .card-body.no-padding {
                    padding: 0;
                }

                @media (max-width: 768px) {
                    .card-header {
                        padding: 1rem 1.25rem;
                    }
                    .card-body {
                        padding: 1rem 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

/**
 * Dropdown Select for Card Headers
 */
export const CardDropdown = ({ value, options, onChange }) => {
    const { theme } = useContext(ThemeContext);
    const isLight = theme === 'light';

    return (
        <>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className={`card-dropdown ${isLight ? 'light' : 'dark'}`}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <style>{`
                .card-dropdown {
                    border-radius: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.2s;
                }
                .card-dropdown.light {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #334155;
                }
                .card-dropdown.light:hover,
                .card-dropdown.light:focus {
                    border-color: #5d87ff;
                }
                .card-dropdown.dark {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #ffffff;
                }
                .card-dropdown.dark:hover,
                .card-dropdown.dark:focus {
                    border-color: #5d87ff;
                }
                .card-dropdown:focus {
                    box-shadow: 0 0 0 3px rgba(93, 135, 255, 0.1);
                }
            `}</style>
        </>
    );
};

export default DashboardCard;
