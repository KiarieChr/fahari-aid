import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Youtube, Facebook, Instagram, Twitter, MessageCircle, Heart, ArrowUpRight } from 'lucide-react';
import '../styles/index.css';
import '../styles/footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="main-footer">
            <div className="footer-ambient-glow" aria-hidden="true" />
            <div className="container">
                <div className="footer-top-grid">
                    {/* Column 1: Brand details */}
                    <div className="footer-brand-col">
                        <Link to="/" className="footer-logo-block">
                            <img
                                src="/favicon.ico"
                                alt="Jesus Enthroned Network Logo"
                                className="footer-logo-img"
                            />
                            <div>
                                <h3 className="footer-brand-name">Jesus Enthroned</h3>
                                <div className="footer-brand-abbr">NETWORK</div>
                            </div>
                        </Link>
                        <p className="footer-brand-desc">
                            Equipping and mobilising men and women to fulfil their divine purpose across spirituality, education, governance, business, media, family, and the arts.
                        </p>
                        <div className="footer-branding-tagline">
                            <span>KINGDOM</span>
                            <span className="dot">•</span>
                            <span>UNITY</span>
                            <span className="dot">•</span>
                            <span>PURPOSE</span>
                        </div>
                    </div>

                    {/* Column 2: Directory Links */}
                    <div>
                        <h4 className="footer-col-title">Quick Links</h4>
                        <ul className="footer-links-list">
                            <li><Link to="/about">Our Story &amp; Vision</Link></li>
                            <li><Link to="/sermons">Sermons &amp; Teachings</Link></li>
                            <li><Link to="/events">Conferences &amp; Events</Link></li>
                            <li><Link to="/merchandise">Network Store</Link></li>
                            <li><Link to="/partners">Partnership Network</Link></li>
                            <li><Link to="/give" style={{ color: 'var(--gold)' }}>Give &amp; Support</Link></li>
                            <li><Link to="/portal">Member Portal <ArrowUpRight size={13} style={{ display: 'inline' }} /></Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h4 className="footer-col-title">Get in Touch</h4>
                        <ul className="footer-contact-list">
                            <li>
                                <MapPin size={18} className="contact-icon" />
                                <span>123 Barnabas, Nakuru, Kenya</span>
                            </li>
                            <li>
                                <Phone size={18} className="contact-icon" />
                                <span>+254 702 761913</span>
                            </li>
                            <li>
                                <MessageCircle size={18} className="contact-icon" style={{ color: '#25D366' }} />
                                <span>WhatsApp: +254 702 761913</span>
                            </li>
                            <li>
                                <Mail size={18} className="contact-icon" />
                                <span>info@jesusenthroned.org</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Connect & Hours */}
                    <div>
                        <h4 className="footer-col-title">Connect With Us</h4>
                        <div className="footer-social-icons">
                            <a href="https://www.youtube.com/@JesusEnthronedNetwork" target="_blank" rel="noopener noreferrer" className="social-pill youtube" aria-label="YouTube">
                                <Youtube size={18} />
                            </a>
                            <a href="https://www.facebook.com/JesusEnthronedNetwork" target="_blank" rel="noopener noreferrer" className="social-pill facebook" aria-label="Facebook">
                                <Facebook size={18} />
                            </a>
                            <a href="https://www.instagram.com/@JesusEnthronedNetwork" target="_blank" rel="noopener noreferrer" className="social-pill instagram" aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href="https://twitter.com/JesusEnthroned" target="_blank" rel="noopener noreferrer" className="social-pill twitter" aria-label="Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="https://wa.me/254702761913" target="_blank" rel="noopener noreferrer" className="social-pill whatsapp" aria-label="WhatsApp">
                                <MessageCircle size={18} />
                            </a>
                        </div>
                        <div className="footer-hours-block">
                            <h5 className="hours-title">Office Hours</h5>
                            <p className="hours-text">Monday – Friday</p>
                            <p className="hours-time">9:00 AM – 5:00 PM EAT</p>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom Block */}
                <div className="footer-bottom-bar">
                    <div className="copyright-info">
                        <p>© {currentYear} Jesus Enthroned Network. Grounded in Christ, built for lasting impact.</p>
                    </div>
                    <div className="legal-links">
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Support</Link>
                        <Link to="/portal">Portal</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
