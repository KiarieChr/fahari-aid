import React, { useState, useEffect, useCallback } from 'react';
import { getMeetingTypes } from '../../../services/meetingsApi';
import NewCategoryModal from './NewCategoryModal';

const CATEGORY_STYLES = [
    {
        bg: '#eff6ff',
        color: '#2563eb',
        line: '#3b82f6',
        desc: 'Main congregational service & celebration',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        )
    },
    {
        bg: '#faf5ff',
        color: '#9333ea',
        line: '#a855f7',
        desc: 'Miracle communion & prayer fellowship',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        )
    },
    {
        bg: '#ecfdf5',
        color: '#059669',
        line: '#10b981',
        desc: 'Home-based disciple cell groups',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        )
    },
    {
        bg: '#fffbeb',
        color: '#d97706',
        line: '#f59e0b',
        desc: 'Strategy councils & ministerial staff',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
        )
    },
    {
        bg: '#ecfeff',
        color: '#0891b2',
        line: '#06b6d4',
        desc: 'Specialized ministry workshops & training',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
        )
    },
    {
        bg: '#fdf2f8',
        color: '#db2777',
        line: '#ec4899',
        desc: 'Community evangelism & soul winning',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        )
    }
];

const MeetingCategories = ({ selectedCategory = '', onSelectCategory }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMeetingTypes();
            if (response.success && response.data?.meeting_types) {
                setCategories(response.data.meeting_types);
            } else if (response.data && Array.isArray(response.data)) {
                setCategories(response.data);
            }
        } catch (err) {
            console.error('Error fetching meeting types:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return (
        <div className="stitch-categories-section">
            {/* Header */}
            <div className="categories-header">
                <div className="header-left">
                    <div className="header-icon-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 17 12 22 22 17"></polyline>
                            <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h3 className="categories-title">Meeting Types & Classifications</h3>
                        <p className="categories-subtitle">
                            Official service structures, cell assemblies, and ministry formats
                        </p>
                    </div>
                </div>

                <div className="header-right">
                    {selectedCategory && (
                        <button
                            className="clear-type-filter-btn"
                            onClick={() => onSelectCategory && onSelectCategory('')}
                        >
                            Show All Types
                        </button>
                    )}
                    <button
                        className="add-category-btn"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="categories-loading">
                    <div className="cat-spinner"></div>
                    <span>Loading meeting classifications...</span>
                </div>
            ) : (
                <div className="categories-grid">
                    {categories.map((cat, idx) => {
                        const styleCfg = CATEGORY_STYLES[idx % CATEGORY_STYLES.length];
                        const isSelected = selectedCategory && selectedCategory.toLowerCase() === (cat.name || '').toLowerCase();

                        return (
                            <div
                                key={cat.id || idx}
                                className={`stitch-category-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                                title={`Click to filter sessions by ${cat.name}`}
                            >
                                <div className="card-top">
                                    <div
                                        className="cat-icon-badge"
                                        style={{ background: styleCfg.bg, color: styleCfg.color }}
                                    >
                                        {styleCfg.icon}
                                    </div>
                                    <span
                                        className="session-count-pill"
                                        style={{ background: styleCfg.bg, color: styleCfg.color }}
                                    >
                                        {cat.meeting_count || 0} Sessions
                                    </span>
                                </div>

                                <div className="card-content">
                                    <h4 className="cat-name">{cat.name}</h4>
                                    <p className="cat-desc">{styleCfg.desc}</p>
                                </div>

                                <div className="card-bottom">
                                    <div className="accent-bar" style={{ background: styleCfg.line }}></div>
                                    <span className="filter-action-hint">
                                        {isSelected ? '✓ Filtering sessions' : 'Filter sessions →'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Create New Card */}
                    <div
                        className="stitch-category-create-card"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="create-icon-wrap">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </div>
                        <span className="create-text">New Category</span>
                        <span className="create-sub">Define new meeting type</span>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <NewCategoryModal
                    onClose={() => setIsModalOpen(false)}
                    onCreated={() => {
                        setIsModalOpen(false);
                        fetchCategories();
                    }}
                />
            )}

            <style>{`
                .stitch-categories-section {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.35rem 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    margin-bottom: 2rem;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .stitch-categories-section {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .categories-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .categories-header {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .header-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 9px;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .portal-wrapper.dark-mode .header-icon-wrap {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }

                .categories-title {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }
                .portal-wrapper.dark-mode .categories-title {
                    color: #ffffff;
                }
                .categories-subtitle {
                    margin: 0.15rem 0 0 0;
                    font-size: 0.75rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .categories-subtitle {
                    color: #94a3b8;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .clear-type-filter-btn {
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.4rem 0.75rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .clear-type-filter-btn:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .clear-type-filter-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }

                .add-category-btn {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.45rem 0.85rem;
                    font-size: 0.78rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    cursor: pointer;
                    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
                    transition: background 0.15s, transform 0.1s;
                }
                .add-category-btn:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                }

                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 1rem;
                }

                .stitch-category-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.85rem;
                    padding: 1.1rem 1.15rem 0.95rem 1.15rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 140px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    position: relative;
                }
                .portal-wrapper.dark-mode .stitch-category-card {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.06);
                }
                .stitch-category-card:hover {
                    transform: translateY(-2px);
                    background: #ffffff;
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .portal-wrapper.dark-mode .stitch-category-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .stitch-category-card.selected {
                    border-color: #2563eb;
                    background: #ffffff;
                    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
                }
                .portal-wrapper.dark-mode .stitch-category-card.selected {
                    background: rgba(37, 99, 235, 0.1);
                    border-color: #3b82f6;
                }

                .card-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.65rem;
                }
                .cat-icon-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .session-count-pill {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }

                .card-content {
                    margin-bottom: 0.75rem;
                }
                .cat-name {
                    margin: 0;
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.3;
                }
                .portal-wrapper.dark-mode .cat-name {
                    color: #ffffff;
                }
                .cat-desc {
                    margin: 0.25rem 0 0 0;
                    font-size: 0.72rem;
                    color: #64748b;
                    line-height: 1.35;
                }
                .portal-wrapper.dark-mode .cat-desc {
                    color: #94a3b8;
                }

                .card-bottom {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .accent-bar {
                    height: 2.5px;
                    border-radius: 2px;
                    width: 100%;
                    opacity: 0.75;
                }
                .filter-action-hint {
                    font-size: 0.68rem;
                    font-weight: 600;
                    color: #2563eb;
                    align-self: flex-end;
                }
                .portal-wrapper.dark-mode .filter-action-hint {
                    color: #60a5fa;
                }

                /* Create Card */
                .stitch-category-create-card {
                    border: 1.5px dashed #cbd5e1;
                    border-radius: 0.85rem;
                    padding: 1.5rem 1rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    cursor: pointer;
                    transition: all 0.15s;
                    min-height: 140px;
                    background: transparent;
                }
                .portal-wrapper.dark-mode .stitch-category-create-card {
                    border-color: rgba(255, 255, 255, 0.15);
                }
                .stitch-category-create-card:hover {
                    background: #f8fafc;
                    border-color: #2563eb;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .stitch-category-create-card:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: #60a5fa;
                }
                .create-icon-wrap {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .portal-wrapper.dark-mode .create-icon-wrap {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }
                .create-text {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .create-text {
                    color: #ffffff;
                }
                .create-sub {
                    font-size: 0.7rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .create-sub {
                    color: #94a3b8;
                }

                .categories-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.65rem;
                    padding: 2.5rem;
                    color: #64748b;
                    font-size: 0.82rem;
                }
                .cat-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e2e8f0;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default MeetingCategories;
