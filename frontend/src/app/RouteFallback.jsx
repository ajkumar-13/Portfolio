const RouteFallback = () => {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <div
                className="glass-card"
                style={{
                    maxWidth: '560px',
                    margin: '0 auto',
                    padding: '2rem',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>Loading…</div>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Fetching the next route chunk.
                </p>
            </div>
        </div>
    );
};

export default RouteFallback;