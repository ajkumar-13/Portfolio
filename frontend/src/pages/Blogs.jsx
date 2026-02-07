import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import styles from '../styles/components.module.css';

/**
 * Blogs Page Component
 * 
 * Displays all blog series in a grid layout.
 * Each series card links to its individual page.
 */
const Blogs = () => {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch series on component mount
    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const data = await api.getSeries();
                setSeries(data);
            } catch (err) {
                setError('Failed to load blog series');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading blog series...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Page Header */}
            <div className={styles.sectionHeader} style={{ paddingTop: '2rem' }}>
                <span className={styles.sectionLabel}>📖 Blog</span>
                <h1 className={styles.sectionTitle}>
                    Thoughts & <span className="gradient-text">Tutorials</span>
                </h1>
                <p className={styles.sectionDescription}>
                    Deep dives into AI/ML concepts, tutorials, and my learning journey
                </p>
            </div>

            {/* Series Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '2rem',
                padding: '2rem 0 4rem'
            }}>
                {series.map(s => (
                    <Link key={s.id} to={`/blogs/series/${s.id}`} style={{ textDecoration: 'none' }}>
                        <article className={styles.card}>
                            {s.cover_image && (
                                <div
                                    className={styles.cardImage}
                                    style={{
                                        backgroundImage: `url(${api.getImageUrl(s.cover_image)})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />
                            )}
                            {!s.cover_image && (
                                <div className={styles.cardImage} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--gradient-glow)',
                                    fontSize: '3rem'
                                }}>
                                    📚
                                </div>
                            )}
                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>{s.title}</h2>
                                <p className={styles.cardExcerpt}>{s.description}</p>
                                <div className={styles.cardMeta}>
                                    <span>📝 {s.blogs?.length || 0} articles</span>
                                    <span style={{ color: 'var(--accent-primary)' }}>Read Series →</span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {/* Empty State */}
            {series.length === 0 && (
                <div className="glass-card" style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    marginBottom: '4rem'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>No Blog Series Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Create your first series in the Admin panel to get started.
                    </p>
                    <Link to="/admin" className={styles.btnPrimary}>
                        Go to Admin
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Blogs;
