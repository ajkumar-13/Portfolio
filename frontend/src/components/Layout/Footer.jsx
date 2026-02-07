import styles from '../../styles/components.module.css';

/**
 * Footer Component
 * 
 * Site footer with social links and copyright.
 * Styled to match the AI theme.
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContent}>
                    <div className={styles.footerLinks}>
                        <a
                            href="https://github.com/ajkumar-13"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.footerLink}
                        >
                            GitHub
                        </a>
                        <a href="#" className={styles.footerLink}>Twitter</a>
                        <a href="#" className={styles.footerLink}>LinkedIn</a>
                    </div>
                    <p className={styles.copyright}>
                        © {currentYear} Ajay Kumar. Powered by AI & Curiosity 🧠
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
