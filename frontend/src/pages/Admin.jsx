import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Admin Page Component
 * 
 * This page allows you to:
 * - View all blog series and blogs
 * - Create new series and blogs
 * - Edit existing blogs
 * - Delete series and blogs
 * 
 * Note: In production, this should be protected with authentication!
 */
const Admin = () => {
    // State for series list
    const [seriesList, setSeriesList] = useState([]);
    // State for the currently selected series (to see its blogs)
    const [selectedSeries, setSelectedSeries] = useState(null);
    // State for loading indicator
    const [loading, setLoading] = useState(true);
    // State for showing forms
    const [showSeriesForm, setShowSeriesForm] = useState(false);
    const [showBlogForm, setShowBlogForm] = useState(false);
    // Form data states
    const [seriesForm, setSeriesForm] = useState({ title: '', description: '' });
    const [blogForm, setBlogForm] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        order: 0
    });

    // Fetch all series when component mounts
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

    // Create a new series
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
                fetchSeries(); // Refresh the list
            }
        } catch (err) {
            console.error('Failed to create series:', err);
        }
    };

    // Create a new blog
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
                // Refresh selected series to see new blog
                const updated = await api.getSeriesById(selectedSeries.id);
                setSelectedSeries(updated);
                fetchSeries();
            }
        } catch (err) {
            console.error('Failed to create blog:', err);
        }
    };

    // Delete a blog
    const handleDeleteBlog = async (blogId) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;

        try {
            await fetch(`http://localhost:8000/api/blogs/${blogId}`, {
                method: 'DELETE'
            });
            // Refresh
            const updated = await api.getSeriesById(selectedSeries.id);
            setSelectedSeries(updated);
        } catch (err) {
            console.error('Failed to delete blog:', err);
        }
    };

    // View a series (load its blogs)
    const handleViewSeries = async (series) => {
        try {
            const data = await api.getSeriesById(series.id);
            setSelectedSeries(data);
        } catch (err) {
            console.error('Failed to fetch series details:', err);
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    // Styles for this page
    const styles = {
        container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
        grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' },
        panel: {
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '1.5rem'
        },
        button: {
            padding: '0.5rem 1rem',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '0.5rem'
        },
        dangerButton: {
            padding: '0.5rem 1rem',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        input: {
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            background: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            color: 'var(--color-text)'
        },
        textarea: {
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            background: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            color: 'var(--color-text)',
            minHeight: '200px',
            fontFamily: 'monospace'
        },
        listItem: {
            padding: '1rem',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={{ marginBottom: '2rem' }}>📝 Admin Panel</h1>

            <div style={styles.grid}>
                {/* Left Panel - Series List */}
                <div style={styles.panel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Blog Series</h2>
                        <button style={styles.button} onClick={() => setShowSeriesForm(!showSeriesForm)}>
                            + New Series
                        </button>
                    </div>

                    {/* New Series Form */}
                    {showSeriesForm && (
                        <form onSubmit={handleCreateSeries} style={{ marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Series Title"
                                value={seriesForm.title}
                                onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={seriesForm.description}
                                onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                                style={styles.input}
                            />
                            <button type="submit" style={styles.button}>Create</button>
                        </form>
                    )}

                    {/* Series List */}
                    <div>
                        {seriesList.map(series => (
                            <div
                                key={series.id}
                                style={{
                                    ...styles.listItem,
                                    background: selectedSeries?.id === series.id ? 'var(--color-surface-hover)' : 'transparent'
                                }}
                                onClick={() => handleViewSeries(series)}
                            >
                                <strong>{series.title}</strong>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                    {series.blogs?.length || 0} blogs
                                </p>
                            </div>
                        ))}
                        {seriesList.length === 0 && (
                            <p style={{ color: 'var(--color-text-secondary)' }}>No series yet. Create one!</p>
                        )}
                    </div>
                </div>

                {/* Right Panel - Selected Series & Blogs */}
                <div style={styles.panel}>
                    {selectedSeries ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2>{selectedSeries.title}</h2>
                                <button style={styles.button} onClick={() => setShowBlogForm(!showBlogForm)}>
                                    + New Blog
                                </button>
                            </div>

                            {/* New Blog Form */}
                            {showBlogForm && (
                                <form onSubmit={handleCreateBlog} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-background)', borderRadius: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Blog Title"
                                        value={blogForm.title}
                                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                        style={styles.input}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Slug (e.g., my-first-blog)"
                                        value={blogForm.slug}
                                        onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                                        style={styles.input}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Short excerpt"
                                        value={blogForm.excerpt}
                                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                                        style={styles.input}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Order (0, 1, 2...)"
                                        value={blogForm.order}
                                        onChange={(e) => setBlogForm({ ...blogForm, order: parseInt(e.target.value) || 0 })}
                                        style={styles.input}
                                    />
                                    <textarea
                                        placeholder="Write your blog content in Markdown..."
                                        value={blogForm.content}
                                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                                        style={styles.textarea}
                                        required
                                    />
                                    <button type="submit" style={styles.button}>Create Blog</button>
                                </form>
                            )}

                            {/* Blogs List */}
                            <div>
                                {selectedSeries.blogs && selectedSeries.blogs.length > 0 ? (
                                    selectedSeries.blogs.map(blog => (
                                        <div key={blog.id} style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid var(--color-border)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <strong>{blog.title}</strong>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                                    /{blog.slug} • Order: {blog.order}
                                                </p>
                                            </div>
                                            <div>
                                                <a
                                                    href={`/blogs/${blog.slug}`}
                                                    target="_blank"
                                                    style={{ ...styles.button, textDecoration: 'none', display: 'inline-block' }}
                                                >
                                                    View
                                                </a>
                                                <button
                                                    style={styles.dangerButton}
                                                    onClick={() => handleDeleteBlog(blog.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--color-text-secondary)' }}>No blogs in this series yet.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            ← Select a series to view and manage its blogs
                        </p>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px' }}>
                <h3>📌 Quick Tips</h3>
                <ul style={{ color: 'var(--color-text-secondary)', lineHeight: 2 }}>
                    <li>To add images: Upload to <code>backend/uploads/blogs/your-slug/</code> folder</li>
                    <li>Reference in markdown: <code>![Alt](/api/uploads/blogs/your-slug/image.png)</code></li>
                    <li>Use the <a href="http://localhost:8000/docs" target="_blank" style={{ color: 'var(--color-primary)' }}>FastAPI Swagger UI</a> for advanced API operations</li>
                </ul>
            </div>
        </div>
    );
};

export default Admin;
