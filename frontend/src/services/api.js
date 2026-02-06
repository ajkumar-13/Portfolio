const API_URL = 'http://localhost:8000/api';

export const api = {
    // Blog Series
    getSeries: async () => {
        const response = await fetch(`${API_URL}/series`);
        if (!response.ok) throw new Error('Failed to fetch series');
        return response.json();
    },

    getSeriesById: async (id) => {
        const response = await fetch(`${API_URL}/series/${id}`);
        if (!response.ok) throw new Error('Failed to fetch series');
        return response.json();
    },

    // Blogs
    getBlogs: async (page = 0, limit = 10) => {
        const response = await fetch(`${API_URL}/blogs?skip=${page * limit}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch blogs');
        return response.json();
    },

    getBlogBySlug: async (slug) => {
        const response = await fetch(`${API_URL}/blogs/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch blog');
        return response.json();
    },

    // Image URL Helper
    getImageUrl: (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    }
};
