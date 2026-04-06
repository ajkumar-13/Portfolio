import blogStyles from '../styles/blog.module.css';

const BlogStateView = ({ icon, message, mono = false }) => (
    <div className={`container ${blogStyles.statePage}`}>
        {icon ? <div className={blogStyles.stateIcon}>{icon}</div> : null}
        <p className={mono ? blogStyles.stateMono : blogStyles.stateText}>{message}</p>
    </div>
);

export default BlogStateView;