import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from '../pages/home';
import { Layout } from '../components/layout';
import { EnvProvider } from '../providers/env-provider';

export const App = () => {
  return (
    <BrowserRouter>
      <EnvProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            {/* TBD: add more routes */}
          </Route>
        </Routes>
      </EnvProvider>
    </BrowserRouter>
  );
};
