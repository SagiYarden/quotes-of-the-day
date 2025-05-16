import { useEffect, useRef, useState } from 'react';
import { Box, Grid, Typography, Button, Input, Skeleton } from '@mui/material';
import { usePaginatedQuotes } from '../hooks/use-paginated-quotes';
import { QuoteCard } from '../ui/quote-card';

export const Home = () => {
  const [quotesCount, setQuotesCount] = useState(12);
  const [paginationCount, setPaginationCount] = useState(quotesCount);
  const [filterTag, setFilterTag] = useState('');
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  
  const {
    items: quotes,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  } = usePaginatedQuotes({ count: paginationCount, tag: filterTag });

  useEffect(() => {
    // Don't set up observer if there are no more quotes
    if (!hasMore || !loadMoreTriggerRef.current) {
      console.log('No more quotes or no ref - not setting up observer');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreTriggerRef.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loadMore]);

  return (
    <Box sx={{ width: '100%' }}> 
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography
          variant="h3"
          gutterBottom
          fontWeight="bold"
          sx={{
            fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
            mb: 1,
          }}
        >
          Random Quotes
        </Typography>
        <Typography variant="h6" color="text.secondary" >
          Stay updated with the latest quotes.
        </Typography>
      </Box>

      {/* Tag Input */}
      <Box
        sx={{
          textAlign: 'center',
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          Which tag would you like to see quotes from?
        </Typography>
        <Input
          placeholder="Filter Tag"
          value={filterTag}
          type="text"
          sx={{ maxWidth: 100 }}
          onChange={(e) => {
           setFilterTag(e.target.value)
          }}
        />      
      </Box>

      {/* Quotes Input */}
      <Box
        sx={{
          mb: 2,
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
          value={quotesCount}
          type="number"
          sx={{ maxWidth: 100 }}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
              setQuotesCount(value);
            }
          }}
          onBlur={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
              // If the value is less than 1, set it to 1
              if (value < 1) {
                setQuotesCount(1);
              } else {
                setQuotesCount(value);
              }
            }
          }}
        />
 
      </Box>
      <Box
          sx={{
          mb: 4,
          textAlign: 'center',
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
         <Button
          variant="contained"
          onClick={() => {
            if (paginationCount !== quotesCount && quotesCount > 0) {
              setPaginationCount(quotesCount);
              reset();
            }
            if(filterTag !== '') {
              reset();
            }
          }}
        >
          Get Quotes
        </Button>
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
      <Grid container spacing={2}>
        {quotes.map((quote) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={quote.id}>
            <QuoteCard quote={quote} />
          </Grid>
        ))}
      </Grid>
      {/* Add skeleton loader here - shows only during initial load */}
      {loading && quotes.length === 0 && (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton
                variant="rectangular"
                height={180}
                sx={{ borderRadius: 1 }}
              />
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mb: 6 }}>
        {loading && (
          <Typography textAlign="center" mt={2}>
            Loading more...
          </Typography>
        )}

        {/* Load more trigger div */}
        <Box ref={loadMoreTriggerRef} style={{ height: '1px' }} />
      </Box>
    </Box>
  );
};
