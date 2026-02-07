import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { parseMarkdown } from '../utils/markdown';
import styles from '../styles/components.module.css';

/**
 * BlogPost Page Component
 * 
 * Displays a single blog post with:
 * - Title and metadata
 * - Cover image (if any)
 * - Markdown content rendered as HTML
 */
const BlogPost = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const data = await api.getBlogBySlug(slug);
                setBlog(data);
            } catch (err) {
                setError('Failed to load blog post');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading article...</p>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>{error || 'Blog not found'}</p>
            </div>
        );
    }

    return (
        <article className="container" style={{ maxWidth: '800px', padding: '2rem 1.5rem 4rem' }}>
            {/* Article Header */}
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <span className={styles.sectionLabel}>📖 Article</span>
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: '700',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    lineHeight: 1.2
                }}>
                    {blog.title}
                </h1>
                {blog.created_at && (
                    <time style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        Published {new Date(blog.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </time>
                )}
            </header>

            {/* Cover Image */}
            {blog.cover_image && (
                <img
                    src={api.getImageUrl(blog.cover_image)}
                    alt={blog.title}
                    style={{
                        width: '100%',
                        maxHeight: '450px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '3rem',
                        border: '1px solid var(--border-secondary)'
                    }}
                />
            )}

            {/* Markdown Content */}
            <div
                className="markdown-content"
                style={{
                    fontSize: '1.125rem',
                    lineHeight: 1.8,
                    color: 'var(--text-primary)'
                }}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(blog.content) }}
            />

            {/* Article Footer */}
            <footer style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border-secondary)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Thanks for reading! 🎉
                </p>
                <a
                    href="https://github.com/ajkumar-13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnSecondary}
                >
                    Follow on GitHub
                </a>
            </footer>
        </article>
    );
};

export default BlogPost;
