import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE_URL as API_URL } from '../../services/api';

// Helper to get distinct portrait placeholders based on name/role
const getMemberImage = (name, imageUrl) => {
    if (imageUrl) {
        return imageUrl.startsWith('http') ? imageUrl : `${API_URL.replace('api/', '')}${imageUrl}`;
    }
    const lowerName = String(name).toLowerCase();
    if (lowerName.includes('benjamin')) {
        return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop'; // Benjamin (Director)
    }
    if (lowerName.includes('paul')) {
        return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop'; // Paul (Deputy Director)
    }
    if (lowerName.includes('naomi')) {
        return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop'; // Naomi (Executive Secretary)
    }
    if (lowerName.includes('james')) {
        return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop'; // James (Media Director)
    }
    return 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop';
};

const TeamMemberDetails = () => {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                setLoading(true);
                // Fetch the full team list and find the selected member
                const response = await fetch(`${API_URL}get_team.php`);
                const data = await response.json();

                if (data.success) {
                    const foundMember = (data.data.team || []).find(m => String(m.id) === String(id));
                    if (foundMember) {
                        setMember(foundMember);
                    } else {
                        setError('Team member not found');
                    }
                } else {
                    setError('Failed to fetch team details');
                }
            } catch (err) {
                console.error('Error fetching team details:', err);
                setError('Failed to load team details');
            } finally {
                setLoading(false);
            }
        };

        fetchMember();
    }, [id]);

    // Custom fallback message based on team roles
    const getJoiningMessage = (name, role) => {
        const lowerName = String(name).toLowerCase();
        const lowerRole = String(role).toLowerCase();

        if (lowerName.includes('benjamin') || lowerRole.includes('director') && !lowerRole.includes('deputy') && !lowerRole.includes('media')) {
            return "Our mandate at Jesus Enthroned Network is to build a community that doesn't just gather, but actively transforms nations. When you join JEN, you are stepping into a relational greenhouse designed to align your skills with eternal, Biblical principles. Let us build a legacy of integrity together.";
        }
        if (lowerName.includes('paul') || lowerRole.includes('deputy')) {
            return "Step into unity, step into authority. We believe that true leadership is birthed in community and accountability. Welcome to a platform where we learn, pray, and conquer spheres together. Your purpose is vital to this network.";
        }
        if (lowerName.includes('naomi') || lowerRole.includes('secretary')) {
            return "Structure and diligence form the backbone of any lasting legacy. We are here to support your growth, coordinate your alignment, and ensure you have all the relational resources you need to fulfill your purpose. Welcome to the family!";
        }
        if (lowerName.includes('james') || lowerRole.includes('media')) {
            return "Truth deserves to be communicated with absolute excellence. In a world full of noise, we are raising voice-bearers who will capture and convey the heart of the Kingdom across every channel. Welcome aboard, let's make an impact.";
        }
        
        return "Welcome to Jesus Enthroned Network. Together, we are aligning our callings with Kingdom authority to transform every sphere of influence. We are thrilled to walk this journey of purpose, growth, and legacy with you.";
    };

    if (loading) {
        return (
            <div className="member-details-page loading-state">
                <Navbar />
                <div className="container loading-container">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="member-details-page error-state">
                <Navbar />
                <div className="container error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>{error || 'Profile Not Found'}</h2>
                    <Link to="/about#team" className="btn btn-primary">
                        Return to Team
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const joiningMessage = getJoiningMessage(member.name, member.role);

    return (
        <div className="member-details-page">
            <Navbar />
            
            <div className="member-details-main">
                {/* Ambient lights */}
                <div className="member-glow-1"></div>
                <div className="member-glow-2"></div>

                <div className="container">
                    {/* Back navigation link */}
                    <div className="back-link-wrapper">
                        <Link to="/about#team" className="back-link">
                            <svg viewBox="0 0 14 14" fill="none" className="back-arrow-icon">
                                <path d="M12 7H2M2 7l4-4M2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to Team Structure
                        </Link>
                    </div>

                    <div className="profile-grid">
                        {/* Left Column: Avatar & Contact Info */}
                        <div className="profile-left-col">
                            <div className="profile-glass-card">
                                <div className="profile-img-container">
                                    <img 
                                        src={getMemberImage(member.name, member.image_url)} 
                                        alt={member.name} 
                                        className="profile-img"
                                    />
                                </div>
                                <h1 className="profile-name">{member.name}</h1>
                                <span className="profile-badge-role">{member.role}</span>

                                {/* Social Links */}
                                <div className="profile-socials">
                                    {member.twitter_url && (
                                        <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                                            <i className="bi bi-twitter-x"></i>
                                        </a>
                                    )}
                                    {member.facebook_url && (
                                        <a href={member.facebook_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                                            <i className="bi bi-facebook"></i>
                                        </a>
                                    )}
                                    {member.instagram_url && (
                                        <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                                            <i className="bi bi-instagram"></i>
                                        </a>
                                    )}
                                    {member.linkedin_url && (
                                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                                            <i className="bi bi-linkedin"></i>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bio & Joining Message */}
                        <div className="profile-right-col">
                            {/* Biography Panel */}
                            <div className="profile-content-panel">
                                <h2 className="panel-title">Biography</h2>
                                <p className="panel-text">
                                    {member.bio || `${member.name} is a dedicated leader serving at Jesus Enthroned Network, playing a pivotal role in organizing, coordinating, and leading our programs to fulfill our Kingdom mission.`}
                                </p>
                            </div>

                            {/* Message to those joining JEN */}
                            <div className="profile-content-panel message-panel">
                                <div className="quote-icon">“</div>
                                <h2 className="panel-title">Message to Those Joining JEN</h2>
                                <p className="panel-text message-text">
                                    {joiningMessage}
                                </p>
                                <div className="message-signoff">
                                    <span className="signoff-name">— {member.name}</span>
                                    <span className="signoff-role">{member.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .member-details-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #120D20;
                    color: #ffffff;
                }

                .member-details-main {
                    padding: 80px 0 100px;
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }

                /* Glowing Blobs */
                .member-glow-1 {
                    position: absolute;
                    top: 15%;
                    left: -10%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(34, 193, 230, 0.08) 0%, transparent 70%);
                    pointer-events: none;
                }

                .member-glow-2 {
                    position: absolute;
                    bottom: 10%;
                    right: -10%;
                    width: 450px;
                    height: 450px;
                    background: radial-gradient(circle, rgba(239, 243, 193, 0.04) 0%, transparent 70%);
                    pointer-events: none;
                }

                /* Back navigation */
                .back-link-wrapper {
                    margin-bottom: 40px;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--primary, #22c1e6);
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 600;
                    transition: color 0.2s ease;
                }

                .back-link:hover {
                    color: var(--secondary, #eff3c1);
                }

                .back-arrow-icon {
                    width: 16px;
                    height: 16px;
                    transition: transform 0.2s ease;
                }

                .back-link:hover .back-arrow-icon {
                    transform: translateX(-4px);
                }

                /* Grid */
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.8fr;
                    gap: 48px;
                    align-items: start;
                }

                /* Profile Left Card */
                .profile-glass-card {
                    background: rgba(26, 22, 37, 0.5);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 28px;
                    padding: 48px 32px;
                    text-align: center;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
                }

                .profile-img-container {
                    width: 200px;
                    height: 200px;
                    margin: 0 auto 28px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid var(--primary, #22c1e6);
                    box-shadow: 0 0 30px rgba(34, 193, 230, 0.15);
                }

                .profile-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .profile-name {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: 2rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 8px;
                }

                .profile-badge-role {
                    display: inline-block;
                    background: rgba(34, 193, 230, 0.08);
                    border: 1px solid rgba(34, 193, 230, 0.2);
                    color: var(--primary, #22c1e6);
                    padding: 6px 16px;
                    border-radius: 9999px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-bottom: 32px;
                }

                .profile-socials {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                }

                .social-icon-btn {
                    width: 44px;
                    height: 44px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    text-decoration: none;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .social-icon-btn:hover {
                    background: var(--primary, #22c1e6);
                    color: #120D20;
                    border-color: var(--primary, #22c1e6);
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(34, 193, 230, 0.3);
                }

                /* Right Column Panels */
                .profile-right-col {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .profile-content-panel {
                    background: rgba(26, 22, 37, 0.3);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 28px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    position: relative;
                }

                .panel-title {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #ffffff;
                    margin-bottom: 20px;
                    position: relative;
                    display: inline-block;
                }

                .panel-title::after {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: 0;
                    width: 32px;
                    height: 2px;
                    background-color: var(--primary, #22c1e6);
                }

                .panel-text {
                    font-size: 15px;
                    line-height: 1.8;
                    color: var(--text-muted, #94a3b8);
                }

                /* Message Panel styling */
                .message-panel {
                    background: linear-gradient(135deg, rgba(34, 193, 230, 0.03) 0%, rgba(239, 243, 193, 0.02) 100%);
                    border-color: rgba(34, 193, 230, 0.15);
                }

                .quote-icon {
                    position: absolute;
                    top: 20px;
                    right: 40px;
                    font-family: 'Playfair Display', serif;
                    font-size: 5rem;
                    color: var(--primary, #22c1e6);
                    opacity: 0.12;
                    line-height: 1;
                }

                .message-text {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 1.15rem;
                    line-height: 1.8;
                    color: var(--secondary, #eff3c1);
                }

                .message-signoff {
                    margin-top: 28px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .signoff-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #ffffff;
                }

                .signoff-role {
                    font-size: 11px;
                    color: var(--primary, #22c1e6);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 2px;
                }

                /* Loading & Error States */
                .loading-state, .error-state {
                    justify-content: center;
                }

                .loading-container, .error-container {
                    text-align: center;
                    padding: 80px 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                }

                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top-color: var(--primary, #22c1e6);
                    border-radius: 50%;
                    animation: spin 1s infinite linear;
                    margin-bottom: 16px;
                }

                .error-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 992px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                }
            `}</style>
            
            <Footer />
        </div>
    );
};

export default TeamMemberDetails;
