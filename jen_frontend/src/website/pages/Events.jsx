import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventsHero from '../components/events/EventsHero';
import FeaturedEvent from '../components/events/FeaturedEvent';
import EventsCalendar from '../components/events/EventsCalendar';
import PastEvents from '../components/events/PastEvents';

const Events = () => {
    // Scroll entry animations trigger
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { 
            threshold: 0.08,
            rootMargin: '0px 0px -80px 0px'
        });

        const elements = document.querySelectorAll('.events-page-section-wrapper');
        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
        };
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#120D20' }}>
            <Navbar />
            <EventsHero />

            {/* Content wrapper with dark background */}
            <div style={{ background: '#120D20', flex: 1, overflow: 'hidden' }}>
                <div className="events-page-section-wrapper">
                    <FeaturedEvent />
                </div>
                
                <div className="events-page-section-wrapper">
                    <EventsCalendar />
                </div>
                
                <div className="events-page-section-wrapper">
                    <PastEvents />
                </div>
            </div>

            <Footer />

            <style>{`
                /* Base Styles for Scroll Transitions */
                .events-page-section-wrapper {
                    opacity: 0;
                    will-change: transform, opacity;
                    transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Odd sections: Reveal up and swipe from the left */
                .events-page-section-wrapper:nth-of-type(odd) {
                    transform: translateY(40px) translateX(-50px);
                }

                /* Even sections: Reveal up and swipe from the right */
                .events-page-section-wrapper:nth-of-type(even) {
                    transform: translateY(40px) translateX(50px);
                }

                /* In-view active states */
                .events-page-section-wrapper.in-view {
                    opacity: 1;
                    transform: translateY(0) translateX(0);
                }
            `}</style>
        </div>
    );
};

export default Events;
