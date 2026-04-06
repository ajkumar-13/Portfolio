import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import BlogEmptyState from '../components/BlogEmptyState';
import BlogStateView from '../components/BlogStateView';
import { api } from '../../../shared/api/api';
import { DJANGO_ADMIN_URL } from '../../../shared/config/env';
import shellStyles from '../../../styles/components.module.css';
import blogStyles from '../styles/blog.module.css';

/**
 * Blogs Page Component
 * 
 * Displays all blog series in a grid layout.
 * Each series card links to its individual page.
 */
const BlogsPage = () => {
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
        return <BlogStateView icon="⏳" message="Loading blog series..." />;
    }

    if (error) {
        return <BlogStateView icon="❌" message={error} />;
    }

    return (
        <div className="container">
            {/* Page Header */}
            <div className={`${shellStyles.sectionHeader} ${blogStyles.pageHeader}`}>
                <span className={shellStyles.sectionLabel}>📖 Blog</span>
                <h1 className={shellStyles.sectionTitle}>
                    Thoughts & <span className="gradient-text">Tutorials</span>
                </h1>
                <p className={shellStyles.sectionDescription}>
                    Deep dives into AI/ML concepts, tutorials, and my learning journey
                </p>
            </div>

            {/* Series Grid */}
            <div className={blogStyles.seriesGrid}>
                {series.map((seriesItem) => (
                    <Link key={seriesItem.id} to={`/blogs/series/${seriesItem.id}`} className={blogStyles.seriesCardLink}>
                        <article className={`${shellStyles.card} ${blogStyles.seriesCard}`}>
                            {seriesItem.cover_image && (
                                <img
                                    src={api.getImageUrl(seriesItem.cover_image)}
                                    alt={seriesItem.title}
                                    className={`${shellStyles.cardImage} ${blogStyles.seriesCardImage}`}
                                />
                            )}
                            {!seriesItem.cover_image && (
                                <div
                                    className={`${shellStyles.cardImage} ${blogStyles.seriesPlaceholder}`}
                                >
                                    📚
                                </div>
                            )}
                            <div className={shellStyles.cardContent}>
                                <h2 className={shellStyles.cardTitle}>{seriesItem.title}</h2>
                                <p className={shellStyles.cardExcerpt}>{seriesItem.description}</p>
                                <div className={shellStyles.cardMeta}>
                                    <span>📝 {seriesItem.post_count || 0} articles</span>
                                    <span className={blogStyles.metaAction}>Read Series →</span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {/* Empty State */}
            {series.length === 0 && (
                <BlogEmptyState
                    icon="📝"
                    title="No Blog Series Yet"
                    message="Create your first series in the Admin panel to get started."
                >
                    <a
                        href={DJANGO_ADMIN_URL}
                        target="_blank"
                        rel="noreferrer"
                        className={shellStyles.btnPrimary}
                    >
                        Open Django Admin
                    </a>
                </BlogEmptyState>
            )}
        </div>
    );
};

export default BlogsPage;
