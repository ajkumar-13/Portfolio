/**
 * LetsTrain.jsx — Reinforcement Learning Playground (Coming Soon)
 *
 * This page is a placeholder for the future "Let's Train" feature:
 * an interactive environment where visitors can train RL agents in the browser
 * and learn core concepts through experimentation.
 *
 * REACT CONCEPT: Static / Placeholder Pages
 * ─────────────────────────────────────────────────────────────────────────────
 * Not every page needs state or API calls. Sometimes you just render markup.
 * This component has no hooks (useState, useEffect) because nothing here
 * changes — it's purely presentational.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Link } from 'react-router-dom';

import styles from '../../../styles/components.module.css';

// Planned features to display on the coming soon page
const PLANNED_FEATURES = [
    {
        icon: '🤖',
        title: 'Train RL Agents',
        description: 'Watch agents learn to solve classic environments like CartPole, MountainCar, and custom grids in real time.',
    },
    {
        icon: '📊',
        title: 'Live Training Metrics',
        description: 'See reward curves, episode lengths, and policy entropy update live as the agent explores and learns.',
    },
    {
        icon: '🧠',
        title: 'Algorithm Selector',
        description: 'Compare DQN, PPO, A3C and other algorithms on the same environment to understand their trade-offs.',
    },
    {
        icon: '🎮',
        title: 'Interactive Environment',
        description: 'Step through individual frames, pause training, and override agent actions to build intuition.',
    },
];

const LetsTrainPage = () => {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>

            {/* Page Header */}
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <span className={styles.sectionLabel}>COMING SOON</span>
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: '800',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                }}>
                    Let's Train
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.1rem',
                    maxWidth: '580px',
                    margin: '0 auto 2rem',
                    lineHeight: 1.7,
                }}>
                    An interactive playground to train reinforcement learning agents in the browser
                    — no setup, no GPU required.
                </p>

                {/* Status badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '999px',
                    padding: '0.4rem 1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                }}>
                    {/* Pulsing amber dot to indicate "in progress" status */}
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#f59e0b',
                        display: 'inline-block',
                        animation: 'pulse 2s infinite',
                    }} />
                    In Development
                </div>
            </header>

            {/* Planned Features Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.25rem',
                maxWidth: '900px',
                margin: '0 auto 4rem',
            }}>
                {PLANNED_FEATURES.map(feature => (
                    <div
                        key={feature.title}
                        style={{
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.5rem',
                            opacity: 0.85, // Slightly dimmed to reinforce "not yet available"
                        }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                            {feature.icon}
                        </div>
                        <h3 style={{
                            fontSize: '1.05rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                        }}>
                            {feature.title}
                        </h3>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            lineHeight: 1.6,
                            margin: 0,
                        }}>
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Blog CTA — drive users to read related content while they wait */}
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '500px',
                margin: '0 auto',
            }}>
                <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    fontSize: '0.95rem',
                }}>
                    While you wait, explore the blog for deep-dives into the algorithms that will power this playground.
                </p>
                <Link to="/blogs" className={styles.btnPrimary}>
                    Read the Blog
                </Link>
            </div>
        </div>
    );
};

export default LetsTrainPage;
