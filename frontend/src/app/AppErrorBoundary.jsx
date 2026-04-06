import { Component } from 'react';

import styles from './appStatus.module.css';

class AppErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            errorMessage: error instanceof Error ? error.message : 'Unknown application error',
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Application render failed', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className={`container ${styles.page} ${styles.pageSpacious}`}>
                <div className={`glass-card ${styles.card} ${styles.cardWide}`}>
                    <p className={styles.eyebrow}>
                        APPLICATION ERROR
                    </p>
                    <h1 className={styles.title}>Something broke while rendering the page.</h1>
                    <p className={`${styles.message} ${styles.messageWithAction}`}>
                        {this.state.errorMessage || 'Reload the app and try again.'}
                    </p>
                    <button
                        type="button"
                        onClick={this.handleReload}
                        className={styles.actionButton}
                    >
                        Reload Application
                    </button>
                </div>
            </div>
        );
    }
}

export default AppErrorBoundary;