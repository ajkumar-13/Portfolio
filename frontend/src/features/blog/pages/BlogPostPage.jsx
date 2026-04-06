/**
 * BlogPost.jsx — Single Blog Post Page with AI Chat Panel
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LAYOUT
 * ─────────────────────────────────────────────────────────────────────────────
 * When chat is closed (default):
 *   [ Blog Content — full width ]   [💬 floating button]
 *
 * When chat is open:
 *   [ Blog Content — 65% ] | [ Chat Panel — 35% ]
 *
 * The split is controlled by the `chatOpen` state variable.
 *
 * REACT CONCEPTS
 * ─────────────────────────────────────────────────────────────────────────────
 * useParams(): reads URL parameters from React Router.
 *   Route defined in app/AppRouter.jsx: /blogs/:slug
 *   useParams() returns: { slug: 'the-actual-slug-from-url' }
 *
 * Conditional rendering: JSX can include conditions with &&
 *   { chatOpen && <ChatPanel /> }
 *   → renders ChatPanel only when chatOpen is true
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MarkdownContent from '../components/MarkdownContent';
import { api } from '../../../shared/api/api';
import styles from '../../../styles/components.module.css';

const ChatPanel = lazy(() => import('../components/ChatPanel'));

const BlogPostPage = () => {
    // useParams extracts the :slug part from the URL
    // If URL is /blogs/attention-mechanisms, slug = "attention-mechanisms"
    const { slug } = useParams();

    // Blog data loaded from the API
    const [blog, setBlog] = useState(null);

    // Loading and error states for the fetch
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Controls whether the chat panel is visible
    // Starts as false (closed) — user must click the button to open
    const [chatOpen, setChatOpen] = useState(false);

    // useEffect runs after the component mounts (appears on screen).
    // The [slug] dependency means: re-run this effect if slug changes
    // (e.g., user navigates from one blog post to another).
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // Call our api.js service to GET /api/blogs/{slug}/
                const data = await api.getBlogBySlug(slug);
                setBlog(data);
            } catch (err) {
                setError('Failed to load blog post');
                console.error(err);
            } finally {
                // setLoading(false) runs whether the fetch succeeded or failed
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    Loading article...
                </p>
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error || !blog) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>{error || 'Blog not found'}</p>
            </div>
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        // Outer wrapper: full width, flex row to place blog + chat side by side
        <div style={{
            display: 'flex',
            width: '100%',
            minHeight: 'calc(100vh - 80px)', // Full height minus the header
            position: 'relative',
        }}>

            {/* ── Blog Content Area ─────────────────────────────────────────── */}
            {/*
             * flex: 1 means "take up all remaining space in the flex row".
             * When the chat panel appears beside it, the blog shrinks to ~65%.
             * The transition makes this animation smooth.
             */}
            <div style={{
                flex: 1,
                minWidth: 0, // Prevents flex children from overflowing
                transition: 'all 0.3s ease',
                overflowX: 'hidden',
            }}>
                <article style={{
                    maxWidth: chatOpen ? '700px' : '800px',
                    margin: '0 auto',
                    padding: '2rem 1.5rem 4rem',
                    transition: 'max-width 0.3s ease',
                }}>

                    {/* ── Article Header ─────────────────────────────────── */}
                    <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span className={styles.sectionLabel}>📖 Article</span>
                        {/* Series breadcrumb — shows which series this post belongs to */}
                        {blog.series_title && (
                            <p style={{
                                color: 'var(--accent-primary)',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                marginTop: '0.5rem',
                                marginBottom: '0.5rem',
                            }}>
                                {blog.series_title}
                            </p>
                        )}
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: '700',
                            marginTop: '0.5rem',
                            marginBottom: '1rem',
                            lineHeight: 1.2,
                        }}>
                            {blog.title}
                        </h1>
                        {blog.created_at && (
                            <time style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {/* Format the ISO date string into "March 7, 2026" */}
                                Published {new Date(blog.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </time>
                        )}
                    </header>

                    {/* ── Cover Image ────────────────────────────────────── */}
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
                                border: '1px solid var(--border-secondary)',
                            }}
                        />
                    )}

                    {/* ── Markdown Content ───────────────────────────────── */}
                    {/*
                     * dangerouslySetInnerHTML renders a raw HTML string.
                     * The name "dangerously" is React's reminder that you should
                     * ONLY use this with content you control (like your own posts).
                     * Never use it with user-submitted content — it enables XSS attacks.
                     *
                     * parseMarkdown() converts Markdown text to HTML using marked.js.
                     */}
                    <MarkdownContent content={blog.content} />

                    {/* ── Article Footer ─────────────────────────────────── */}
                    <footer style={{
                        marginTop: '4rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border-secondary)',
                        textAlign: 'center',
                    }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Thanks for reading!
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
            </div>

            {/* ── Chat Toggle Button (Floating) ──────────────────────────────── */}
            {/*
             * position: 'fixed' keeps this button in the same corner of the viewport
             * even as the user scrolls. zIndex: 100 ensures it stays above content.
             *
             * When chat is open, the button moves left to sit beside the panel.
             * The 'right' value transitions smoothly thanks to CSS transition.
             */}
            <button
                onClick={() => setChatOpen(prev => !prev)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: chatOpen ? 'calc(35% + 1rem)' : '1.5rem',
                    zIndex: 100,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: chatOpen ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                    border: chatOpen ? '1px solid var(--border-secondary)' : 'none',
                    color: chatOpen ? 'var(--text-primary)' : 'white',
                    cursor: 'pointer',
                    fontSize: '1.3rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'right 0.3s ease, background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                title={chatOpen ? 'Close AI chat' : 'Ask AI about this post'}
                aria-label={chatOpen ? 'Close AI chat' : 'Open AI chat'}
            >
                {chatOpen ? '✕' : '💬'}
            </button>

            {/* ── Chat Panel ─────────────────────────────────────────────────── */}
            {/*
             * Conditional rendering: ChatPanel is only mounted when chatOpen = true.
             * When chatOpen becomes false, React unmounts ChatPanel, resetting its
             * state (message history). This is intentional — fresh chat each visit.
             *
             * position: 'sticky' + top: 0 keeps the chat visible while scrolling
             * through the article. height: '100vh' fills the full viewport.
             */}
            {chatOpen && (
                <div style={{
                    width: '35%',
                    minWidth: '300px',
                    maxWidth: '480px',
                    position: 'sticky',
                    top: '0',
                    height: '100vh',
                    flexShrink: 0,
                }}>
                    <Suspense
                        fallback={(
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    background: 'var(--bg-secondary)',
                                    borderLeft: '1px solid var(--border-secondary)',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'monospace',
                                }}
                            >
                                Loading AI chat...
                            </div>
                        )}
                    >
                        <ChatPanel
                            blogSlug={slug}
                            onClose={() => setChatOpen(false)}
                        />
                    </Suspense>
                </div>
            )}
        </div>
    );
};

export default BlogPostPage;
