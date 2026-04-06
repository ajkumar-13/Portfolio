import blogStyles from '../styles/blog.module.css';

const BlogEmptyState = ({
    icon,
    title,
    message,
    className = '',
    children,
}) => (
    <div className={`glass-card ${blogStyles.emptyState} ${className}`.trim()}>
        {icon ? <div className={blogStyles.emptyIcon}>{icon}</div> : null}
        {title ? <h3 className={blogStyles.emptyTitle}>{title}</h3> : null}
        <p className={blogStyles.emptyText}>{message}</p>
        {children}
    </div>
);

export default BlogEmptyState;