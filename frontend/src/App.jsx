import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Work from './pages/Work';
import Blogs from './pages/Blogs';
import BlogSeries from './pages/BlogSeries';
import BlogPost from './pages/BlogPost';
import Admin from './pages/Admin';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/work" element={<Work />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/series/:id" element={<BlogSeries />} />
                    <Route path="/blogs/:slug" element={<BlogPost />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;

