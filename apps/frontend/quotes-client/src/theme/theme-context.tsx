import { createContext } from 'react';

export type ColorMode = 'light' | 'dark';
export const ColorModeContext = createContext({
  toggleColorMode: () => {
    return;
  },
});
