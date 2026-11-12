import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AboutHero from '../components/about/AboutHero';
import VisionMission from '../components/VisionMission';
import ValuesSection from '../components/ValuesSection';
import TeamSection from '../components/TeamSection';
import ImpactSection from '../components/about/ImpactSection';

// Moved components
import DevotionalSection from '../components/DevotionalSection';
import AnnouncementsSection from '../components/AnnouncementsSection';
import SermonsSection from '../components/SermonsSection';
import EventsSection from '../components/EventsSection';
import PartnerSection from '../components/PartnerSection';
import StatsSection from '../components/StatsSection';

import { API_BASE_URL as API_URL } from '../../services/api';

const About = () => {
    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const response = await fetch(`${API_URL}get_homepage_data.php`);
                const data = await response.json();
                if (data.success) {
                    setHomeData(data.data);
                }
            } catch (err) {
                console.error('Failed to load homepage data in About page:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // Handle hash scroll effect (e.g. scrolling to #team)
    useEffect(() => {
        if (location.hash) {
            const targetId = location.hash.replace('#', '');
            const element = document.getElementById(targetId);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);

    // Section scroll entry animations trigger
    useEffect(() => {
        if (loading) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px' // Trigger slightly before section is fully in view
        });

        const elements = document.querySelectorAll('.about-page-section-wrapper');
        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
        };
    }, [loading]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#120D20' }}>
            <Navbar />
            
            {/* About Hero loads immediately with its own internal stagger entrance */}
            <AboutHero />
            
            {/* Scroll-driven Transition Sections */}
            <div className="about-page-section-wrapper">
                <VisionMission />
            </div>

            <div className="about-page-section-wrapper">
                <ValuesSection />
            </div>

            <div className="about-page-section-wrapper">
                <ImpactSection />
            </div>
            
            <div id="team" className="about-page-section-wrapper">
                <TeamSection />
            </div>
            
            <div className="about-page-section-wrapper">
                <DevotionalSection />
            </div>

            <div className="about-page-section-wrapper">
                <AnnouncementsSection
                    announcements={homeData?.announcements}
                    calendarSchedule={homeData?.calendar_schedule}
                    loading={loading}
                />
            </div>

            <div className="about-page-section-wrapper">
                <SermonsSection sermons={homeData?.sermons} loading={loading} />
            </div>

            <div className="about-page-section-wrapper">
                <EventsSection event={homeData?.featured_event} loading={loading} />
            </div>

            <div className="about-page-section-wrapper">
                <PartnerSection />
            </div>

            <div className="about-page-section-wrapper">
                <StatsSection />
            </div>
            
            <Footer />

            <style>{`
                /* Base Styles for Scroll Transitions */
                .about-page-section-wrapper {
                    opacity: 0;
                    will-change: transform, opacity;
                    transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Odd sections: Reveal up and swipe from the left */
                .about-page-section-wrapper:nth-of-type(odd) {
                    transform: translateY(40px) translateX(-50px);
                }

                /* Even sections: Reveal up and swipe from the right */
                .about-page-section-wrapper:nth-of-type(even) {
                    transform: translateY(40px) translateX(50px);
                }

                /* In-view active states */
                .about-page-section-wrapper.in-view {
                    opacity: 1;
                    transform: translateY(0) translateX(0);
                }
            `}</style>
        </div>
    );
};

export default About;
