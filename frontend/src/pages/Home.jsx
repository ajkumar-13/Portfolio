import { Link } from 'react-router-dom';
import styles from '../styles/components.module.css';

const Home = () => {
    return (
        <div className="container">
            <section style={{
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2
                }}>
                    Building Digital <br /> Experiences
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--color-text-secondary)',
                    maxWidth: '600px',
                    marginBottom: '2rem'
                }}>
                    I'm a Full Stack Developer passionate about 3D web technologies,
                    interactive design, and building scalable backends.
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link
                        to="/work"
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'var(--color-primary)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        View Work
                    </Link>
                    <Link
                        to="/blogs"
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600'
                        }}
                    >
                        Read Blogs
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
