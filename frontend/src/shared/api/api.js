import { API_BASE_URL, toAbsoluteMediaUrl } from '../config/env';

const extractErrorMessage = (payload) => {
    if (!payload) return null;
    if (typeof payload.error === 'string') return payload.error;
    if (typeof payload.detail === 'string') return payload.detail;
    return null;
};

export const api = {
    getSeries: async () => {
        const response = await fetch(`${API_BASE_URL}/series/`);
        if (!response.ok) throw new Error('Failed to fetch series');
        return response.json();
    },

    getSeriesById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/series/${id}/`);
        if (!response.ok) throw new Error('Failed to fetch series');
        return response.json();
    },

    getBlogs: async (seriesId = null) => {
        const url = seriesId
            ? `${API_BASE_URL}/blogs/?series_id=${seriesId}`
            : `${API_BASE_URL}/blogs/`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch blogs');
        return response.json();
    },

    getBlogBySlug: async (slug) => {
        const response = await fetch(`${API_BASE_URL}/blogs/${slug}/`);
        if (!response.ok) throw new Error('Failed to fetch blog');
        return response.json();
    },

    chatWithBlog: async (blogSlug, message, history = []) => {
        const response = await fetch(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                blog_slug: blogSlug,
                message,
                history,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(extractErrorMessage(error) || 'Failed to get AI response');
        }

        return response.json();
    },

    getImageUrl: (path) => {
        if (!path) return null;
        return toAbsoluteMediaUrl(path);
    },
};