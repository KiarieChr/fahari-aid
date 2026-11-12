import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SermonsHero from '../components/sermons/SermonsHero';
import SermonsList from '../components/sermons/SermonsList';

const Sermons = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <SermonsHero />
            <SermonsList />
            <Footer />
        </div>
    );
};

export default Sermons;
