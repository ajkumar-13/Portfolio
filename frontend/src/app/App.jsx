import { BrowserRouter } from 'react-router-dom';

import AppErrorBoundary from './AppErrorBoundary';
import AppRouter from './AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';
import { ROUTER_BASENAME } from '../shared/config/env';

const App = () => {
    return (
        <ThemeProvider>
            <BrowserRouter basename={ROUTER_BASENAME}>
                <AppErrorBoundary>
                    <AppRouter />
                </AppErrorBoundary>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;