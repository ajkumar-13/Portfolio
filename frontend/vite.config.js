import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const normalizeBasePath = (value) => {
    if (!value || value === '/') return '/'

    const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
    return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    const manualChunks = (id) => {
        if (!id.includes('node_modules')) return undefined

        if (id.includes('/marked/') || id.includes('/highlight.js/')) {
            return 'markdown-vendor'
        }

        if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
            return 'react-vendor'
        }

        return undefined
    }

    return {
        plugins: [react()],
        base: normalizeBasePath(env.VITE_APP_BASE_PATH || '/'),
        build: {
            rollupOptions: {
                output: {
                    manualChunks,
                },
            },
        },
    }
})
