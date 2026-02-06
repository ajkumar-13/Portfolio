import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { parseMarkdown } from '../utils/markdown';
import styles from '../styles/components.module.css';

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

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">Error: {error}</div>;
    if (!blog) return <div className="container">Blog not found</div>;

    return (
        <article className="container" style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.2 }}>{blog.title}</h1>
                {blog.created_at && (
                    <time style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(blog.created_at).toLocaleDateString()}
                    </time>
                )}
            </header>

            {blog.cover_image && (
                <img
                    src={api.getImageUrl(blog.cover_image)}
                    alt={blog.title}
                    style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '3rem'
                    }}
                />
            )}

            <div
                className="markdown-content"
                style={{
                    fontSize: '1.1rem',
                    lineHeight: 1.8
                }}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(blog.content) }}
            />
        </article>
    );
};

export default BlogPost;
