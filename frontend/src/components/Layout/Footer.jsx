import styles from '../../styles/components.module.css';

const Footer = () => {
    return (
        <footer style={{
            borderTop: '1px solid var(--color-border)',
            padding: '2rem 0',
            marginTop: '4rem',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p>&copy; {new Date().getFullYear()} Portfolio. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="#" className={styles.navLink}>Twitter</a>
                    <a href="#" className={styles.navLink}>GitHub</a>
                    <a href="#" className={styles.navLink}>LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
