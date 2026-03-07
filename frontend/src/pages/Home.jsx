/**
 * Home.jsx — Landing Page / Hero Section
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS PAGE SHOWS
 * ─────────────────────────────────────────────────────────────────────────────
 * - Animated 3D background (RetroScene component using Three.js)
 * - Terminal-style hero card with:
 *     - Ajay's name and role
 *     - Typewriter animation on the tagline
 *     - Key expertise areas
 *     - Navigation links to main sections
 *
 * REACT CONCEPTS
 * ─────────────────────────────────────────────────────────────────────────────
 * useState: Stores values that change over time.
 *   useState('') creates state with initial value ''.
 *   Returns [currentValue, setterFunction].
 *
 * useEffect: Runs side effects after render.
 *   The typewriter animation uses setInterval to update text character by character.
 *   Returning a cleanup function (clearInterval) prevents memory leaks
 *   when the component unmounts (user navigates away).
 *
 * Suspense: Shows a fallback while a lazy-loaded component loads.
 *   RetroScene uses Three.js which is large — Suspense lets the page
 *   render immediately while Three.js loads in the background.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Link } from 'react-router-dom';
import { useState, useEffect, Suspense } from 'react';
import RetroScene from '../components/RetroScene';

// Skills to display in the terminal card — reflects actual expertise
const SKILLS = ['Rust', 'CUDA', 'LLM Pipelines', 'Vector DBs', 'RL', 'Agent Frameworks'];

const Home = () => {
    // Typewriter effect state
    const [displayText, setDisplayText] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    // The full text to type out character by character
    const fullText = 'Building intelligence from scratch.';

    // Typewriter animation: adds one character every 80ms
    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index < fullText.length) {
                setDisplayText(fullText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer); // Stop when we've typed the full text
            }
        }, 80);

        // Cleanup function: React calls this when the component unmounts.
        // Without this, the interval would keep running after leaving the page.
        return () => clearInterval(timer);
    }, []); // Empty array = run only once when the component first mounts

    // Cursor blink: toggles showCursor true/false every 530ms
    useEffect(() => {
        const cursorTimer = setInterval(() => {
            setShowCursor(prev => !prev); // Toggle: prev is the old value
        }, 530);
        return () => clearInterval(cursorTimer);
    }, []);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden',
        }}>

            {/* ── Background: 3D Scene ─────────────────────────────────────── */}
            {/*
             * zIndex: 0 puts this behind the hero card.
             * position: 'absolute' takes it out of normal flow so the
             * foreground content can sit on top of it.
             */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                zIndex: 0,
            }}>
                {/* Suspense shows nothing (fallback={null}) while RetroScene loads */}
                <Suspense fallback={null}>
                    <RetroScene />
                </Suspense>
            </div>

            {/* ── Foreground: Hero Card ────────────────────────────────────── */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                pointerEvents: 'none', // Let mouse events pass through to the 3D scene
            }}>
                {/* Terminal card — glass morphism style */}
                <div style={{
                    maxWidth: '620px',
                    width: '100%',
                    padding: '3rem 4rem',
                    border: '2px solid var(--border-primary)',
                    borderRadius: '4px',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(12px)',
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    pointerEvents: 'auto', // Re-enable mouse events for the card
                }}>
                    {/* Fake terminal traffic light buttons (decorative) */}
                    <div style={{
                        position: 'absolute', top: '12px', left: '16px',
                        display: 'flex', gap: '6px',
                    }}>
                        {[0.8, 0.5, 0.3].map((opacity, i) => (
                            <span key={i} style={{
                                width: '10px', height: '10px',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                opacity,
                            }} />
                        ))}
                    </div>

                    {/* Terminal prompt line */}
                    <p style={{
                        fontFamily: 'monospace', fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: '1rem', marginTop: '0.5rem',
                        textAlign: 'center',
                    }}>
                        {'>'} HELLO, WORLD
                    </p>

                    {/* Name */}
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        fontWeight: '800',
                        marginBottom: '0.25rem',
                        lineHeight: 1.1,
                        textAlign: 'center',
                    }}>
                        <span className="gradient-text">Ajay Kumar</span>
                    </h1>

                    {/* Role */}
                    <p style={{
                        fontFamily: 'monospace', fontSize: '1rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        textAlign: 'center',
                    }}>
                        AI / Systems Engineer
                    </p>

                    {/* Typewriter tagline */}
                    <p style={{
                        fontFamily: 'monospace', fontSize: '0.9rem',
                        color: 'var(--accent-primary)',
                        marginBottom: '1.5rem',
                        minHeight: '1.5rem',
                        textAlign: 'center',
                    }}>
                        {'>'} {displayText}
                        {/* Cursor: opacity toggles between 1 and 0 to create blink */}
                        <span style={{ opacity: showCursor ? 1 : 0 }}>▌</span>
                    </p>

                    {/* Skills row */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        justifyContent: 'center',
                        marginBottom: '1.75rem',
                    }}>
                        {SKILLS.map(skill => (
                            <span key={skill} style={{
                                fontFamily: 'monospace',
                                fontSize: '0.7rem',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-secondary)',
                                color: 'var(--text-muted)',
                                borderRadius: '3px',
                                padding: '0.15rem 0.5rem',
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>

                    {/* Separator */}
                    <div style={{
                        fontFamily: 'monospace', fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginBottom: '1.5rem',
                        opacity: 0.4,
                        textAlign: 'center',
                    }}>
                        ══════════════════════════════
                    </div>

                    {/* Navigation links — terminal style */}
                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                    }}>
                        {[
                            { to: '/projects', label: 'PROJECTS', num: '01' },
                            { to: '/blogs', label: 'BLOG', num: '02' },
                            { to: '/lets-train', label: 'TRAIN', num: '03' },
                        ].map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    padding: '0.5rem 0',
                                    borderBottom: '1px dashed var(--border-primary)',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
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
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
                            onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                        >
                            [04] GITHUB
                        </a>
                    </div>
                </div>

                {/* Status bar at the bottom of the screen */}
                <div style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    opacity: 0.6,
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                }}>
                    STATUS: AVAILABLE FOR WORK • CLICK SCREEN FOR EFFECTS ✨
                </div>
            </div>
        </div>
    );
};

export default Home;
