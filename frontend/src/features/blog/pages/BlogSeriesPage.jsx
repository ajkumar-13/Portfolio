import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../shared/api/api';
import styles from '../../../styles/components.module.css';

/**
 * BlogSeries Page Component
 * 
 * Displays a blog series with all its articles listed.
 */
const BlogSeriesPage = () => {
    const { id } = useParams();
    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const data = await api.getSeriesById(id);
                setSeries(data);
            } catch (err) {
                setError('Failed to load series');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
    }, [id]);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading series...</p>
            </div>
        );
    }

    if (error || !series) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>{error || 'Series not found'}</p>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Series Header */}
            <div className={styles.sectionHeader} style={{ paddingTop: '2rem' }}>
                <Link to="/blogs" style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    display: 'inline-block'
                }}>
                    ← Back to all series
                </Link>
                <h1 className={styles.sectionTitle}>
                    <span className="gradient-text">{series.title}</span>
                </h1>
                <p className={styles.sectionDescription}>
                    {series.description}
                </p>
            </div>

            {/* Articles List */}
            <div style={{ maxWidth: '800px', margin: '2rem auto 4rem' }}>
                {series.posts && series.posts.length > 0 ? (
                    series.posts.map((blog, index) => (
                        <Link
                            key={blog.id}
                            to={`/blogs/${blog.slug}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <article
                                className={styles.card}
                                style={{
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'stretch'
                                }}
                            >
                                {/* Order Number */}
                                <div style={{
                                    width: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--gradient-glow)',
                                    borderRight: '1px solid var(--border-secondary)',
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--text-muted)',
                                    flexShrink: 0
                                }}>
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>

                                {/* Content */}
                                <div className={styles.cardContent} style={{ flex: 1 }}>
                                    <h2 className={styles.cardTitle}>{blog.title}</h2>
                                    <p className={styles.cardExcerpt}>{blog.excerpt}</p>
                                    <span style={{
                                        color: 'var(--accent-primary)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}>
                                        Read article →
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))
                ) : (
                    <div className="glass-card" style={{
                        textAlign: 'center',
                        padding: '3rem'
                    }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            No articles in this series yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogSeriesPage;
