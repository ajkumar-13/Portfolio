import { useState, useEffect } from 'react';
import { api } from '../services/api';
import styles from '../styles/components.module.css';

/**
 * Admin Page Component
 * 
 * Management interface for blog content.
 * Features:
 * - Create/delete blog series
 * - Create/delete blog posts
 * - Markdown editor for content
 */
const Admin = () => {
    const [seriesList, setSeriesList] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSeriesForm, setShowSeriesForm] = useState(false);
    const [showBlogForm, setShowBlogForm] = useState(false);
    const [seriesForm, setSeriesForm] = useState({ title: '', description: '' });
    const [blogForm, setBlogForm] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        order: 0
    });

    useEffect(() => {
        fetchSeries();
    }, []);

    const fetchSeries = async () => {
        try {
            const data = await api.getSeries();
            setSeriesList(data);
        } catch (err) {
            console.error('Failed to fetch series:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSeries = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/series', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seriesForm)
            });
            if (response.ok) {
                setSeriesForm({ title: '', description: '' });
                setShowSeriesForm(false);
                fetchSeries();
            }
        } catch (err) {
            console.error('Failed to create series:', err);
        }
    };

    const handleCreateBlog = async (e) => {
        e.preventDefault();
        if (!selectedSeries) return;

        try {
            const response = await fetch('http://localhost:8000/api/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...blogForm,
                    series_id: selectedSeries.id
                })
            });
            if (response.ok) {
                setBlogForm({ title: '', slug: '', content: '', excerpt: '', order: 0 });
                setShowBlogForm(false);
                const updated = await api.getSeriesById(selectedSeries.id);
                setSelectedSeries(updated);
                fetchSeries();
            }
        } catch (err) {
            console.error('Failed to create blog:', err);
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!confirm('Delete this blog?')) return;

        try {
            await fetch(`http://localhost:8000/api/blogs/${blogId}`, { method: 'DELETE' });
            const updated = await api.getSeriesById(selectedSeries.id);
            setSelectedSeries(updated);
        } catch (err) {
            console.error('Failed to delete blog:', err);
        }
    };

    const handleViewSeries = async (series) => {
        try {
            const data = await api.getSeriesById(series.id);
            setSelectedSeries(data);
        } catch (err) {
            console.error('Failed to fetch series details:', err);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>⚙️ Admin</span>
                <h1 className={styles.sectionTitle}>
                    Content <span className="gradient-text">Manager</span>
                </h1>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '320px 1fr',
                gap: '2rem',
                marginTop: '2rem'
            }}>
                {/* Left Panel - Series List */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>📚 Series</h2>
                        <button
                            className={styles.btnPrimary}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => setShowSeriesForm(!showSeriesForm)}
                        >
                            + New
                        </button>
                    </div>

                    {showSeriesForm && (
                        <form onSubmit={handleCreateSeries} style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                placeholder="Series Title"
                                value={seriesForm.title}
                                onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    marginBottom: '0.75rem',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)'
                                }}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={seriesForm.description}
                                onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    marginBottom: '0.75rem',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <button type="submit" className={styles.btnPrimary} style={{ width: '100%' }}>
                                Create Series
                            </button>
                        </form>
                    )}

                    <div>
                        {seriesList.map(series => (
                            <div
                                key={series.id}
                                onClick={() => handleViewSeries(series)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '0.5rem',
                                    cursor: 'pointer',
                                    background: selectedSeries?.id === series.id
                                        ? 'var(--gradient-glow)'
                                        : 'transparent',
                                    border: '1px solid',
                                    borderColor: selectedSeries?.id === series.id
                                        ? 'var(--accent-primary)'
                                        : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                                    {series.title}
                                </strong>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {series.blogs?.length || 0} articles
                                </span>
                            </div>
                        ))}
                        {seriesList.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                                No series yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Panel - Selected Series */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    {selectedSeries ? (
                        <>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <h2 style={{ fontSize: '1.25rem' }}>
                                    <span className="gradient-text">{selectedSeries.title}</span>
                                </h2>
                                <button
                                    className={styles.btnPrimary}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                    onClick={() => setShowBlogForm(!showBlogForm)}
                                >
                                    + New Article
                                </button>
                            </div>

                            {showBlogForm && (
                                <form onSubmit={handleCreateBlog} style={{
                                    marginBottom: '1.5rem',
                                    padding: '1.5rem',
                                    background: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Article Title"
                                            value={blogForm.title}
                                            onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-secondary)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)'
                                            }}
                                            required
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                placeholder="slug-url-format"
                                                value={blogForm.slug}
                                                onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-secondary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-primary)'
                                                }}
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Order"
                                                value={blogForm.order}
                                                onChange={(e) => setBlogForm({ ...blogForm, order: parseInt(e.target.value) || 0 })}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-secondary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Short excerpt for preview"
                                            value={blogForm.excerpt}
                                            onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-secondary)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                        <textarea
                                            placeholder="Write your content in Markdown..."
                                            value={blogForm.content}
                                            onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                                            style={{
                                                width: '100%',
                                                minHeight: '200px',
                                                padding: '1rem',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-secondary)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--text-primary)',
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.9rem',
                                                resize: 'vertical'
                                            }}
                                            required
                                        />
                                        <button type="submit" className={styles.btnPrimary}>
                                            Publish Article
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div>
                                {selectedSeries.blogs && selectedSeries.blogs.length > 0 ? (
                                    selectedSeries.blogs.map(blog => (
                                        <div key={blog.id} style={{
                                            padding: '1rem',
                                            marginBottom: '0.75rem',
                                            background: 'var(--bg-primary)',
                                            borderRadius: 'var(--radius-sm)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <strong style={{ display: 'block' }}>{blog.title}</strong>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    /{blog.slug}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a
                                                    href={`/blogs/${blog.slug}`}
                                                    target="_blank"
                                                    className={styles.btnSecondary}
                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                                                >
                                                    View
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteBlog(blog.id)}
                                                    style={{
                                                        padding: '0.5rem 0.75rem',
                                                        background: 'rgba(220, 38, 38, 0.2)',
                                                        color: '#f87171',
                                                        border: '1px solid rgba(220, 38, 38, 0.3)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                        No articles yet. Create your first one!
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '300px',
                            color: 'var(--text-muted)'
                        }}>
                            ← Select a series to manage
                        </div>
                    )}
                </div>
            </div>

            {/* Tips */}
            <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>💡 Quick Tips</h3>
                <ul style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 2,
                    paddingLeft: '1.5rem'
                }}>
                    <li>Upload images to <code style={{
                        background: 'var(--bg-primary)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px'
                    }}>backend/uploads/blogs/your-slug/</code></li>
                    <li>Reference in markdown: <code style={{
                        background: 'var(--bg-primary)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px'
                    }}>![Alt](/api/uploads/blogs/slug/image.png)</code></li>
                    <li>
                        <a
                            href="http://localhost:8000/docs"
                            target="_blank"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            Open FastAPI Swagger UI
                        </a>
                        {' '}for advanced API operations
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Admin;
