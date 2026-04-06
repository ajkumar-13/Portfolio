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

import shellStyles from '../../../styles/components.module.css';
import trainingStyles from '../styles/training.module.css';

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
        <div className={`container ${trainingStyles.page}`}>

            {/* Page Header */}
            <header className={trainingStyles.header}>
                <span className={shellStyles.sectionLabel}>COMING SOON</span>
                <h1 className={trainingStyles.title}>
                    Let's Train
                </h1>
                <p className={trainingStyles.intro}>
                    An interactive playground to train reinforcement learning agents in the browser
                    — no setup, no GPU required.
                </p>

                {/* Status badge */}
                <div className={trainingStyles.statusBadge}>
                    {/* Pulsing amber dot to indicate "in progress" status */}
                    <span className={trainingStyles.statusDot} />
                    In Development
                </div>
            </header>

            {/* Planned Features Grid */}
            <div className={trainingStyles.featuresGrid}>
                {PLANNED_FEATURES.map(feature => (
                    <article key={feature.title} className={trainingStyles.featureCard}>
                        <div className={trainingStyles.featureIcon}>
                            {feature.icon}
                        </div>
                        <h3 className={trainingStyles.featureTitle}>
                            {feature.title}
                        </h3>
                        <p className={trainingStyles.featureDescription}>
                            {feature.description}
                        </p>
                    </article>
                ))}
            </div>

            {/* Blog CTA — drive users to read related content while they wait */}
            <div className={trainingStyles.callout}>
                <p className={trainingStyles.calloutText}>
                    While you wait, explore the blog for deep-dives into the algorithms that will power this playground.
                </p>
                <Link to="/blogs" className={shellStyles.btnPrimary}>
                    Read the Blog
                </Link>
            </div>
        </div>
    );
};

export default LetsTrainPage;
