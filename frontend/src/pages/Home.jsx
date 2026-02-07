import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from '../styles/components.module.css';

/**
 * Home Page Component
 * 
 * Retro-styled landing page with:
 * - Typewriter effect for the tagline
 * - Terminal/ASCII art aesthetic
 * - Minimal but nostalgic feel
 */
const Home = () => {
    // Typewriter effect state
    const [displayText, setDisplayText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const fullText = 'Building intelligent systems.';

    // Typewriter animation
    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index < fullText.length) {
                setDisplayText(fullText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
            }
        }, 80);

        return () => clearInterval(timer);
    }, []);

    // Blinking cursor
    useEffect(() => {
        const cursorTimer = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 530);
        return () => clearInterval(cursorTimer);
    }, []);

    return (
        <div className="container">
            {/* Hero Section */}
            <section style={{
                minHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* Retro Terminal Box */}
                <div style={{
                    padding: '3rem 4rem',
                    border: '2px solid var(--border-primary)',
                    borderRadius: '4px',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    maxWidth: '600px'
                }}>
                    {/* Terminal Header Dots */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '16px',
                        display: 'flex',
                        gap: '6px'
                    }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c4a77d', opacity: 0.6 }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c4a77d', opacity: 0.4 }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c4a77d', opacity: 0.2 }}></span>
                    </div>

                    {/* Greeting */}
                    <p style={{
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        marginBottom: '1rem',
                        letterSpacing: '0.15em'
                    }}>
                        {'>'} HELLO, WORLD
                    </p>

                    {/* Name */}
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        fontWeight: '800',
                        marginBottom: '0.75rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em'
                    }}>
                        <span className="gradient-text">Ajay Kumar</span>
                    </h1>

                    {/* Role with Typewriter */}
                    <p style={{
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem'
                    }}>
                        AI / ML Developer
                    </p>

                    {/* Typewriter Tagline */}
                    <p style={{
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        color: 'var(--accent-primary)',
                        marginBottom: '2rem',
                        minHeight: '1.5rem'
                    }}>
                        {'>'} {displayText}
                        <span style={{
                            opacity: showCursor ? 1 : 0,
                            transition: 'opacity 0.1s'
                        }}>▌</span>
                    </p>

                    {/* ASCII Divider */}
                    <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginBottom: '1.5rem',
                        opacity: 0.5
                    }}>
                        ════════════════════════
                    </div>

                    {/* Navigation Links - Retro Style */}
                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                    }}>
                        <Link
                            to="/work"
                            style={{
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                padding: '0.5rem 0',
                                borderBottom: '1px dashed var(--border-primary)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                        >
                            [01] WORK
                        </Link>
                        <Link
                            to="/blogs"
                            style={{
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                padding: '0.5rem 0',
                                borderBottom: '1px dashed var(--border-primary)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                        >
                            [02] BLOG
                        </Link>
                        <a
                            href="https://github.com/ajkumar-13"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                padding: '0.5rem 0',
                                borderBottom: '1px dashed var(--border-primary)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                        >
                            [03] GITHUB
                        </a>
                    </div>
                </div>

                {/* Status Line at Bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    opacity: 0.4
                }}>
                    STATUS: AVAILABLE FOR WORK • SCROLL ↓
                </div>
            </section>
        </div>
    );
};

export default Home;
