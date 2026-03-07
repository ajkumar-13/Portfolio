/**
 * Header.jsx — Navigation Bar
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the top navigation bar on every page (via Layout.jsx).
 *
 * REACT CONCEPTS
 * ─────────────────────────────────────────────────────────────────────────────
 * Link (from react-router-dom):
 *   Like an <a> tag, but intercepts clicks and uses client-side navigation.
 *   Using <a href="/blogs"> would cause a full page reload.
 *   Using <Link to="/blogs"> swaps components without reloading — much faster.
 *
 * useLocation():
 *   Returns the current URL location object. We use location.pathname
 *   to highlight the active nav link (the one matching the current page).
 *
 * Template literals for className:
 *   `${styles.navLink} ${isActive('/') ? styles.active : ''}`
 *   This combines the base navLink class with the active class conditionally.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components.module.css';
import SettingsDock from '../SettingsDock';

const Header = () => {
    // useLocation() gives us the current URL info.
    // location.pathname = "/blogs/my-post"
    const location = useLocation();

    // Helper function: returns true if the current page matches `path`
    const isActive = (path) => location.pathname === path;

    // For sections with sub-routes (like /blogs/series/1), we check with startsWith
    const isSection = (prefix) => location.pathname.startsWith(prefix);

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>

                {/* Logo — links back to home */}
                <Link to="/" className={styles.logo}>
                    AK
                </Link>

                {/* Navigation Links */}
                <nav className={styles.nav}>
                    <Link
                        to="/"
                        className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/projects"
                        className={`${styles.navLink} ${isActive('/projects') ? styles.active : ''}`}
                    >
                        Projects
                    </Link>
                    <Link
                        to="/blogs"
                        className={`${styles.navLink} ${isSection('/blogs') ? styles.active : ''}`}
                    >
                        Blog
                    </Link>
                    <Link
                        to="/lets-train"
                        className={`${styles.navLink} ${isActive('/lets-train') ? styles.active : ''}`}
                        style={{ position: 'relative' }}
                    >
                        Let's Train
                        {/* "Soon" badge — small indicator that this is coming soon */}
                        <span style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-8px',
                            fontSize: '0.55rem',
                            fontFamily: 'monospace',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            borderRadius: '3px',
                            padding: '1px 3px',
                            lineHeight: 1.2,
                            opacity: 0.85,
                        }}>
                            SOON
                        </span>
                    </Link>
                </nav>

                {/* Settings Dock (theme toggle + other settings) */}
                <SettingsDock />
            </div>
        </header>
    );
};

export default Header;
