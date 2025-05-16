import { Box } from '@mui/material';
import { Footer } from './footer';
import { Header } from './header';
import { Body } from './body';

export const Layout = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      minHeight="100dvh"
    >
      {/* Sticky Header */}
      <Header />

      {/* Scrollable Body */}
      <Body />

      {/* static footer */}
      <Footer />
    </Box>
  );
};
