import styles from '../styles/home.module.css';

const HomeMetricGrid = ({ metrics }) => {
    return (
        <div className={styles.metrics}>
            {metrics.map((metric) => (
                <div key={metric.label} className={styles.metric}>
                    <span className={styles.metricValue}>{metric.value}</span>
                    <span className={styles.metricLabel}>{metric.label}</span>
                </div>
            ))}
        </div>
    );
};

export default HomeMetricGrid;