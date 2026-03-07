/**
 * App.jsx — Root Application Component
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IS THIS FILE?
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the entry point for the entire React application.
 * It sets up three core things:
 *
 * 1. ThemeProvider — makes the dark/light theme available to every component
 *    via React Context (see context/ThemeContext.jsx)
 *
 * 2. BrowserRouter — enables client-side navigation with React Router.
 *    "Client-side" means the browser doesn't reload when you click a link —
 *    React intercepts the navigation and swaps components instead.
 *
 * 3. Routes — maps URL paths to page components.
 *    Route path="/blogs/:slug" means: any URL like /blogs/my-post
 *    passes "my-post" as the `slug` param to BlogPost via useParams().
 *
 * HOW LAYOUT WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout wraps all routes. It renders the Header at the top, the Footer
 * at the bottom, and your page component in the middle via `children` prop.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Blogs from './pages/Blogs';
import BlogSeries from './pages/BlogSeries';
import BlogPost from './pages/BlogPost';
import LetsTrain from './pages/LetsTrain';

function App() {
    return (
        // ThemeProvider makes the theme context available to all child components.
        // Any component can call useTheme() to read or toggle the theme.
        <ThemeProvider>
            {/* BrowserRouter uses the HTML5 History API
                so URLs look like /blogs not /#/blogs */}
            <Router>
                {/* Layout adds Header + Footer around every page */}
                <Layout>
                    <Routes>
                        {/* Each Route maps a URL path to a React component */}
                        <Route path="/" element={<Home />} />

                        {/* Projects showcase page */}
                        <Route path="/projects" element={<Projects />} />

                        {/* Blog section — three nested routes:
                            /blogs              → list of all series
                            /blogs/series/:id   → all posts in one series
                            /blogs/:slug        → single blog post with AI chat
                        */}
                        <Route path="/blogs" element={<Blogs />} />
                        <Route path="/blogs/series/:id" element={<BlogSeries />} />
                        <Route path="/blogs/:slug" element={<BlogPost />} />

                        {/* RL training playground (coming soon) */}
                        <Route path="/lets-train" element={<LetsTrain />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;
