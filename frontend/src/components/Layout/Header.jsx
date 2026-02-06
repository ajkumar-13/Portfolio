import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components.module.css';

const Header = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContent}`}>
                <Link to="/" className={styles.logo}>
                    Portfolio
                </Link>

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
                        className={`${styles.navLink} ${isActive('/blogs') || location.pathname.startsWith('/blogs') ? styles.active : ''}`}
                    >
                        Blogs
                    </Link>
                    <Link
                        to="/admin"
                        className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
                    >
                        Admin
                    </Link>
                </nav>

                <button
                    className={styles.toggleButton}
                    onClick={() => alert("3D View coming soon!")}
                    title="Toggle 3D View"
                >
                    2D / 3D
                </button>
            </div>
        </header>
    );
};

export default Header;
