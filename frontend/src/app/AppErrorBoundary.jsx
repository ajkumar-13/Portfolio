import { Component } from 'react';

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
            <div className="container" style={{ padding: '5rem 1.5rem' }}>
                <div
                    className="glass-card"
                    style={{
                        maxWidth: '640px',
                        margin: '0 auto',
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.12em',
                            marginBottom: '0.75rem',
                        }}
                    >
                        APPLICATION ERROR
                    </p>
                    <h1 style={{ marginBottom: '0.75rem' }}>Something broke while rendering the page.</h1>
                    <p
                        style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '1.5rem',
                            lineHeight: 1.7,
                        }}
                    >
                        {this.state.errorMessage || 'Reload the app and try again.'}
                    </p>
                    <button
                        type="button"
                        onClick={this.handleReload}
                        style={{
                            border: 'none',
                            borderRadius: '999px',
                            padding: '0.85rem 1.4rem',
                            background: 'var(--accent-primary)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: '600',
                        }}
                    >
                        Reload Application
                    </button>
                </div>
            </div>
        );
    }
}

export default AppErrorBoundary;