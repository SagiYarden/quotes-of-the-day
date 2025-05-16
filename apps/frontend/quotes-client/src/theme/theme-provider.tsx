import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ColorMode, ColorModeContext } from './theme-context';
import { customThemeObject } from './theme-utils';

export const CustomThemeProvider = ({ children }: PropsWithChildren) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const getInitialMode = (): ColorMode => {
    const savedMode = localStorage.getItem('colorMode') as ColorMode;
    return savedMode || (prefersDarkMode ? 'dark' : 'light');
  };
  const [mode, setMode] = useState<ColorMode>(getInitialMode);

  const colorMode = useMemo(() => {
    return {
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('colorMode', nextMode);
          return nextMode;
        });
      },
    };
  }, []);

  const theme = useMemo(() => {
    const currentTheme =
      mode === 'light' ? customThemeObject.light : customThemeObject.dark;
    return createTheme({ palette: { mode, ...currentTheme } });
  }, [mode]);

  // Update the body class based on the mode
  // This is to ensure that the scrollbar color changes based on the mode
  useEffect(() => {
    document.body.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
