import styles from './appStatus.module.css';

const RouteFallback = () => {
    return (
        <div className={`container ${styles.page}`}>
            <div className={`glass-card ${styles.card}`}>
                <div className={styles.loadingMark}>Loading…</div>
                <p className={styles.message}>
                    Fetching the next route chunk.
                </p>
            </div>
        </div>
    );
};

export default RouteFallback;