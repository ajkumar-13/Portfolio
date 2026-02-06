import styles from '../styles/components.module.css';

const projects = [
    {
        id: 1,
        title: "Portfolio Website",
        description: "A modern portfolio built with React and FastAPI featuring markdown blogs.",
        tags: ["React", "FastAPI", "SQLite"],
        link: "#"
    },
    {
        id: 2,
        title: "EcoTracker",
        description: "Mobile-first application for tracking personal carbon footprint.",
        tags: ["React Native", "Firebase"],
        link: "#"
    },
    {
        id: 3,
        title: "3D Product Configurator",
        description: "Interactive 3D view for customizing products in real-time.",
        tags: ["Three.js", "WebGL", "React"],
        link: "#"
    }
];

const Work = () => {
    return (
        <div className="container">
            <h1 style={{ margin: '2rem 0 3rem' }}>Selected Work</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {projects.map(project => (
                    <div key={project.id} className={styles.blogCard}>
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>{project.title}</h2>
                            <p className={styles.cardExcerpt}>{project.description}</p>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {project.tags.map(tag => (
                                    <span key={tag} style={{
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.5rem',
                                        background: 'var(--color-surface-hover)',
                                        borderRadius: '4px',
                                        color: 'var(--color-text-secondary)'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <a href={project.link} style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                                View Project &rarr;
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Work;
