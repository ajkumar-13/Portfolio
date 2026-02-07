import { Link } from 'react-router-dom';
import styles from '../styles/components.module.css';

/**
 * Home Page Component
 * 
 * The landing page featuring:
 * - Hero section with AI-themed introduction
 * - Animated background effects
 * - Call-to-action buttons
 * 
 * This is the first thing visitors see!
 */
const Home = () => {
    return (
        <div className="container">
            {/* Hero Section */}
            <section style={{
                minHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* AI Badge */}
                <div className={styles.sectionLabel}>
                    🤖 AI / ML Engineer & Developer
                </div>

                {/* Main Heading */}
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    lineHeight: 1.1
                }}>
                    Hi, I'm{' '}
                    <span className="gradient-text">Ajay Kumar</span>
                </h1>

                {/* Subheading */}
                <h2 style={{
                    fontSize: 'clamp(1.2rem, 3vw, 1.75rem)',
                    fontWeight: '400',
                    color: 'var(--text-secondary)',
                    marginBottom: '2rem',
                    maxWidth: '700px',
                    lineHeight: 1.5
                }}>
                    Building intelligent systems at the intersection of{' '}
                    <strong style={{ color: 'var(--accent-primary)' }}>Machine Learning</strong>,{' '}
                    <strong style={{ color: 'var(--accent-secondary)' }}>Deep Learning</strong>, and{' '}
                    <strong style={{ color: 'var(--accent-tertiary)' }}>Web Technologies</strong>
                </h2>

                {/* Description */}
                <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-muted)',
                    maxWidth: '600px',
                    marginBottom: '2.5rem',
                    lineHeight: 1.7
                }}>
                    Passionate about transforming ideas into production-ready AI solutions.
                    From neural networks to full-stack applications, I build technology that makes a difference.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/work" className={styles.btnPrimary}>
                        <span>View Projects</span>
                        <span>→</span>
                    </Link>
                    <Link to="/blogs" className={styles.btnSecondary}>
                        <span>📖</span>
                        <span>Read Blog</span>
                    </Link>
                    <a
                        href="https://github.com/ajkumar-13"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnSecondary}
                    >
                        <span>⭐</span>
                        <span>GitHub</span>
                    </a>
                </div>

                {/* Scroll indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Scroll to explore ↓
                    </span>
                </div>
            </section>

            {/* Skills/Tech Stack Section */}
            <section style={{ padding: '4rem 0' }}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionLabel}>💡 Tech Stack</span>
                    <h2 className={styles.sectionTitle}>
                        Technologies I <span className="gradient-text">Work With</span>
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1rem',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    {[
                        { name: 'Python', icon: '🐍' },
                        { name: 'PyTorch', icon: '🔥' },
                        { name: 'TensorFlow', icon: '🧠' },
                        { name: 'React', icon: '⚛️' },
                        { name: 'FastAPI', icon: '⚡' },
                        { name: 'OpenCV', icon: '👁️' },
                        { name: 'Docker', icon: '🐳' },
                        { name: 'Git', icon: '📂' },
                    ].map((tech, i) => (
                        <div key={i} className="glass-card" style={{
                            padding: '1.5rem 1rem',
                            textAlign: 'center',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{tech.icon}</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{tech.name}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
