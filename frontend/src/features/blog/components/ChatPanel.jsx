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

import { api } from '../../../shared/api/api';
import styles from './chatPanel.module.css';

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
        setMessages((previousMessages) => [...previousMessages, userMessage]);

        try {
            // Build history: all previous messages EXCEPT the first welcome message,
            // since the AI shouldn't see its own auto-greeting as conversation history.
            // We also exclude the message we just added (it's passed separately).
            const history = messages
                .slice(1) // Skip the initial welcome message (index 0)
                .filter((message) => message.content !== '...'); // Skip placeholder messages

            // Call the Django API → Claude API chain
            const data = await api.chatWithBlog(blogSlug, trimmed, history);

            // Add the AI's response to the messages list
            setMessages((previousMessages) => [...previousMessages, { role: 'assistant', content: data.reply }]);

            // Show which provider answered (backend returns this in data.provider)
            if (data.provider) setActiveProvider(data.provider);
        } catch (err) {
            setError(err.message);
            // Remove the user's message if we couldn't get a response
            // so the conversation stays consistent
            setMessages((previousMessages) => previousMessages.slice(0, -1));
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
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent the default newline behavior
            sendMessage();
        }
    };

    return (
        <div className={styles.root}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className={styles.header}>
                <div className={styles.headerMain}>
                    {/* Simple pulsing dot to indicate the AI is "live" */}
                    <div className={styles.liveDot} />
                    <div className={styles.titleBlock}>
                        <span className={styles.title}>
                            Ask about this post
                        </span>
                        {/* Show which AI provider is active, once a reply has been received */}
                        {activeProvider && (
                            <span className={styles.provider}>
                                via {activeProvider}
                            </span>
                        )}
                    </div>
                </div>

                {/* Close button — calls the onClose prop function */}
                <button
                    type="button"
                    onClick={onClose}
                    className={styles.closeButton}
                    aria-label="Close chat"
                >
                    ✕
                </button>
            </div>

            {/* ── Messages List ────────────────────────────────────────────── */}
            <div className={styles.messageList}>
                {/* Render each message */}
                {messages.map((message, index) => (
                    <MessageBubble key={index} role={message.role} content={message.content} />
                ))}

                {/* Loading indicator shown while waiting for AI response */}
                {loading && (
                    <MessageBubble role="assistant" content="..." isLoading />
                )}

                {/* Error message if something went wrong */}
                {error && (
                    <div className={styles.errorBanner}>
                        Error: {error}
                    </div>
                )}

                {/* Dummy div at the bottom — we scroll this into view for auto-scroll */}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ───────────────────────────────────────────────── */}
            <div className={styles.inputArea}>
                <div className={styles.inputRow}>
                    <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about this article... (Enter to send)"
                        disabled={loading}
                        rows={2}
                        className={styles.input}
                    />
                    <button
                        type="button"
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className={styles.sendButton}
                        aria-label="Send message"
                    >
                        {loading ? '⏳' : '↑'}
                    </button>
                </div>
                <p className={styles.helperText}>
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
        <div className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}>
            <div className={`${styles.messageBubble} ${isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant} ${isLoading ? styles.messageBubbleLoading : ''}`}>
                {isLoading ? (
                    // Simple animated "thinking" indicator
                    <span className={styles.loadingDots}>
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
