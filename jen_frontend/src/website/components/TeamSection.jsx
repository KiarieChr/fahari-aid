import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL as API_URL } from '../../services/api';

// Helper to get distinct portrait placeholders based on name/role
const getMemberImage = (name, imageUrl) => {
    if (imageUrl) {
        return imageUrl.startsWith('http') ? imageUrl : `${API_URL.replace('api/', '')}${imageUrl}`;
    }
    const lowerName = String(name).toLowerCase();
    if (lowerName.includes('benjamin')) {
        return '/DSC_0166.JPG'; // Benjamin (Director)
    }
    if (lowerName.includes('paul')) {
        return '/DSC_0094.JPG'; // Paul (Deputy Director)
    }
    if (lowerName.includes('naomi')) {
        return '/DSC_0243.JPG'; // Naomi (Executive Secretary)
    }
    if (lowerName.includes('james')) {
        return '/DSC_0071.JPG'; // James (Media Director)
    }
    return '/DSC_0065.JPG';
};

const TeamSection = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await fetch(`${API_URL}get_team.php`);
                const data = await response.json();
                if (data.success) {
                    setTeam(data.data.team || []);
                }
            } catch (err) {
                console.error('Error fetching team:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    if (loading) return null; // Or a skeleton
    if (team.length === 0) return null;

    // Filter duplicates if any (in case of double inserts)
    const uniqueTeam = team.filter((member, index, self) =>
        index === self.findIndex((m) => m.name === member.name && m.role === member.role)
    );

    return (
        <section className="team-section-new">
            {/* Glowing Accent Backgrounds */}
            <div className="team-bg-glow-1"></div>
            <div className="team-bg-glow-2"></div>

            <div className="container">
                <div className="team-section-header">
                    <span className="team-eyebrow">Our Leadership</span>
                    <h2 className="team-title">
                        Our <span>Leadership Structure</span>
                    </h2>
                    <p className="team-subtitle">
                        The dedicated leadership team of Jesus Enthroned Network, aligning sphere authority with Kingdom purpose.
                    </p>
                </div>

                <div className="team-grid">
                    {uniqueTeam.map((member) => (
                        <Link 
                            key={member.id} 
                            to={`/about/team/${member.id}`} 
                            className="team-card-link"
                        >
                            <div className="team-card-new">
                                {/* Frame Container */}
                                <div className="team-img-frame">
                                    <img 
                                        src={getMemberImage(member.name, member.image_url)} 
                                        alt={member.name} 
                                        className="team-member-img"
                                    />
                                    {/* View Info tag overlay */}
                                    <div className="team-card-overlay">
                                        <span>View Bio & Message →</span>
                                    </div>
                                </div>

                                <div className="team-card-content">
                                    <h3 className="team-member-name">
                                        {member.name}
                                    </h3>
                                    <p className="team-member-role">
                                        {member.role}
                                    </p>
                                    
                                    {member.bio && (
                                        <p className="team-member-bio-snippet">
                                            {member.bio.length > 95 ? `${member.bio.substring(0, 95)}...` : member.bio}
                                        </p>
                                    )}

                                    <div className="team-member-action">
                                        <span>Read Profile</span>
                                        <svg viewBox="0 0 14 14" fill="none" className="profile-arrow-icon">
                                            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style>{`
                .team-section-new {
                    padding: 96px 0;
                    background: linear-gradient(180deg, #120D20 0%, #0d0a18 100%);
                    position: relative;
                    overflow: hidden;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .team-bg-glow-1 {
                    position: absolute;
                    top: 20%;
                    left: -10%;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(34, 193, 230, 0.06) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 1;
                }

                .team-bg-glow-2 {
                    position: absolute;
                    bottom: 10%;
                    right: -10%;
                    width: 350px;
                    height: 350px;
                    background: radial-gradient(circle, rgba(239, 243, 193, 0.04) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 1;
                }

                .team-section-header {
                    text-align: center;
                    margin-bottom: 64px;
                    position: relative;
                    z-index: 2;
                }

                .team-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 600;
                    margin-bottom: 16px;
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    font-family: var(--font-sans), sans-serif;
                }

                .team-eyebrow::after {
                    content: '';
                    width: 40px;
                    height: 1.5px;
                    background: var(--primary, #22c1e6);
                }

                .team-title {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: clamp(2rem, 4vw, 3.2rem);
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 16px;
                }

                .team-title span {
                    background: linear-gradient(to right, var(--primary, #22c1e6), var(--secondary, #eff3c1));
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .team-subtitle {
                    font-size: 16px;
                    color: var(--text-muted, #94a3b8);
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.7;
                }

                .team-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 32px;
                    position: relative;
                    z-index: 2;
                }

                .team-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }

                .team-card-new {
                    background: rgba(26, 22, 37, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .team-card-link:hover .team-card-new {
                    transform: translateY(-8px);
                    background: rgba(33, 28, 47, 0.6);
                    border-color: rgba(34, 193, 230, 0.3);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
                }

                .team-img-frame {
                    position: relative;
                    aspect-ratio: 1;
                    width: 180px;
                    height: 180px;
                    margin: 32px auto 0;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.4s ease;
                }

                .team-card-link:hover .team-img-frame {
                    border-color: var(--primary, #22c1e6);
                    box-shadow: 0 0 20px rgba(34, 193, 230, 0.2);
                }

                .team-member-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s ease;
                }

                .team-card-link:hover .team-member-img {
                    transform: scale(1.08);
                }

                .team-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(18, 13, 32, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .team-card-link:hover .team-card-overlay {
                    opacity: 1;
                }

                .team-card-overlay span {
                    color: var(--primary, #22c1e6);
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                .team-card-content {
                    padding: 24px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .team-member-name {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    color: #ffffff;
                    font-size: 1.3rem;
                    font-weight: 700;
                    margin-bottom: 6px;
                }

                .team-member-role {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    margin-bottom: 16px;
                }

                .team-member-bio-snippet {
                    font-size: 13.5px;
                    color: var(--text-muted, #94a3b8);
                    line-height: 1.6;
                    margin-bottom: 24px;
                    opacity: 0.85;
                }

                .team-member-action {
                    margin-top: auto;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--secondary, #eff3c1);
                    transition: color 0.2s ease;
                }

                .team-card-link:hover .team-member-action {
                    color: var(--primary, #22c1e6);
                }

                .profile-arrow-icon {
                    width: 14px;
                    height: 14px;
                    transition: transform 0.25s ease;
                }

                .team-card-link:hover .profile-arrow-icon {
                    transform: translateX(4px);
                }

                @media (max-width: 600px) {
                    .team-grid {
                        grid-template-columns: 1fr;
                        padding: 0 4%;
                    }
                }
            `}</style>
        </section>
    );
};

export default TeamSection;
