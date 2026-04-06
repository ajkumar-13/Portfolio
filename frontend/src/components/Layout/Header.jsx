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

const NAV_ITEMS = [
    { to: '/', label: 'Home', isActive: (location) => location.pathname === '/' },
    { to: '/projects', label: 'Projects', isActive: (location) => location.pathname === '/projects' },
    { to: '/blogs', label: 'Blog', isActive: (location) => location.pathname.startsWith('/blogs') },
    {
        to: '/lets-train',
        label: "Let's Train",
        isActive: (location) => location.pathname === '/lets-train',
        badge: 'NEXT',
    },
];

const Header = () => {
    // useLocation() gives us the current URL info.
    // location.pathname = "/blogs/my-post"
    const location = useLocation();

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>

                {/* Logo — links back to home */}
                <Link to="/" className={styles.logo}>
                    AK
                </Link>

                {/* Navigation Links */}
                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`${styles.navLink} ${item.isActive(location) ? styles.active : ''} ${item.badge ? styles.navLinkWithBadge : ''}`}
                        >
                            {item.label}
                            {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
                        </Link>
                    ))}
                </nav>

                {/* Settings Dock (theme toggle + other settings) */}
                <SettingsDock />
            </div>
        </header>
    );
};

export default Header;
