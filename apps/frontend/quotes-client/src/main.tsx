// v1.0.0
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app';
import { CustomThemeProvider } from './theme/theme-provider';

const domNode = document.getElementById('root');
const root = createRoot(domNode as HTMLElement);

root.render(
  <StrictMode>
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  </StrictMode>
);
