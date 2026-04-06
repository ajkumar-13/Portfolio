/**
 * Projects.jsx — Projects Showcase Page
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays cards for Ajay's key GitHub projects.
 * Each card shows: project name, description, tech stack tags, and a GitHub link.
 *
 * This is a STATIC page — the data is defined directly in the component
 * rather than fetched from an API. That's fine for a small, manually-curated
 * list like this. No API calls needed.
 *
 * REACT CONCEPT: Mapping over arrays
 * ─────────────────────────────────────────────────────────────────────────────
 * A common React pattern is to store data in an array and use .map() to render
 * a component for each item:
 *
 *   projects.map(project => <ProjectCard key={project.id} {...project} />)
 *
 * key={project.id} is required — React uses it internally to efficiently
 * update the DOM when the list changes. Keys must be unique within a list.
 *
 * {...project} is "spread syntax" — it passes all properties of the project
 * object as individual props to ProjectCard.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import styles from '../../../styles/components.module.css';

// ── Project Data ──────────────────────────────────────────────────────────────
// Defining data as a constant outside the component means it's created once
// (not re-created on every render). For small static lists this is ideal.
const PROJECTS = [
    {
        id: 'vector-db',
        title: 'Vector DB from Scratch',
        description: 'A Rust-based vector database implementing HNSW (Hierarchical Navigable Small Worlds) — the algorithm behind nearest-neighbor search in production ML systems. Features WAL (Write-Ahead Logging), mmap storage, hybrid search, and async APIs.',
        tech: ['Rust', 'HNSW', 'WAL', 'mmap', 'Async'],
        github: 'https://github.com/ajkumar-13/Vector-DB-from-scratch',
        highlight: true, // Mark as a featured project
    },
    {
        id: 'cuda',
        title: 'Learning CUDA',
        description: 'Exploration of GPU programming with CUDA — from basic kernel launches to memory optimization. Understanding the hardware that powers modern deep learning at the metal level.',
        tech: ['CUDA', 'C++', 'GPU', 'Parallel Programming'],
        github: 'https://github.com/ajkumar-13/Learning-Cuda',
        highlight: false,
    },
    {
        id: 'dspy',
        title: 'DSPy Practice',
        description: 'A comprehensive guide to building programmatic LM pipelines with DSPy. Covers RLMs (Retrieval-Augmented Models), reinforcement learning for LLMs, and systematic prompt optimization.',
        tech: ['Python', 'DSPy', 'LLM', 'RAG', 'RL'],
        github: 'https://github.com/ajkumar-13/Dspy-practice',
        highlight: false,
    },
    {
        id: 'mcp',
        title: 'What The Hell is MCP',
        description: "A learning journey through the Model Context Protocol (MCP) — Anthropic's standard for connecting AI models to external tools and data sources. Understanding the primitives that power modern AI agents.",
        tech: ['Python', 'MCP', 'AI Agents', 'Anthropic'],
        github: 'https://github.com/ajkumar-13/What-The-Hell-is-MCP',
        highlight: false,
    },
];

// ── ProjectCard Component ─────────────────────────────────────────────────────
// A small component defined in this file since it's only used here.
// Props are destructured directly in the function signature: { title, description, ... }
const ProjectCard = ({ title, description, tech, github, highlight }) => (
    <div style={{
        background: 'var(--bg-glass)',
        border: `1px solid ${highlight ? 'var(--accent-primary)' : 'var(--border-secondary)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
    }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        {/* Featured badge for highlighted projects */}
        {highlight && (
            <span style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'var(--accent-primary)',
                color: 'white',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                letterSpacing: '0.05em',
            }}>
                FEATURED
            </span>
        )}

        {/* Project title */}
        <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0,
        }}>
            {title}
        </h3>

        {/* Description */}
        <p style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            fontSize: '0.95rem',
            margin: 0,
            flex: 1, // Push tech tags and link to the bottom
        }}>
            {description}
        </p>

        {/* Tech stack tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tech.map(tag => (
                <span key={tag} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-secondary)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                }}>
                    {tag}
                </span>
            ))}
        </div>

        {/* GitHub link */}
        <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent-primary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
            View on GitHub →
        </a>
    </div>
);

// ── Main Projects Page ────────────────────────────────────────────────────────
const ProjectsPage = () => {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>

            {/* Page Header */}
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <span className={styles.sectionLabel}>MY WORK</span>
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: '800',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                }}>
                    Projects
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.1rem',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: 1.7,
                }}>
                    Building from the ground up — vector databases, GPU kernels,
                    LLM pipelines, and AI agent infrastructure.
                </p>
            </header>

            {/* Projects Grid */}
            {/* CSS Grid with auto-fill columns: min 300px, max 1 fraction of space */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1100px',
                margin: '0 auto',
            }}>
                {/* .map() renders a ProjectCard for each project in the array */}
                {PROJECTS.map(project => (
                    <ProjectCard key={project.id} {...project} />
                ))}
            </div>

            {/* GitHub CTA */}
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    More on GitHub
                </p>
                <a
                    href="https://github.com/ajkumar-13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnPrimary}
                >
                    github.com/ajkumar-13
                </a>
            </div>
        </div>
    );
};

export default ProjectsPage;
