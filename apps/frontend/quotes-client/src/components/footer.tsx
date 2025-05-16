import { Box, Typography } from '@mui/material';

export const Footer = () => (
  <Box
    sx={{ textAlign: 'center', p: 2, mt: 'auto', bgcolor: 'background.paper' }}
  >
    <Typography variant="body2">
      © {new Date().getFullYear()} Yarden Sagi
    </Typography>
  </Box>
);
