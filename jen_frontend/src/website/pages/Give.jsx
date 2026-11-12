import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GivingHero from '../components/giving/GivingHero';
import ImpactSection from '../components/giving/ImpactSection';
import GivingOptions from '../components/giving/GivingOptions';

const Give = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <GivingHero />
            <ImpactSection />
            <GivingOptions />
            <Footer />
        </div>
    );
};

export default Give;
