/**
 * ChatPanel.jsx — AI Chat Sidebar for Blog Posts
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS COMPONENT DOES
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the chat window that slides in on the right side of a blog post.
 * The user can ask questions about the article they're reading, and Claude
 * (the AI) answers using the blog content as context.
 *
 * REACT CONCEPTS USED HERE
 * ─────────────────────────────────────────────────────────────────────────────
 * useState: Stores values that change over time (message input, history, loading)
 *   - When state changes, React re-renders the component with the new values.
 *
 * useRef: Holds a reference to a DOM element (the message list div).
 *   - Unlike useState, changing a ref does NOT re-render the component.
 *   - We use it to scroll the chat window to the bottom after new messages.
 *
 * useEffect: Runs side effects after render.
 *   - We use it to auto-scroll when the messages list changes.
 *   - The dependency array [messages] means: re-run this effect whenever
 *     `messages` changes. An empty array [] means: run only once on mount.
 *
 * Props: Data passed from parent component (BlogPost.jsx) to this component.
 *   - blogSlug: the URL slug of the current post (used in the API call)
 *   - onClose: a function to call when user clicks the close button
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

/**
 * ChatPanel Component
 *
 * Props:
 *   blogSlug (string): The slug of the current blog post
 *   onClose (function): Called when the user closes the panel
 */
const ChatPanel = ({ blogSlug, onClose }) => {
    // messages: array of { role: 'user' | 'assistant', content: string }
    // We initialize with a welcome message from the assistant.
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I've read this article. Ask me anything about it — concepts, code, or how things work.",
        },
    ]);

    // Tracks which AI provider answered the last message (e.g. "Claude (claude-sonnet-4-6)")
    // The backend returns this in the 'provider' field of the response.
    const [activeProvider, setActiveProvider] = useState(null);

    // The current text in the input box
    const [input, setInput] = useState('');

    // loading: true while waiting for the AI response
    // Used to show a "thinking..." indicator and disable the input
    const [loading, setLoading] = useState(false);

    // error: stores an error message to show if the API call fails
    const [error, setError] = useState(null);

    // messagesEndRef: a reference to a dummy div at the bottom of the message list.
    // We call .scrollIntoView() on it to auto-scroll to the latest message.
    const messagesEndRef = useRef(null);

    // useEffect with [messages] dependency:
    // Every time the messages array changes (new message added), scroll to bottom.
    useEffect(() => {
        // scrollIntoView scrolls the page so this element is visible.
        // { behavior: 'smooth' } makes it animate instead of jumping.
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /**
     * sendMessage: called when user submits a question.
     *
     * This is an async function because it needs to await the API call.
     * We use try/catch/finally for error handling:
     *   try     → run the main logic
     *   catch   → handle errors (network failures, API errors)
     *   finally → always runs, even if an error occurred (used to stop loading)
     */
    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return; // Don't send empty messages or while loading

        // Clear the input box immediately (feels responsive)
        setInput('');
        setError(null);
        setLoading(true);

        // The new user message to add to the chat
        const userMessage = { role: 'user', content: trimmed };

        // Add user message to the displayed messages
        // Functional update pattern: setMessages(prev => [...prev, newItem])
        // We use the function form to ensure we're working with the latest state.
        setMessages(prev => [...prev, userMessage]);

        try {
            // Build history: all previous messages EXCEPT the first welcome message,
            // since the AI shouldn't see its own auto-greeting as conversation history.
            // We also exclude the message we just added (it's passed separately).
            const history = messages
                .slice(1) // Skip the initial welcome message (index 0)
                .filter(m => m.content !== '...'); // Skip placeholder messages

            // Call the Django API → Claude API chain
            const data = await api.chatWithBlog(blogSlug, trimmed, history);

            // Add the AI's response to the messages list
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

            // Show which provider answered (backend returns this in data.provider)
            if (data.provider) setActiveProvider(data.provider);

        } catch (err) {
            setError(err.message);
            // Remove the user's message if we couldn't get a response
            // so the conversation stays consistent
            setMessages(prev => prev.slice(0, -1));
        } finally {
            // This runs whether the try succeeded or the catch ran.
            // Always stop loading when the operation is complete.
            setLoading(false);
        }
    };

    /**
     * Handle Enter key press in the input field.
     * Shift+Enter adds a newline; plain Enter submits the message.
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent the default newline behavior
            sendMessage();
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-secondary)',
            borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
            overflow: 'hidden',
        }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-secondary)',
                background: 'var(--bg-primary)',
                flexShrink: 0, // Don't shrink — keep header full width
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Simple pulsing dot to indicate the AI is "live" */}
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        animation: 'pulse 2s infinite',
                    }} />
                    <div>
                        <span style={{
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            display: 'block',
                        }}>
                            Ask about this post
                        </span>
                        {/* Show which AI provider is active, once a reply has been received */}
                        {activeProvider && (
                            <span style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace',
                            }}>
                                via {activeProvider}
                            </span>
                        )}
                    </div>
                </div>

                {/* Close button — calls the onClose prop function */}
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: '1.2rem',
                        lineHeight: 1,
                        padding: '0.25rem',
                        borderRadius: '4px',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                    aria-label="Close chat"
                >
                    ✕
                </button>
            </div>

            {/* ── Messages List ────────────────────────────────────────────── */}
            <div style={{
                flex: 1,         // Takes up all remaining vertical space
                overflowY: 'auto', // Enables scrolling when messages overflow
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
            }}>
                {/* Render each message */}
                {messages.map((msg, index) => (
                    <MessageBubble key={index} role={msg.role} content={msg.content} />
                ))}

                {/* Loading indicator shown while waiting for AI response */}
                {loading && (
                    <MessageBubble role="assistant" content="..." isLoading />
                )}

                {/* Error message if something went wrong */}
                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(220, 38, 38, 0.1)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: '8px',
                        color: '#dc2626',
                        fontSize: '0.85rem',
                    }}>
                        Error: {error}
                    </div>
                )}

                {/* Dummy div at the bottom — we scroll this into view for auto-scroll */}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ───────────────────────────────────────────────── */}
            <div style={{
                padding: '1rem',
                borderTop: '1px solid var(--border-secondary)',
                background: 'var(--bg-primary)',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about this article... (Enter to send)"
                        disabled={loading}
                        rows={2}
                        style={{
                            flex: 1,
                            padding: '0.65rem 0.85rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-secondary)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'inherit',
                            lineHeight: 1.5,
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-secondary)'}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        style={{
                            padding: '0.65rem 1rem',
                            background: loading || !input.trim()
                                ? 'var(--border-secondary)'
                                : 'var(--accent-primary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            transition: 'background 0.2s',
                            alignSelf: 'flex-end',
                        }}
                        aria-label="Send message"
                    >
                        {loading ? '⏳' : '↑'}
                    </button>
                </div>
                <p style={{
                    marginTop: '0.5rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                }}>
                    Answers are based on this article's content
                </p>
            </div>
        </div>
    );
};


/**
 * MessageBubble — renders a single chat message.
 *
 * Props:
 *   role (string): 'user' or 'assistant'
 *   content (string): the message text
 *   isLoading (bool): if true, shows a pulsing "..." animation
 *
 * This is a small component defined in the same file since it's only
 * used by ChatPanel. You could move it to its own file if it grows.
 */
const MessageBubble = ({ role, content, isLoading }) => {
    const isUser = role === 'user';

    return (
        <div style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
        }}>
            <div style={{
                maxWidth: '85%',
                padding: '0.65rem 0.9rem',
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser
                    ? 'var(--accent-primary)'
                    : 'var(--bg-glass)',
                color: isUser ? 'white' : 'var(--text-primary)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                border: isUser ? 'none' : '1px solid var(--border-secondary)',
                // Preserve whitespace and line breaks in the AI's response
                whiteSpace: 'pre-wrap',
                opacity: isLoading ? 0.6 : 1,
            }}>
                {isLoading ? (
                    // Simple animated "thinking" indicator
                    <span style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>
                        ···
                    </span>
                ) : (
                    content
                )}
            </div>
        </div>
    );
};

export default ChatPanel;
