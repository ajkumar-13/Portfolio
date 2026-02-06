import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import styles from '../styles/components.module.css';

const BlogSeries = () => {
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

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">Error: {error}</div>;
    if (!series) return <div className="container">Series not found</div>;

    return (
        <div className="container">
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{series.title}</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                    {series.description}
                </p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {series.blogs && series.blogs.map((blog, index) => (
                    <Link
                        key={blog.id}
                        to={`/blogs/${blog.slug}`}
                        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                    >
                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            alignItems: 'center',
                            transition: 'transform 0.2s'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: 'var(--color-text-secondary)',
                                opacity: 0.3
                            }}>
                                {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{blog.title}</h2>
                                <p style={{ color: 'var(--color-text-secondary)' }}>{blog.excerpt}</p>
                            </div>
                        </div>
                    </Link>
                ))}
                {(!series.blogs || series.blogs.length === 0) && (
                    <p style={{ textAlign: 'center' }}>No blogs in this series yet.</p>
                )}
            </div>
        </div>
    );
};

export default BlogSeries;
