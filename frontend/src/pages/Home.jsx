import { Link } from 'react-router-dom';
import { useState, useEffect, Suspense } from 'react';
import RetroScene from '../components/RetroScene';

/**
 * Home Page Component
 */
const Home = () => {
    // Typewriter effect
    const [displayText, setDisplayText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const fullText = 'Building intelligent systems.';

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

    useEffect(() => {
        const cursorTimer = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 530);
        return () => clearInterval(cursorTimer);
    }, []);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden'
        }}>
            {/* Background: 3D Scene */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0
            }}>
                <Suspense fallback={null}>
                    <RetroScene />
                </Suspense>
            </div>

            {/* Foreground: Centered Content */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                pointerEvents: 'none'
            }}>
                {/* Terminal Info Box */}
                <div style={{
                    maxWidth: '600px',
                    width: '100%',
                    padding: '3rem 4rem',
                    border: '2px solid var(--border-primary)',
                    borderRadius: '4px',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(12px)',
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    pointerEvents: 'auto'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '16px',
                        display: 'flex',
                        gap: '6px'
                    }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.8 }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.5 }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.3 }}></span>
                    </div>

                    <p style={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: '1rem',
                        marginTop: '0.5rem',
                        textAlign: 'center'
                    }}>
                        {'>'} HELLO, WORLD
                    </p>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        fontWeight: '800',
                        marginBottom: '0.5rem',
                        lineHeight: 1.1,
                        textAlign: 'center'
                    }}>
                        <span className="gradient-text">Ajay Kumar</span>
                    </h1>

                    <p style={{
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        textAlign: 'center'
                    }}>
                        AI / ML Developer
                    </p>

                    <p style={{
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: 'var(--accent-primary)',
                        marginBottom: '2rem',
                        minHeight: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {'>'} {displayText}
                        <span style={{ opacity: showCursor ? 1 : 0 }}>▌</span>
                    </p>

                    <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginBottom: '1.5rem',
                        opacity: 0.4,
                        textAlign: 'center'
                    }}>
                        ══════════════════════════════
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { to: '/work', label: 'WORK', num: '01' },
                            { to: '/blogs', label: 'BLOG', num: '02' },
                        ].map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    padding: '0.5rem 0',
                                    borderBottom: '1px dashed var(--border-primary)',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                            >
                                [{link.num}] {link.label}
                            </Link>
                        ))}
                        <a
                            href="https://github.com/ajkumar-13"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                padding: '0.5rem 0',
                                borderBottom: '1px dashed var(--border-primary)',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                        >
                            [03] GITHUB
                        </a>
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    opacity: 0.6,
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px'
                }}>
                    STATUS: AVAILABLE FOR WORK • CLICK SCREEN FOR EFFECTS ✨
                </div>
            </div>
        </div>
    );
};

export default Home;
