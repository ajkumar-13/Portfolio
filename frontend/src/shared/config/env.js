const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

const readEnv = (value, fallback) => {
    if (typeof value !== 'string') {
        return fallback;
    }

    const trimmed = value.trim();
    return trimmed || fallback;
};

const normalizeBasePath = (value) => {
    if (!value || value === '/') {
        return '/';
    }

    const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
    return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const DEFAULT_BACKEND_ORIGIN = 'http://localhost:8000';

const rawBackendOrigin = readEnv(
    import.meta.env.VITE_API_BASE_URL,
    DEFAULT_BACKEND_ORIGIN,
);
const rawMediaOrigin = readEnv(import.meta.env.VITE_MEDIA_BASE_URL, rawBackendOrigin);

export const BACKEND_ORIGIN = stripTrailingSlash(rawBackendOrigin);
export const MEDIA_ORIGIN = stripTrailingSlash(rawMediaOrigin);
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;
export const DJANGO_ADMIN_URL = `${BACKEND_ORIGIN}/admin/`;
export const APP_BASE_PATH = normalizeBasePath(
    readEnv(import.meta.env.VITE_APP_BASE_PATH, '/'),
);
export const ROUTER_BASENAME = APP_BASE_PATH === '/' ? '/' : APP_BASE_PATH.slice(0, -1);

export const toAbsoluteUrl = (path, origin = BACKEND_ORIGIN) => {
    if (!path) {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${normalizedPath}`;
};

export const toAbsoluteMediaUrl = (path) => toAbsoluteUrl(path, MEDIA_ORIGIN);