import { useState } from 'react';
import { Box, Grid, Typography, Button, Input } from '@mui/material';
import { useFetchQuotes } from '../hooks/use-fetch-quotes';
import { QuoteCard } from '../ui/quote-card';

export const Home = () => {
  const [rawQuotesCount, setRawQuotesCount] = useState(50);
  const [quotesCount, setQuotesCount] = useState(rawQuotesCount);

  const { quotes, loading, error } = useFetchQuotes({
    count: quotesCount,
    page: 1,
    pageSize: 25,
  });

  return (
    <Box sx={{ my: 4, width: '100%' }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          gutterBottom
          fontWeight="bold"
          sx={{
            fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
          }}
        >
          Random Quotes
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Stay updated with the latest quotes.
        </Typography>
      </Box>

      {/* Quotes Input */}
      <Box
        sx={{
          mb: 4,
          textAlign: 'center',
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          How many quotes would you like to see?
        </Typography>
        <Input
          placeholder="Quotes count"
          value={rawQuotesCount}
          type="number"
          sx={{ maxWidth: 100 }}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
              setRawQuotesCount(value);
            }
          }}
          onBlur={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
              if (value < 1) {
                setQuotesCount(1);
                return;
              }
              setQuotesCount(value);
            }
          }}
        />
      </Box>
      {/* Error Fetching */}
      {error && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" textAlign="center" color="error">
            There was an error fetching the quotes list, Please try again later.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: '16px' }}
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </Box>
      )}

      {/* Quotes grid */}
      <Box sx={{ mb: 6 }}>
        {loading ? (
          <Typography variant="h6" textAlign="center">
            Loading random quotes...
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {quotes.map((quote) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={quote.id}>
                <QuoteCard quote={quote} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};
