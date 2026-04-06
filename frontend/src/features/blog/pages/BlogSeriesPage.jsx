import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import BlogEmptyState from '../components/BlogEmptyState';
import BlogStateView from '../components/BlogStateView';
import { api } from '../../../shared/api/api';
import shellStyles from '../../../styles/components.module.css';
import blogStyles from '../styles/blog.module.css';

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
        return <BlogStateView icon="⏳" message="Loading series..." />;
    }

    if (error || !series) {
        return <BlogStateView icon="❌" message={error || 'Series not found'} />;
    }

    return (
        <div className="container">
            {/* Series Header */}
            <div className={`${shellStyles.sectionHeader} ${blogStyles.pageHeader}`}>
                <Link to="/blogs" className={blogStyles.backLink}>
                    ← Back to all series
                </Link>
                <h1 className={shellStyles.sectionTitle}>
                    <span className="gradient-text">{series.title}</span>
                </h1>
                <p className={shellStyles.sectionDescription}>
                    {series.description}
                </p>
            </div>

            {/* Articles List */}
            <div className={blogStyles.seriesList}>
                {series.posts && series.posts.length > 0 ? (
                    series.posts.map((blog, index) => (
                        <Link
                            key={blog.id}
                            to={`/blogs/${blog.slug}`}
                            className={blogStyles.seriesItemLink}
                        >
                            <article
                                className={`${shellStyles.card} ${blogStyles.seriesItemCard}`}
                            >
                                {/* Order Number */}
                                <div className={blogStyles.seriesOrder}>
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>

                                {/* Content */}
                                <div className={`${shellStyles.cardContent} ${blogStyles.seriesItemContent}`}>
                                    <h2 className={shellStyles.cardTitle}>{blog.title}</h2>
                                    <p className={shellStyles.cardExcerpt}>{blog.excerpt}</p>
                                    <span className={blogStyles.seriesAction}>
                                        Read article →
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))
                ) : (
                    <BlogEmptyState
                        icon="🗂️"
                        title="No Articles Yet"
                        message="This series exists, but it does not have any published articles yet."
                        className={blogStyles.seriesEmpty}
                    />
                )}
            </div>
        </div>
    );
};

export default BlogSeriesPage;
