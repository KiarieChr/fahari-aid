import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StrategicPlan from '../components/StrategicPlan';
import SpheresOfInfluence from '../components/SpheresOfInfluence';
import ValuesSection from '../components/ValuesSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import FaqSection from '../components/FaqSection';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';
import { API_BASE_URL as API_URL } from '../../services/api';

const Home = () => {
    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const response = await fetch(`${API_URL}get_homepage_data.php`);
                const data = await response.json();
                if (data.success) {
                    setHomeData(data.data);
                }
            } catch (err) {
                console.error('Failed to load homepage data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Hero data={homeData?.hero} />
            <StrategicPlan />
            <SpheresOfInfluence />
            <ValuesSection />
            <WhyChooseUsSection />
            <FaqSection />
            <CtaSection />
            <Footer />
        </div>
    );
};

export default Home;
