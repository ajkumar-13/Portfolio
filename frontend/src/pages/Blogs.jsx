import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import styles from '../styles/components.module.css';

const Blogs = () => {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">Error: {error}</div>;

    return (
        <div className="container">
            <h1 style={{ margin: '2rem 0 3rem' }}>Blog Series</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {series.map(s => (
                    <Link key={s.id} to={`/blogs/series/${s.id}`} className={styles.blogCard}>
                        {s.cover_image && (
                            <div style={{
                                height: '200px',
                                background: `url(${api.getImageUrl(s.cover_image)}) center/cover no-repeat`
                            }} />
                        )}
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>{s.title}</h2>
                            <p className={styles.cardExcerpt}>{s.description}</p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                View Series &rarr;
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {series.length === 0 && (
                <p>No blog series found. Coming soon!</p>
            )}
        </div>
    );
};

export default Blogs;
