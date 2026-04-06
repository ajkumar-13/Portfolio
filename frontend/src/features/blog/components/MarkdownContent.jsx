import { useEffect, useState } from 'react';

const contentStyle = {
    fontSize: '1.125rem',
    lineHeight: 1.8,
    color: 'var(--text-primary)',
};

const MarkdownContent = ({ content }) => {
    const [html, setHtml] = useState('');
    const [isRendering, setIsRendering] = useState(true);
    const [renderFailed, setRenderFailed] = useState(false);

    useEffect(() => {
        let isActive = true;

        setHtml('');
        setIsRendering(true);
        setRenderFailed(false);

        const renderMarkdown = async () => {
            try {
                const { parseMarkdown } = await import('../../../shared/lib/markdown');
                const renderedHtml = parseMarkdown(content || '');

                if (!isActive) {
                    return;
                }

                setHtml(renderedHtml);
            } catch (error) {
                console.error('Failed to render markdown content', error);

                if (!isActive) {
                    return;
                }

                setRenderFailed(true);
            } finally {
                if (isActive) {
                    setIsRendering(false);
                }
            }
        };

        renderMarkdown();

        return () => {
            isActive = false;
        };
    }, [content]);

    if (isRendering) {
        return (
            <div style={contentStyle}>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    Rendering article...
                </p>
            </div>
        );
    }

    if (renderFailed) {
        return (
            <div style={contentStyle}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Failed to render the article content.
                </p>
            </div>
        );
    }

    return (
        <div
            className="markdown-content"
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default MarkdownContent;