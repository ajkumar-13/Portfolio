import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import styles from '../../styles/components.module.css';

/**
 * Header Component
 * 
 * The navigation bar at the top of every page.
 * Note: Admin page is intentionally hidden from navigation.
 * Access it directly via /admin URL when you need it.
 */
const Header = () => {
    const location = useLocation();
    const { toggleTheme, isDark } = useTheme();

    const isActive = (path) => location.pathname === path;

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                {/* Logo */}
                <Link to="/" className={styles.logo}>
                    AK
                </Link>

                {/* Navigation Links - Admin intentionally excluded */}
                <nav className={styles.nav}>
                    <Link
                        to="/"
                        className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/work"
                        className={`${styles.navLink} ${isActive('/work') ? styles.active : ''}`}
                    >
                        Work
                    </Link>
                    <Link
                        to="/blogs"
                        className={`${styles.navLink} ${location.pathname.startsWith('/blogs') ? styles.active : ''}`}
                    >
                        Blog
                    </Link>
                </nav>

                {/* Right side buttons */}
                <div className={styles.headerButtons}>
                    {/* Theme Toggle Button */}
                    <button
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
