import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from '../components/Layout/Layout';
import RouteFallback from './RouteFallback';

const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const ProjectsPage = lazy(() => import('../features/projects/pages/ProjectsPage'));
const BlogsPage = lazy(() => import('../features/blog/pages/BlogsPage'));
const BlogSeriesPage = lazy(() => import('../features/blog/pages/BlogSeriesPage'));
const BlogPostPage = lazy(() => import('../features/blog/pages/BlogPostPage'));
const LetsTrainPage = lazy(() => import('../features/training/pages/LetsTrainPage'));

const AppRouter = () => {
    return (
        <Layout>
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/blogs" element={<BlogsPage />} />
                    <Route path="/blogs/series/:id" element={<BlogSeriesPage />} />
                    <Route path="/blogs/:slug" element={<BlogPostPage />} />
                    <Route path="/lets-train" element={<LetsTrainPage />} />
                </Routes>
            </Suspense>
        </Layout>
    );
};

export default AppRouter;