/**
 * api.js — Centralized API Service
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IS THIS FILE?
 * ─────────────────────────────────────────────────────────────────────────────
 * Instead of writing fetch() calls scattered across every component,
 * we centralize all API calls here. This gives us:
 *
 *   1. One place to change the base URL (e.g., dev → production)
 *   2. Consistent error handling
 *   3. Easy to mock in tests
 *
 * HOW FETCH WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * fetch() is a browser API for making HTTP requests. It returns a Promise
 * that resolves to a Response object. To get the JSON body, call .json()
 * on the response — which is also async (another Promise).
 *
 * The `async/await` syntax makes Promises look like synchronous code:
 *   const response = await fetch(url)   → waits for the HTTP response
 *   const data = await response.json()  → waits for JSON parsing
 *
 * NOTE ON TRAILING SLASHES
 * ─────────────────────────────────────────────────────────────────────────────
 * Django REST Framework requires trailing slashes by default.
 * /api/series  → 301 redirect → /api/series/
 * Always use trailing slashes in API calls to avoid redirect overhead.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// The base URL for all API calls.
// In development, Django runs on port 8000.
// In production, change this to your deployed backend URL.
const API_URL = 'http://localhost:8000/api';

export const api = {

    // ── BLOG SERIES ────────────────────────────────────────────────────────────

    /**
     * Fetch all blog series (for the /blogs listing page).
     * Returns: [{ id, title, description, cover_image, post_count }, ...]
     */
    getSeries: async () => {
        const response = await fetch(`${API_URL}/series/`);
        if (!response.ok) throw new Error('Failed to fetch series');
        return response.json();
    },

    /**
     * Fetch a single series with all its posts (for /blogs/series/:id page).
     * Returns: { id, title, description, posts: [...] }
     */
    getSeriesById: async (id) => {
        const response = await fetch(`${API_URL}/series/${id}/`);
        if (!response.ok) throw new Error('Failed to fetch series');
        return response.json();
    },

    // ── BLOG POSTS ─────────────────────────────────────────────────────────────

    /**
     * Fetch blog posts. Optionally filter by series.
     * seriesId: optional number, filters to only posts in that series
     * Returns: [{ id, title, slug, excerpt, series_title, ... }, ...]
     */
    getBlogs: async (seriesId = null) => {
        // Build the URL with optional query parameter
        // e.g., /api/blogs/?series_id=3
        const url = seriesId
            ? `${API_URL}/blogs/?series_id=${seriesId}`
            : `${API_URL}/blogs/`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch blogs');
        return response.json();
    },

    /**
     * Fetch a single blog post by its URL slug.
     * slug: string like "attention-is-all-you-need"
     * Returns: { id, title, slug, content, series_title, ... }
     */
    getBlogBySlug: async (slug) => {
        const response = await fetch(`${API_URL}/blogs/${slug}/`);
        if (!response.ok) throw new Error('Failed to fetch blog');
        return response.json();
    },

    // ── CHAT ───────────────────────────────────────────────────────────────────

    /**
     * Send a message to the AI chat for a specific blog post.
     *
     * blogSlug: the slug of the blog post the user is reading
     * message: the user's question text
     * history: array of previous messages for conversation context
     *          format: [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
     *
     * Returns: { reply: '...', message: { role: 'assistant', content: '...' } }
     */
    chatWithBlog: async (blogSlug, message, history = []) => {
        const response = await fetch(`${API_URL}/chat/`, {
            method: 'POST',
            headers: {
                // Tell the server we're sending JSON
                'Content-Type': 'application/json',
            },
            // JSON.stringify converts a JS object to a JSON string
            body: JSON.stringify({
                blog_slug: blogSlug,
                message: message,
                history: history,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get AI response');
        }
        return response.json();
    },

    // ── HELPERS ────────────────────────────────────────────────────────────────

    /**
     * Converts a media file path from Django to a full URL.
     * Django returns paths like "/media/posts/image.jpg" — we prepend the host.
     *
     * Examples:
     *   "/media/posts/img.jpg"   → "http://localhost:8000/media/posts/img.jpg"
     *   "https://..."            → "https://..." (already a full URL, unchanged)
     *   null / undefined         → null
     */
    getImageUrl: (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    },
};
