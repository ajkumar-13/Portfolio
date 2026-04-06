import styles from '../styles/home.module.css';

const PANEL_TONE_CLASSNAMES = {
    default: '',
    cool: styles.panelCool,
    warm: styles.panelWarm,
};

const HomePanel = ({ label, title, body, tone = 'default', className = '', children }) => {
    const panelClassName = [styles.panel, PANEL_TONE_CLASSNAMES[tone] ?? '', className]
        .filter(Boolean)
        .join(' ');

    return (
        <section className={panelClassName}>
            <p className={styles.panelLabel}>{label}</p>
            {title ? <h2 className={styles.panelTitle}>{title}</h2> : null}
            {body ? <p className={styles.panelBody}>{body}</p> : null}
            {children}
        </section>
    );
};

export default HomePanel;