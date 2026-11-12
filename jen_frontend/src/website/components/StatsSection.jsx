import React from 'react';
import { Users, BookOpen, Headphones, ShieldAlert, Heart, Clock, Layers } from 'lucide-react';

const StatsSection = () => {
    const stats = [
        { 
            label: 'Members', 
            value: '232', 
            icon: <Users size={24} style={{ color: 'var(--primary, #22c1e6)' }} />, 
            subtext: 'Active community leaders' 
        },
        { 
            label: 'Resources', 
            value: '521', 
            icon: <BookOpen size={24} style={{ color: '#ee6c20' }} />, 
            subtext: 'Curriculums & guides shared' 
        },
        { 
            label: 'Hours of Teachings', 
            value: '1,463', 
            icon: <Clock size={24} style={{ color: '#15be56' }} />, 
            subtext: 'Audio & video archives' 
        },
        { 
            label: 'Ministries', 
            value: '15', 
            icon: <Layers size={24} style={{ color: '#bb0852' }} />, 
            subtext: 'Dedicated arms of influence' 
        }
    ];

    return (
        <section className="stats-section">
            <div className="container stats-container">
                {/* Header Context for NGO credibility */}
                <div className="stats-header">
                    <div className="stats-eyebrow">Our Global Impact</div>
                    <h2 className="stats-title">Measurable Outcomes in Transforming Society</h2>
                    <p className="stats-subtitle">
                        Through targeted programs, small fellowship cells, and leadership training, we monitor real growth and structural change in every mountain of influence.
                    </p>
                </div>

                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            {/* Glowing Icon Container */}
                            <div className="stat-icon-wrapper">
                                {stat.icon}
                            </div>
                            
                            {/* Stat Value */}
                            <div className="stat-value">
                                {stat.value}
                            </div>
                            
                            {/* Label & Context */}
                            <div className="stat-label">
                                {stat.label}
                            </div>
                            <div className="stat-subtext">
                                {stat.subtext}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .stats-section {
                    padding: 80px 0;
                    background: linear-gradient(180deg, #120D20 0%, #171228 100%);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    position: relative;
                }

                .stats-container {
                    width: 100%;
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 0 3%;
                }

                .stats-header {
                    text-align: center;
                    max-width: 700px;
                    margin: 0 auto 56px;
                }

                .stats-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                .stats-title {
                    font-family: 'Onest', 'Montserrat', 'Inter', sans-serif;
                    font-size: clamp(1.8rem, 2.5vw, 2.3rem);
                    font-weight: 800;
                    color: white;
                    line-height: 1.25;
                    margin-bottom: 16px;
                }

                .stats-subtitle {
                    font-size: 15px;
                    color: var(--text-muted, #94a3b8);
                    line-height: 1.6;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 24px;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 16px;
                    padding: 36px 28px;
                    text-align: center;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(34, 193, 230, 0.3);
                    box-shadow: 0 12px 40px rgba(34, 193, 230, 0.08);
                }

                .stat-icon-wrapper {
                    width: 56px;
                    height: 56px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    transition: all 0.3s ease;
                }

                .stat-card:hover .stat-icon-wrapper {
                    background: rgba(255, 255, 255, 0.08);
                    transform: scale(1.08);
                }

                .stat-value {
                    font-family: 'Onest', 'Montserrat', 'Inter', sans-serif;
                    font-size: 2.8rem;
                    font-weight: 800;
                    color: white;
                    line-height: 1.1;
                    margin-bottom: 8px;
                    letter-spacing: -0.01em;
                }

                .stat-label {
                    color: white;
                    font-size: 13.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 4px;
                }

                .stat-subtext {
                    color: var(--text-muted, #94a3b8);
                    font-size: 13px;
                    font-weight: 400;
                    line-height: 1.4;
                }

                @media (max-width: 768px) {
                    .stats-header {
                        padding: 0 1rem;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </section>
    );
};

export default StatsSection;
