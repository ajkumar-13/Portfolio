import { Link } from 'react-router-dom';

import styles from '../../styles/components.module.css';

const INTERNAL_LINKS = [
    { to: '/projects', label: 'Projects' },
    { to: '/blogs', label: 'Blog' },
    { to: '/lets-train', label: "Let's Train" },
];

const EXTERNAL_LINKS = [
    { href: 'https://github.com/ajkumar-13', label: 'GitHub' },
];

/**
 * Footer Component
 *
 * Shell footer with internal navigation and the primary external profile link.
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContent}>
                    <div className={styles.footerBrand}>
                        <p className={styles.footerEyebrow}>AJAY.OS // FIELD NOTES</p>
                        <p className={styles.footerDescription}>
                            Retro-branded portfolio for production-minded AI systems, technical notes, and public refactors.
                        </p>
                    </div>

                    <div className={styles.footerActions}>
                        <div className={styles.footerLinkGroup}>
                            <span className={styles.footerGroupLabel}>Routes</span>
                            <div className={styles.footerLinks}>
                                {INTERNAL_LINKS.map((link) => (
                                    <Link key={link.to} to={link.to} className={styles.footerLink}>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className={styles.footerLinkGroup}>
                            <span className={styles.footerGroupLabel}>External</span>
                            <div className={styles.footerLinks}>
                                {EXTERNAL_LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.footerLink}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footerMeta}>
                    <p className={styles.copyright}>
                        © {currentYear} Ajay Kumar. Built as a modular monolith in public.
                    </p>
                    <p className={styles.footerStatus}>
                        Status // Phase 2 frontend hardening is still active.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
