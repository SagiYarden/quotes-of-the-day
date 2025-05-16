import { Box, Paper, Typography, Chip, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import LaunchIcon from '@mui/icons-material/Launch';
import { Quote } from '@monorepo/quotes-interfaces';

type QuoteCardProps = {
  quote: Quote;
};

export const QuoteCard = ({ quote }: QuoteCardProps) => (
  <Paper
    variant="outlined"
    sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
  >
    {/* Quote Text */}
    <Typography variant="body1" fontStyle="italic">
      “{quote.body}”
    </Typography>

    {/* Author */}
    <Typography variant="subtitle2" textAlign="right">
      — {quote.author}
    </Typography>

    {/* Tags */}
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {quote.tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" />
      ))}
    </Box>

    {/* Stats + Link */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <FavoriteIcon fontSize="small" color="error" />
        <Typography variant="caption">{quote.favorites_count}</Typography>
        <ThumbUpIcon fontSize="small" color="success" sx={{ ml: 1 }} />
        <Typography variant="caption">{quote.upvotes_count}</Typography>
        <ThumbDownIcon fontSize="small" color="warning" sx={{ ml: 1 }} />
        <Typography variant="caption">{quote.downvotes_count}</Typography>
      </Box>
      <IconButton
        size="small"
        component="a"
        href={quote.url}
        target="_blank"
        rel="noopener"
      >
        <LaunchIcon fontSize="small" />
      </IconButton>
    </Box>
  </Paper>
);
