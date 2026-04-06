export const SIGNALS = [
    'shipping production-minded AI systems',
    'writing technical notes from first principles',
    'rebuilding this portfolio with a retro shell',
    'moving fast without hiding architecture debt',
];

export const HERO_METRICS = [
    { value: '01', label: 'modular product surface' },
    { value: '04', label: 'active engineering tracks' },
    { value: '0', label: 'heavy 3D deps on home' },
];

export const STACK = ['Django', 'React', 'DRF', 'Rust', 'CUDA', 'LLM Pipelines', 'Vector Search'];

export const FOCUS_TRACKS = [
    {
        title: 'System Design',
        detail: 'Turning this repo into a modular monolith that reads like senior-level engineering work.',
    },
    {
        title: 'AI Infrastructure',
        detail: 'Building agent flows, retrieval paths, and model-provider orchestration that stand up in production.',
    },
    {
        title: 'Technical Writing',
        detail: 'Using the blog as a public notebook for explaining hard systems from the metal up.',
    },
];

export const ROUTES = [
    {
        to: '/projects',
        overline: 'Route 01',
        title: 'Projects',
        body: 'Vector databases, CUDA experiments, LLM pipelines, and the systems I build to understand them properly.',
        meta: 'open project archive',
        state: 'Live',
    },
    {
        to: '/blogs',
        overline: 'Route 02',
        title: 'Blog',
        body: 'Long-form technical notes, refactor logs, and explanations designed to make the reasoning legible.',
        meta: 'read field notes',
        state: 'Writing',
    },
    {
        to: '/lets-train',
        overline: 'Route 03',
        title: 'Let’s Train',
        body: 'The next build target: an interactive RL playground with the same retro visual language and better systems underneath.',
        meta: 'inspect next module',
        state: 'Next',
    },
];

export const BUILD_LEDGER = [
    {
        eyebrow: 'Surface',
        title: 'Retro control-room shell',
        detail: 'The homepage now leans on CSS-first composition so the brand can evolve without dragging a demo stack behind it.',
    },
    {
        eyebrow: 'Architecture',
        title: 'Feature-owned React modules',
        detail: 'App shell, shared runtime code, and feature folders now separate the frontend into clearer ownership boundaries.',
    },
    {
        eyebrow: 'Writing',
        title: 'Public engineering notebook',
        detail: 'The portfolio treats blog posts and refactor logs as product output, not as secondary documentation.',
    },
];

export const OPERATING_PRINCIPLES = [
    {
        title: 'Make reasoning visible',
        detail: 'Show the system posture and the tradeoffs directly instead of hiding everything behind visual effects.',
    },
    {
        title: 'Keep the surface lean',
        detail: 'Remove dependencies and experiments when they stop serving the current product direction.',
    },
    {
        title: 'Ship in modules',
        detail: 'Prefer small reusable UI blocks that can change independently as the portfolio grows.',
    },
];

export const FOOTER_NOTE = 'Signal Note // the homepage now runs as a reusable control-room kit, not as a one-off experiment.';