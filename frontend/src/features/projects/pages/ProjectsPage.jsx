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

import shellStyles from '../../../styles/components.module.css';
import projectStyles from '../styles/projects.module.css';

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
    <article className={`${projectStyles.card} ${highlight ? projectStyles.cardFeatured : ''}`}>
        {/* Featured badge for highlighted projects */}
        {highlight && (
            <span className={projectStyles.badge}>
                FEATURED
            </span>
        )}

        {/* Project title */}
        <h3 className={projectStyles.cardTitle}>
            {title}
        </h3>

        {/* Description */}
        <p className={projectStyles.cardDescription}>
            {description}
        </p>

        {/* Tech stack tags */}
        <div className={projectStyles.techList}>
            {tech.map(tag => (
                <span key={tag} className={projectStyles.techTag}>
                    {tag}
                </span>
            ))}
        </div>

        {/* GitHub link */}
        <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className={projectStyles.cardLink}
        >
            View on GitHub →
        </a>
    </article>
);

// ── Main Projects Page ────────────────────────────────────────────────────────
const ProjectsPage = () => {
    return (
        <div className={`container ${projectStyles.page}`}>

            {/* Page Header */}
            <header className={projectStyles.header}>
                <span className={shellStyles.sectionLabel}>MY WORK</span>
                <h1 className={projectStyles.title}>
                    Projects
                </h1>
                <p className={projectStyles.intro}>
                    Building from the ground up — vector databases, GPU kernels,
                    LLM pipelines, and AI agent infrastructure.
                </p>
            </header>

            {/* Projects Grid */}
            {/* CSS Grid with auto-fill columns: min 300px, max 1 fraction of space */}
            <div className={projectStyles.grid}>
                {/* .map() renders a ProjectCard for each project in the array */}
                {PROJECTS.map(project => (
                    <ProjectCard key={project.id} {...project} />
                ))}
            </div>

            {/* GitHub CTA */}
            <div className={projectStyles.footerCta}>
                <p className={projectStyles.footerNote}>
                    More on GitHub
                </p>
                <a
                    href="https://github.com/ajkumar-13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={shellStyles.btnPrimary}
                >
                    github.com/ajkumar-13
                </a>
            </div>
        </div>
    );
};

export default ProjectsPage;
