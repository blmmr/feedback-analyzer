import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress,
  Chip,
  Alert,
  ThemeProvider,
  createTheme,
  styled
} from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import PsychologyIcon from '@mui/icons-material/Psychology';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2E7D32', // Forest green
      light: '#4CAF50', // Lighter green
      dark: '#1B5E20', // Darker green
    },
    secondary: {
      main: '#81C784', // Light sage green
      light: '#A5D6A7', // Pale green
      dark: '#558B2F', // Olive green
    },
    background: {
      default: '#1B1B1B', // Very dark gray, almost black
      paper: '#2D2D2D',   // Dark gray for paper elements
    },
    text: {
      primary: '#E8F5E9', // Light green-white
      secondary: '#A5D6A7', // Pale green
    },
  },
  typography: {
    fontFamily: '"Roboto Mono", monospace',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      marginBottom: '1rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
      marginBottom: '0.8rem',
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'none',
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // No default gradient
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: theme.palette.primary.light,
    },
  },
}));

const KeywordChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const ResultBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.primary.dark}`,
}));

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/analyze', { text });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      setError('Failed to analyze feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get sentiment icon
  const getSentimentIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'positive':
        return <SentimentSatisfiedAltIcon sx={{ color: theme.palette.secondary.light, fontSize: 40 }} />;
      case 'negative':
        return <SentimentDissatisfiedIcon sx={{ color: theme.palette.error.main, fontSize: 40 }} />;
      default:
        return <SentimentNeutralIcon sx={{ color: theme.palette.secondary.main, fontSize: 40 }} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            <PsychologyIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} />
            Feedback Analyzer
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Analyze the sentiment and extract key insights from your feedback
          </Typography>
        </Box>

        <StyledPaper elevation={3}>
          <form onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Enter your feedback"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your feedback here..."
              required
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={loading || !text.trim()}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
            </Button>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <ResultBox>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getSentimentIcon(result.sentiment.label)}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h2" component="h2">
                    Sentiment Analysis
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {result.sentiment.label.charAt(0).toUpperCase() + result.sentiment.label.slice(1)} 
                    (Confidence: {(result.sentiment.score * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h2" component="h2" gutterBottom>
                Key Insights
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.keywords.map((keyword, index) => (
                  <KeywordChip
                    key={index}
                    label={keyword}
                    size="medium"
                  />
                ))}
              </Box>
            </ResultBox>
          )}
        </StyledPaper>
      </Container>
    </ThemeProvider>
  );
}

export default App;