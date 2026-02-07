import { Link } from 'react-router-dom';
import styles from '../styles/components.module.css';

/**
 * Projects data
 * In the future, this could come from an API or database
 */
const projects = [
    {
        id: 1,
        title: "Neural Network Visualizer",
        description: "Interactive visualization tool for understanding deep learning architectures and training dynamics.",
        tags: ["PyTorch", "React", "Three.js", "FastAPI"],
        icon: "🧠",
        link: "#"
    },
    {
        id: 2,
        title: "AI Image Classifier",
        description: "Production-ready image classification system using CNNs with 95%+ accuracy on custom datasets.",
        tags: ["TensorFlow", "Python", "Docker", "REST API"],
        icon: "🖼️",
        link: "#"
    },
    {
        id: 3,
        title: "NLP Sentiment Analyzer",
        description: "Real-time sentiment analysis pipeline for social media data using transformer models.",
        tags: ["BERT", "Hugging Face", "Redis", "FastAPI"],
        icon: "💬",
        link: "#"
    },
    {
        id: 4,
        title: "Portfolio Website",
        description: "This very website! Built with React and FastAPI featuring dark/light themes and a blog system.",
        tags: ["React", "FastAPI", "SQLite", "Vite"],
        icon: "🌐",
        link: "#"
    },
    {
        id: 5,
        title: "Computer Vision Pipeline",
        description: "Object detection and tracking system for real-time video analysis using YOLO and OpenCV.",
        tags: ["OpenCV", "YOLOv8", "Python", "CUDA"],
        icon: "👁️",
        link: "#"
    },
    {
        id: 6,
        title: "ML Model Dashboard",
        description: "Monitoring dashboard for tracking ML model performance, drift detection, and retraining triggers.",
        tags: ["Streamlit", "MLflow", "PostgreSQL", "Python"],
        icon: "📊",
        link: "#"
    }
];

/**
 * Work/Projects Page Component
 * 
 * Displays portfolio projects in a grid layout.
 * Each project shows:
 * - Title and description
 * - Technology tags
 * - Link to project details
 */
const Work = () => {
    return (
        <div className="container">
            {/* Page Header */}
            <div className={styles.sectionHeader} style={{ paddingTop: '2rem' }}>
                <span className={styles.sectionLabel}>🚀 Portfolio</span>
                <h1 className={styles.sectionTitle}>
                    Featured <span className="gradient-text">Projects</span>
                </h1>
                <p className={styles.sectionDescription}>
                    A collection of AI/ML projects, experiments, and applications I've built
                </p>
            </div>

            {/* Projects Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '2rem',
                padding: '2rem 0 4rem'
            }}>
                {projects.map(project => (
                    <article key={project.id} className={styles.card}>
                        <div className={styles.cardContent}>
                            {/* Project Icon */}
                            <div style={{
                                fontSize: '2.5rem',
                                marginBottom: '1rem',
                                display: 'inline-block'
                            }}>
                                {project.icon}
                            </div>

                            {/* Title */}
                            <h2 className={styles.cardTitle}>{project.title}</h2>

                            {/* Description */}
                            <p className={styles.cardExcerpt}>{project.description}</p>

                            {/* Tags */}
                            <div className={styles.tagList}>
                                {project.tags.map(tag => (
                                    <span key={tag} className={styles.tag}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Link */}
                            <a
                                href={project.link}
                                style={{
                                    color: 'var(--accent-primary)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                View Details
                                <span>→</span>
                            </a>
                        </div>
                    </article>
                ))}
            </div>

            {/* GitHub CTA */}
            <div className="glass-card" style={{
                textAlign: 'center',
                padding: '3rem',
                marginBottom: '4rem'
            }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
                    Want to see more?
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Check out my GitHub for more projects, experiments, and open source contributions.
                </p>
                <a
                    href="https://github.com/ajkumar-13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnPrimary}
                >
                    <span>⭐</span>
                    View GitHub Profile
                </a>
            </div>
        </div>
    );
};

export default Work;
