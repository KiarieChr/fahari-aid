import React, { useState, useContext } from 'react';
import MediaStatsCards from '../components/media/MediaStatsCards';
import LatestSermonHero from '../components/media/LatestSermonHero';
import AudioSermons from './AudioSermons';
import VideoSermons from './VideoSermons';
import PhotoGallery from './PhotoGallery';
import QuickAccessCards from '../components/media/QuickAccessCards';
import UploadAudioModal from '../components/media/UploadAudioModal';
import UploadVideoModal from '../components/media/UploadVideoModal';
import UploadPhotosModal from '../components/media/UploadPhotosModal';
import { ThemeContext } from '../../context/ThemeContext';

const MediaDashboard = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isUploadAudioModalOpen, setIsUploadAudioModalOpen] = useState(false);
    const [isUploadVideoModalOpen, setIsUploadVideoModalOpen] = useState(false);
    const [isUploadPhotosModalOpen, setIsUploadPhotosModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = (targetTab) => {
        setRefreshKey(k => k + 1);
        if (targetTab) setActiveTab(targetTab);
    };

    return (
        <div className="stitch-media-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Devotionals & Media</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Broadcast & Media Center</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Sync live</span>
                    <span className="sync-sep">•</span>
                    <span>Updated just now</span>
                    <button className="sync-refresh-btn" onClick={() => setRefreshKey(k => k + 1)} title="Refresh media library">
                        ⟳
                    </button>
                </div>
            </div>

            {/* Action Bar & Tabs */}
            <div className="stitch-action-bar">
                <div className="actions-left">
                    <div className="stitch-tabs-pills" style={{
                        background: isDark ? '#1a1625' : '#ffffff',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
                    }}>
                        {[
                            { id: 'dashboard', label: 'Media Dashboard' },
                            { id: 'audio', label: 'Audio Sermons' },
                            { id: 'video', label: 'Video Broadcasts' },
                            { id: 'photos', label: 'Photo Vault' },
                            { id: 'management', label: 'Content Studio' }
                        ].map(t => (
                            <button
                                key={t.id}
                                className={`stitch-tab-pill ${activeTab === t.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.id)}
                                style={{
                                    color: activeTab === t.id ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="actions-right">
                    <button
                        className="stitch-primary-btn"
                        onClick={() => setIsUploadVideoModalOpen(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Add New Media</span>
                    </button>
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <>
                    <LatestSermonHero key={`hero-${refreshKey}`} />
                    <MediaStatsCards key={`stats-${refreshKey}`} />
                    <QuickAccessCards onNavigate={setActiveTab} />
                </>
            )}

            {activeTab === 'audio' && <AudioSermons key={`audio-${refreshKey}`} />}
            {activeTab === 'video' && <VideoSermons key={`video-${refreshKey}`} />}
            {activeTab === 'photos' && <PhotoGallery key={`photos-${refreshKey}`} />}

            {activeTab === 'management' && (
                <div className="stitch-card-wrapper" style={{
                    padding: '3.5rem 2rem',
                    textAlign: 'center',
                    background: isDark ? '#1a1625' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
                }}>
                    <div className="empty-icon-wrap" style={{
                        margin: '0 auto 1.25rem auto',
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: '0 0 0.5rem 0' }}>
                        Broadcast & Content Studio Management
                    </h3>
                    <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', maxWidth: '520px', margin: '0 auto 2.25rem auto', lineHeight: 1.6 }}>
                        Centralized studio controls to upload high-fidelity audio mp3s, embed live video streams, and synchronize celebration photo archives.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setIsUploadAudioModalOpen(true)}
                            className="stitch-primary-btn"
                        >
                            + Upload Audio Sermon
                        </button>
                        <button
                            onClick={() => setIsUploadVideoModalOpen(true)}
                            className="stitch-action-button"
                            style={{
                                padding: '0.6rem 1.25rem',
                                fontSize: '0.8125rem',
                                background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                color: isDark ? '#ffffff' : '#0f172a',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
                            }}
                        >
                            + Add Video Broadcast
                        </button>
                        <button
                            onClick={() => setIsUploadPhotosModalOpen(true)}
                            className="stitch-action-button"
                            style={{
                                padding: '0.6rem 1.25rem',
                                fontSize: '0.8125rem',
                                background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                color: isDark ? '#ffffff' : '#0f172a',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
                            }}
                        >
                            + Create Photo Vault
                        </button>
                    </div>
                </div>
            )}

            {isUploadAudioModalOpen && (
                <UploadAudioModal
                    onClose={() => setIsUploadAudioModalOpen(false)}
                    onSuccess={() => handleUploadSuccess('audio')}
                />
            )}
            {isUploadVideoModalOpen && (
                <UploadVideoModal
                    onClose={() => setIsUploadVideoModalOpen(false)}
                    onSuccess={() => handleUploadSuccess('video')}
                />
            )}
            {isUploadPhotosModalOpen && (
                <UploadPhotosModal
                    onClose={() => setIsUploadPhotosModalOpen(false)}
                    onSuccess={() => handleUploadSuccess('photos')}
                />
            )}

            <style>{`
                .stitch-media-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding-bottom: 2.5rem;
                }
                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.8125rem;
                    color: #64748b;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                }
                .crumb-segment {
                    color: #64748b;
                }
                .crumb-sep {
                    color: #cbd5e1;
                    font-size: 0.75rem;
                }
                .crumb-current {
                    color: var(--text-color, #0f172a);
                    font-weight: 600;
                }
                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.775rem;
                    color: #64748b;
                }
                .sync-live-dot {
                    color: #22c55e;
                    font-size: 0.75rem;
                }
                .sync-sep {
                    color: #cbd5e1;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #64748b;
                    font-size: 0.95rem;
                    padding: 0 0.2rem;
                    transition: transform 0.2s;
                }
                .sync-refresh-btn:hover {
                    transform: rotate(90deg);
                    color: #0f172a;
                }

                .stitch-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }
                .actions-left {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .actions-right {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .stitch-tabs-pills {
                    display: flex;
                    align-items: center;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.2rem;
                    gap: 0.2rem;
                }
                .stitch-tab-pill {
                    background: transparent;
                    border: none;
                    padding: 0.4rem 0.95rem;
                    font-size: 0.785rem;
                    font-weight: 500;
                    border-radius: 9999px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .stitch-tab-pill.active {
                    background: #2563eb;
                    color: #ffffff !important;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                }

                .stitch-primary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%);
                    color: #ffffff;
                    border: none;
                    border-radius: 9999px;
                    padding: 0.55rem 1.15rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(14, 165, 233, 0.25);
                    transition: transform 0.15s ease;
                }
                .stitch-primary-btn:hover {
                    transform: translateY(-1px);
                }
                .stitch-action-button {
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .stitch-action-button:hover {
                    color: #2563eb !important;
                    border-color: #cbd5e1;
                }
                .stitch-card-wrapper {
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
                }
            `}</style>
        </div>
    );
};

export default MediaDashboard;
