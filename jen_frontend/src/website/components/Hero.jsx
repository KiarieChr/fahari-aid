import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Typing Effect Hook Logic (placed on the left side)
    const words = ["Transforming Education", "Empowering Leaders", "Shaping Governance", "Unifying Purpose", "Enthroning Christ"];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        let timer;
        const handleTyping = () => {
            const fullWord = words[currentWordIndex];
            if (!isDeleting) {
                setCurrentText(fullWord.substring(0, currentText.length + 1));
                setTypingSpeed(100);
                if (currentText === fullWord) {
                    timer = setTimeout(() => setIsDeleting(true), 1500);
                    return;
                }
            } else {
                setCurrentText(fullWord.substring(0, currentText.length - 1));
                setTypingSpeed(50);
                if (currentText === "") {
                    setIsDeleting(false);
                    setCurrentWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        };

        timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentWordIndex, typingSpeed]);

    return (
        <section className="hero-section">
            {/* Animated Background Particles */}
            <div className="hero-bg-particles">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={`particle particle-${i + 1}`}></div>
                ))}
            </div>

            {/* Gradient Overlay */}
            <div className="hero-gradient-overlay"></div>
                <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(34, 193, 230, 0.38) 0%, transparent 100%)',
                    clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>

                <div style={{
                    position: 'absolute',
                    top: '-30%',
                    left: '-10%',
                    width: '60%',
                    height: '160%',
                    background: 'radial-gradient(circle, rgba(34, 193, 230, 0.06) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>

            {/* Animated Background Image */}
            <div className="hero-bg-image"></div>

            {/* Floating Glow Effects */}
            <div className="glow-effect glow-1"></div>
            <div className="glow-effect glow-2"></div>
            <div className="glow-effect glow-3"></div>

            <div className="container hero-container" style={{ position: 'relative', zIndex: 10 }}>
                <div className="hero-grid">
                    <div className="hero-left-content">
                        {/* Animated Eyebrow */}
                        <div className={`hero-eyebrow-accent ${isVisible ? 'animate-in' : ''}`}>
                            Kingdom Purpose Unity
                        </div>

                        {/* Typing Decoration on the Left */}
                        <div className="hero-typing-badge-left">
                            <span className="typing-dot"></span>
                            <span className="typing-text">Focus: {currentText}<span className="typing-cursor">|</span></span>
                        </div>

                        <h1 className={`hero-title-new ${isVisible ? 'animate-in' : ''}`}>
                            <div className="title-line-mask">
                                <span className="title-line-inner">Raising a Kingdom</span>
                            </div>
                            <div className="title-line-mask">
                                <span className="title-line-inner">
                                    Generation to <span className="text-gradient title-highlight">Transform</span>
                                </span>
                            </div>
                            <div className="title-line-mask">
                                <span className="title-line-inner">Every Sphere</span>
                            </div>
                        </h1>

                        <p className={`hero-subtitle-new ${isVisible ? 'animate-in' : ''}`}>
                            Jesus Enthroned Network equips and mobilises men and women to fulfil their divine purpose across spirituality, education, governance, business, media, family, and the arts — grounded in Biblical principles and built for lasting impact.
                        </p>

                        <div className={`hero-actions-new ${isVisible ? 'animate-in' : ''}`}>
                            <Link to="/portal" className="btn btn-primary hero-btn">
                                <span>Join the Network</span>
                                <span className="btn-shine"></span>
                            </Link>
                            <Link to="/sermons" className="btn btn-outline hero-btn">
                                <span>Explore Our Programs</span>
                            </Link>
                            <Link to="/give" className="btn btn-glass hero-btn">
                                <span className="btn-icon">❤</span>
                                <span>Give Now</span>
                            </Link>
                        </div>
                    </div>

                    {/* Creative Shaped Collage on the Right */}
                    <div className={`hero-visual ${isVisible ? 'animate-in' : ''}`}>
                        <div className="hero-collage-container">

                            {/* Left Rounded Image Block */}
                            <div className="collage-block collage-left-main">
                                <img src="/DSC_0166.JPG" alt="Community Worship" className="collage-img" />

                                {/* Emerald Green concentric award badge */}
                                <div className="emerald-award-badge">
                                    <div className="badge-ring-1">
                                        <div className="badge-ring-2">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="star-icon">
                                                <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Stacked Shapes */}
                            <div className="collage-right-stack">
                                {/* Top Slanted Parallelogram Card */}
                                <div className="collage-block slanted-card top-slanted">
                                    <div className="slanted-inner">
                                        <img src="/hero-2.JPG" alt="Worship Space" className="collage-img" />
                                    </div>
                                </div>

                                {/* Middle Rounded Rect Card */}
                                <div className="collage-block rect-card">
                                    <img src="/DSC_0009.JPG" alt="Collaboration" className="collage-img" />
                                </div>

                                {/* Bottom Slanted Parallelogram Card */}
                                <div className="collage-block slanted-card bottom-slanted">
                                    <div className="slanted-inner">
                                        <img src="/hero-3.jpeg" alt="Team Work" className="collage-img" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Lowered stats bar */}
                        <div className="hero-stat-bar">
                            <div className="hero-stat">
                                <div className="num">7</div>
                                <div className="lbl">Mountains</div>
                            </div>
                            <div className="hero-stat">
                                <div className="num">4+</div>
                                <div className="lbl">Programs</div>
                            </div>
                            <div className="hero-stat">
                                <div className="num">∞</div>
                                <div className="lbl">Legacy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Improved Static Spheres/Mountains Bar */}
            <div className="spheres-anchor-bar">
                <div className="spheres-container">
                    <div className="spheres-grid-static">
                        <span className="sphere-pill"><span className="dot"></span>Spirituality &amp; Religion</span>
                        <span className="sphere-pill"><span className="dot"></span>Education</span>
                        <span className="sphere-pill"><span className="dot"></span>Politics &amp; Governance</span>
                        <span className="sphere-pill"><span className="dot"></span>Business &amp; Economics</span>
                        <span className="sphere-pill"><span className="dot"></span>Media &amp; Communication</span>
                        <span className="sphere-pill"><span className="dot"></span>Family</span>
                        <span className="sphere-pill"><span className="dot"></span>Arts &amp; Entertainment</span>
                    </div>
                </div>
            </div>

            <style>{`
                .hero-section {
                    min-height: 92vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    padding-top: 75px;
                    padding-bottom: 0;
                    background: linear-gradient(135deg, #1A1625 0%, #0d0a14 50%, #120D20 100%);
                    overflow: hidden;
                }

                .hero-container {
                    width: 100%;
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 0 3%;
                    flex: 1;
                    display: flex;
                    align-items: center;
                }

                .hero-grid {
                    display: grid;
                    grid-template-columns: 1.15fr 0.85fr;
                    gap: 48px;
                    align-items: center;
                    width: 100%;
                }

                /* Animated Background Particles */
                .hero-bg-particles {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                }
                .particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: rgba(34, 193, 230, 0.5);
                    border-radius: 50%;
                    animation: float-particle 15s infinite ease-in-out;
                }
                ${[...Array(20)].map((_, i) => `
                    .particle-${i + 1} {
                        left: ${Math.random() * 100}%;
                        top: ${Math.random() * 100}%;
                        animation-delay: ${Math.random() * 5}s;
                        animation-duration: ${10 + Math.random() * 10}s;
                        opacity: ${0.3 + Math.random() * 0.5};
                        transform: scale(${0.5 + Math.random() * 1.5});
                    }
                `).join('')}

                @keyframes float-particle {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-30px) translateX(10px); }
                    50% { transform: translateY(-50px) translateX(-10px); }
                    75% { transform: translateY(-20px) translateX(20px); }
                }

                /* Background Image with Ken Burns Effect */
                .hero-bg-image {
                    position: absolute;
                    inset: -20px;
                    background: url("https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop");
                    background-size: cover;
                    background-position: center;
                    opacity: 0.12;
                    animation: ken-burns 30s ease-in-out infinite alternate;
                }

                @keyframes ken-burns {
                    0% { transform: scale(1) translateX(0); }
                    100% { transform: scale(1.1) translateX(-2%); }
                }

                /* Gradient Overlay */
                .hero-gradient-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        180deg,
                        rgba(18, 13, 32, 0.35) 0%,
                        rgba(18, 13, 32, 0.65) 50%,
                        rgba(18, 13, 32, 0.95) 100%
                    );
                    z-index: 2;
                }

                /* Floating Glow Effects */
                .glow-effect {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: 1;
                    animation: glow-pulse 8s ease-in-out infinite;
                }
                .glow-1 {
                    width: 400px;
                    height: 400px;
                    background: rgba(34, 193, 230, 0.12);
                    top: 10%;
                    left: -10%;
                    animation-delay: 0s;
                }
                .glow-2 {
                    width: 300px;
                    height: 300px;
                    background: rgba(168, 85, 247, 0.1);
                    top: 50%;
                    right: -5%;
                    animation-delay: 2s;
                }
                .glow-3 {
                    width: 350px;
                    height: 350px;
                    background: rgba(34, 193, 230, 0.08);
                    bottom: 10%;
                    left: 30%;
                    animation-delay: 4s;
                }

                @keyframes glow-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                }

                /* Hero Eyebrow Accent */
                .hero-eyebrow-accent {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 11px;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 600;
                    margin-bottom: 10px;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hero-eyebrow-accent::before {
                    content: '';
                    width: 28px;
                    height: 1.5px;
                    background: var(--primary, #22c1e6);
                }
                .hero-eyebrow-accent.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Left Side Typing Decoration */
                .hero-typing-badge-left {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 6px 14px;
                    border-radius: 20px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                }
                .typing-dot {
                    width: 7px;
                    height: 7px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse-dot 2s infinite;
                }
                @keyframes pulse-dot {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
                    50% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                }
                .typing-text {
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.85);
                }
                .typing-cursor {
                    color: var(--primary, #22c1e6);
                    font-weight: 700;
                    animation: blink 0.8s infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }

                /* Hero Title - Masked Slide-Up Entrance */
                .hero-title-new {
                    font-family: 'Onest', 'Montserrat', 'Inter', sans-serif;
                    font-size: clamp(2rem, 3.8vw, 3.5rem);
                    font-weight: 800;
                    color: white;
                    margin-bottom: 24px;
                }
                .title-line-mask {
                    overflow: hidden;
                    display: block;
                    line-height: 1.25;
                }
                .title-line-inner {
                    display: inline-block;
                    transform: translateY(100%);
                    transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hero-title-new.animate-in .title-line-inner {
                    transform: translateY(0);
                }
                .title-line-mask:nth-child(2) .title-line-inner {
                    transition-delay: 0.15s;
                }
                .title-line-mask:nth-child(3) .title-line-inner {
                    transition-delay: 0.3s;
                }

                /* Glowing Shimmer Highlight Word */
                .title-highlight {
                    display: inline-block;
                    position: relative;
                    background: linear-gradient(120deg, #22c1e6, #a855f7, #e0aaff, #22c1e6);
                    background-size: 200% auto;
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent;
                    animation: gradientSweep 4s linear infinite;
                    text-shadow: 0 0 20px rgba(34, 193, 230, 0.25);
                }

                /* Glowing Underline Decoration */
                .title-highlight::after {
                    content: '';
                    position: absolute;
                    bottom: 0px;
                    left: 5%;
                    width: 90%;
                    height: 3px;
                    background: linear-gradient(90deg, #22c1e6, #a855f7);
                    border-radius: 2px;
                    box-shadow: 0 2px 10px rgba(34, 193, 230, 0.5);
                    transform: scaleX(0);
                    transform-origin: center;
                    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s;
                }
                .hero-title-new.animate-in .title-highlight::after {
                    transform: scaleX(1);
                }

                @keyframes gradientSweep {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }

                /* Hero Subtitle */
                .hero-subtitle-new {
                    font-family: 'Inter', sans-serif;
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.75);
                    line-height: 1.8;
                    margin-bottom: 36px;
                    max-width: 520px;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
                }
                .hero-subtitle-new.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Hero Actions */
                .hero-actions-new {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
                }
                .hero-actions-new.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }

                .hero-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 14.5px;
                    padding: 0.9rem 1.75rem;
                    text-decoration: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .hero-btn .btn-icon {
                    font-size: 1.1rem;
                }

                .hero-btn.btn-primary {
                    background: linear-gradient(135deg, var(--primary, #22c1e6) 0%, #1aa3c4 100%);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 20px rgba(34, 193, 230, 0.3);
                }
                .hero-btn.btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(34, 193, 230, 0.45);
                }
                .hero-btn.btn-primary .btn-shine {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: btn-shine 3s infinite;
                }

                @keyframes btn-shine {
                    0% { left: -100%; }
                    50%, 100% { left: 100%; }
                }

                .hero-btn.btn-glass {
                    background: rgba(255,255,255,0.06);
                    backdrop-filter: blur(10px);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.12);
                }
                .hero-btn.btn-glass:hover {
                    background: rgba(255,255,255,0.15);
                    transform: translateY(-2px);
                }

                .hero-btn.btn-outline {
                    background: transparent;
                    color: white;
                    border: 1.5px solid rgba(255,255,255,0.25);
                }
                .hero-btn.btn-outline:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: var(--primary, #22c1e6);
                    transform: translateY(-2px);
                }

                /* Hero Visual Column (Collage & stats) */
                .hero-visual {
                    position: relative;
                    opacity: 0;
                    transform: translateX(40px);
                    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
                    margin-bottom: 60px;
                }
                .hero-visual.animate-in {
                    opacity: 1;
                    transform: translateX(0);
                }

                /* COLLAGE GRID LAYOUT (Matches User Image) */
                .hero-collage-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    width: 100%;
                    position: relative;
                }

                .collage-block {
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35);
                    background: #1e1b29;
                    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .collage-block:hover {
                    transform: translateY(-5px);
                }

                .collage-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .collage-block:hover .collage-img {
                    transform: scale(1.05);
                }

                /* Left Main Card */
                .collage-left-main {
                    border-radius: 36px;
                    height: 380px;
                    margin-top: 40px; /* offset visually */
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                }

                /* Concentric circles green award badge overlay */
                .emerald-award-badge {
                    position: absolute;
                    bottom: 24px;
                    left: -24px;
                    z-index: 20;
                }
                .badge-ring-1 {
                    width: 76px;
                    height: 76px;
                    background: rgba(34, 193, 230, 0.12);
                    border: 2px solid rgba(34, 193, 230, 0.45);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: pulse-ring 3s infinite ease-in-out;
                }
                .badge-ring-2 {
                    width: 60px;
                    height: 60px;
                    background: #0d283c; /* Shady Dark Blue */
                    border: 3px solid var(--primary, #22c1e6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 18px rgba(34, 193, 230, 0.45);
                }
                .star-icon {
                    width: 26px;
                    height: 26px;
                    color: var(--primary, #22c1e6);
                }
                @keyframes pulse-ring {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.08); opacity: 1; }
                }

                /* Right Stack of Shapes */
                .collage-right-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Slanted Parallelograms Card */
                .slanted-card {
                    height: 120px;
                    border-radius: 18px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    transform: skewY(-4deg); /* Create unique slanted feel from mockup */
                }
                .slanted-inner {
                    width: 100%;
                    height: 100%;
                    transform: skewY(4deg) scale(1.15); /* unskew the contents */
                    overflow: hidden;
                }

                /* Top slanted top-right edge */
                .top-slanted {
                    border-radius: 36px 36px 36px 36px;
                }
                /* Middle regular card */
                .rect-card {
                    height: 140px;
                    border-radius: 28px;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                }
                /* Bottom slanted bottom-left edge */
                .bottom-slanted {
                    border-radius: 36px 36px 36px 36px;
                }

                /* Stats Bar */
                .hero-stat-bar {
                    position: absolute;
                    bottom: -36px;
                    left: 5%;
                    right: 5%;
                    background: #1A1625;
                    border-radius: 12px;
                    padding: 20px 24px;
                    display: flex;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
                }
                .hero-stat {
                    flex: 1;
                    text-align: center;
                }
                .hero-stat:not(:last-child) {
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                }
                .hero-stat .num {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--primary, #22c1e6);
                }
                .hero-stat .lbl {
                    font-size: 11px;
                    color: var(--text-muted, #94a3b8);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-top: 2px;
                }

                /* STATIC SPHERES ANCHOR BAR */
                .spheres-anchor-bar {
                    background: #1A1625;
                    padding: 24px 0;
                    border-top: 3px solid var(--primary, #22c1e6);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    position: relative;
                    margin-top: auto;
                    z-index: 10;
                }
                .spheres-container {
                    width: 100%;
                    max-width: 1920px;
                    margin: 0 auto;
                    padding: 0 3%;
                }
                .spheres-grid-static {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .sphere-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1.5px solid rgba(255, 255, 255, 0.06);
                    padding: 8px 16px;
                    border-radius: 30px;
                    font-size: 11.5px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.85);
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                    user-select: none;
                }
                .sphere-pill .dot {
                    width: 6px;
                    height: 6px;
                    background: var(--primary, #22c1e6);
                    border-radius: 50%;
                    box-shadow: 0 0 6px var(--primary, #22c1e6);
                    transition: all 0.25s ease;
                    flex-shrink: 0;
                }
                .sphere-pill:hover {
                    background: rgba(34, 193, 230, 0.08);
                    border-color: var(--primary, #22c1e6);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(34, 193, 230, 0.15);
                }
                .sphere-pill:hover .dot {
                    background: white;
                    box-shadow: 0 0 10px white;
                    transform: scale(1.25);
                }

                /* Responsive Design */
                @media (max-width: 968px) {
                    .hero-section {
                        padding-top: 90px;
                        min-height: auto;
                    }
                    .hero-grid {
                        grid-template-columns: 1fr;
                        gap: 48px;
                        text-align: center;
                    }
                    .hero-eyebrow-accent {
                        justify-content: center;
                    }
                    .hero-typing-badge-left {
                        margin-inline: auto;
                    }
                    .hero-subtitle-new {
                        margin-inline: auto;
                    }
                    .hero-actions-new {
                        justify-content: center;
                    }
                    .hero-visual {
                        max-width: 440px;
                        margin: 0 auto;
                        width: 100%;
                        margin-bottom: 50px;
                    }
                    .collage-left-main {
                        height: 320px;
                    }
                    .slanted-card {
                        height: 100px;
                    }
                    .rect-card {
                        height: 110px;
                    }
                }

                @media (max-width: 480px) {
                    .hero-title-new {
                        font-size: 1.85rem !important;
                    }
                    .hero-actions-new {
                        flex-direction: column;
                        align-items: center;
                    }
                    .hero-btn {
                        width: 100%;
                        max-width: 280px;
                        justify-content: center;
                    }
                }
            `}</style>
        </section>
    );
};

export default Hero;
