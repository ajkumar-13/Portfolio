import { Link } from 'react-router-dom';

import styles from '../styles/home.module.css';

const HomeRouteCard = ({ route }) => {
    return (
        <Link to={route.to} className={styles.routeCard}>
            <div className={styles.routeHeader}>
                <span className={styles.routeOverline}>{route.overline}</span>
                <span className={styles.routeState}>{route.state}</span>
            </div>
            <strong className={styles.routeName}>{route.title}</strong>
            <span className={styles.routeBody}>{route.body}</span>
            <span className={styles.routeMeta}>
                <span className={styles.routeArrow}>&gt;</span>
                {route.meta}
            </span>
        </Link>
    );
};

export default HomeRouteCard;