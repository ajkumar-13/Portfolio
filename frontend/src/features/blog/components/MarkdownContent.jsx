import { useEffect, useState } from 'react';

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
            <div className="markdown-shell">
                <p className="markdown-state markdown-state-mono">
                    Rendering article...
                </p>
            </div>
        );
    }

    if (renderFailed) {
        return (
            <div className="markdown-shell">
                <p className="markdown-state">
                    Failed to render the article content.
                </p>
            </div>
        );
    }

    return (
        <div
            className="markdown-content markdown-shell"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default MarkdownContent;