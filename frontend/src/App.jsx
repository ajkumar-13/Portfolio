import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Work from './pages/Work';
import Blogs from './pages/Blogs';
import BlogSeries from './pages/BlogSeries';
import BlogPost from './pages/BlogPost';
import Admin from './pages/Admin';

/**
 * Main App Component
 * 
 * This is the root of our React application.
 * It sets up:
 * - ThemeProvider: Makes theme (dark/light) available everywhere
 * - Router: Handles navigation between pages
 * - Layout: Wraps all pages with Header and Footer
 * - Routes: Maps URLs to page components
 */
function App() {
    return (
        // ThemeProvider wraps everything so all components can use theme
        <ThemeProvider>
            <Router>
                <Layout>
                    <Routes>
                        {/* Each Route maps a URL path to a component */}
                        <Route path="/" element={<Home />} />
                        <Route path="/work" element={<Work />} />
                        <Route path="/blogs" element={<Blogs />} />
                        <Route path="/blogs/series/:id" element={<BlogSeries />} />
                        <Route path="/blogs/:slug" element={<BlogPost />} />
                        <Route path="/admin" element={<Admin />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;
