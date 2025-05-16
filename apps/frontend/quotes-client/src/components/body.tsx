import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router';

export const Body = () => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Container
        component="main"
        maxWidth={false}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflowY: 'auto',
          py: '16px',
          alignItems: 'center',
        }}
      >
        {/* Render the nested route content here */}
        <Outlet />
      </Container>
    </Box>
  );
};
