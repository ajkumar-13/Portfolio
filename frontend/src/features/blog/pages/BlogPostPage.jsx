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

import BlogStateView from '../components/BlogStateView';
import MarkdownContent from '../components/MarkdownContent';
import { api } from '../../../shared/api/api';
import shellStyles from '../../../styles/components.module.css';
import blogStyles from '../styles/blog.module.css';

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
        return <BlogStateView icon="⏳" message="Loading article..." mono />;
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error || !blog) {
        return <BlogStateView icon="❌" message={error || 'Blog not found'} />;
    }

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        // Outer wrapper: full width, flex row to place blog + chat side by side
        <div className={blogStyles.postLayout}>

            {/* ── Blog Content Area ─────────────────────────────────────────── */}
            {/*
             * flex: 1 means "take up all remaining space in the flex row".
             * When the chat panel appears beside it, the blog shrinks to ~65%.
             * The transition makes this animation smooth.
             */}
            <div className={blogStyles.postContent}>
                <article className={`${blogStyles.postArticle} ${chatOpen ? blogStyles.postArticleChatOpen : ''}`}>

                    {/* ── Article Header ─────────────────────────────────── */}
                    <header className={blogStyles.postHeader}>
                        <span className={shellStyles.sectionLabel}>📖 Article</span>
                        {/* Series breadcrumb — shows which series this post belongs to */}
                        {blog.series_title && (
                            <p className={blogStyles.postSeriesTitle}>
                                {blog.series_title}
                            </p>
                        )}
                        <h1 className={blogStyles.postTitle}>
                            {blog.title}
                        </h1>
                        {blog.created_at && (
                            <time className={blogStyles.postPublished}>
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
                            className={blogStyles.postCover}
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
                    <footer className={blogStyles.postFooter}>
                        <p className={blogStyles.postFooterText}>
                            Thanks for reading!
                        </p>
                        <a
                            href="https://github.com/ajkumar-13"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={shellStyles.btnSecondary}
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
                className={`${blogStyles.chatToggle} ${chatOpen ? blogStyles.chatToggleOpen : ''}`}
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
                <div className={blogStyles.chatSidebar}>
                    <Suspense
                        fallback={(
                            <div className={blogStyles.chatFallback}>
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
