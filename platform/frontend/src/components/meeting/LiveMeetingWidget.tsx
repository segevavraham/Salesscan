import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Button,
  Tooltip,
  Fade,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  DragIndicator,
  Close,
  ExpandMore,
  ExpandLess,
  Lightbulb,
  Warning,
  QuestionAnswer,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';
import Draggable from 'react-draggable';

interface Objection {
  id: string;
  text: string;
  type: 'price' | 'timing' | 'competitor' | 'authority' | 'need' | 'trust';
  timestamp: number;
  confidence: number;
  suggestions: ResponseSuggestion[];
}

interface Question {
  id: string;
  text: string;
  category: 'product' | 'pricing' | 'implementation' | 'support' | 'technical';
  timestamp: number;
  suggestions: ResponseSuggestion[];
}

interface ResponseSuggestion {
  id: string;
  text: string;
  type: 'direct' | 'story' | 'question' | 'data';
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

interface LiveMeetingWidgetProps {
  meetingId: string;
  onClose?: () => void;
}

export default function LiveMeetingWidget({ meetingId, onClose }: LiveMeetingWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentObjection, setCurrentObjection] = useState<Objection | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragRef = useRef(null);

  // Simulate real-time updates (replace with WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock objection detection
      if (Math.random() > 0.7) {
        const mockObjection: Objection = {
          id: Date.now().toString(),
          text: "It seems expensive compared to what we're currently using",
          type: 'price',
          timestamp: Date.now(),
          confidence: 0.87,
          suggestions: [
            {
              id: '1',
              text: "I understand budget is a key consideration. Let me show you the ROI our customers typically see within the first quarter...",
              type: 'data',
              priority: 'high',
              reasoning: 'Addresses price concern with concrete value proof',
            },
            {
              id: '2',
              text: "That's a fair point. Can you share what you're currently paying and what features you're using? I want to make sure we're comparing apples to apples.",
              type: 'question',
              priority: 'high',
              reasoning: 'Uncovers the real comparison and builds value',
            },
            {
              id: '3',
              text: "Many of our best customers said the same thing initially. What they found was that the time savings alone paid for the investment within 2 months. Would you like to see a breakdown?",
              type: 'story',
              priority: 'medium',
              reasoning: 'Uses social proof and offers concrete next step',
            },
          ],
        };
        setCurrentObjection(mockObjection);
        setCurrentQuestion(null);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getObjectionColor = (type: Objection['type']) => {
    const colors = {
      price: '#ff6b6b',
      timing: '#feca57',
      competitor: '#48dbfb',
      authority: '#ff9ff3',
      need: '#54a0ff',
      trust: '#00d2d3',
    };
    return colors[type];
  };

  const getObjectionIcon = (type: Objection['type']) => {
    const icons = {
      price: '💰',
      timing: '⏰',
      competitor: '🏢',
      authority: '👤',
      need: '🎯',
      trust: '🤝',
    };
    return icons[type];
  };

  if (isMinimized) {
    return (
      <Draggable nodeRef={dragRef} handle=".drag-handle">
        <Paper
          ref={dragRef}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 9999,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 15px 50px rgba(102, 126, 234, 0.5)',
            },
          }}
          onClick={handleMinimize}
          className="drag-handle"
        >
          <Lightbulb sx={{ fontSize: 40, color: 'white' }} />
        </Paper>
      </Draggable>
    );
  }

  return (
    <Draggable nodeRef={dragRef} handle=".drag-handle" bounds="parent">
      <Paper
        ref={dragRef}
        elevation={24}
        sx={{
          position: 'fixed',
          top: '50%',
          right: 24,
          transform: 'translateY(-50%)',
          width: isExpanded ? 480 : 400,
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset
          `,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          className="drag-handle"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'move',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DragIndicator sx={{ color: 'white', opacity: 0.7 }} />
            <Lightbulb sx={{ color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              AI Sales Coach
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{ color: 'white' }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Minimize">
              <IconButton size="small" onClick={handleMinimize} sx={{ color: 'white' }}>
                <ExpandMore />
              </IconButton>
            </Tooltip>
            {onClose && (
              <Tooltip title="Close">
                <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Collapse in={isExpanded}>
          <Box
            sx={{
              p: 3,
              maxHeight: 'calc(90vh - 80px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(102, 126, 234, 0.3)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.5)',
                },
              },
            }}
          >
            {/* Objection Detected */}
            {currentObjection && (
              <Fade in={true}>
                <Box sx={{ mb: 3 }}>
                  <Alert
                    severity="warning"
                    icon={<Warning />}
                    sx={{
                      mb: 2,
                      background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
                      border: `2px solid ${getObjectionColor(currentObjection.type)}`,
                      borderRadius: 3,
                      '& .MuiAlert-icon': {
                        color: getObjectionColor(currentObjection.type),
                      },
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {getObjectionIcon(currentObjection.type)} Objection Detected
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                      "{currentObjection.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={currentObjection.type.toUpperCase()}
                        size="small"
                        sx={{
                          background: getObjectionColor(currentObjection.type),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={`${Math.round(currentObjection.confidence * 100)}% Confident`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Alert>

                  {/* Suggestions */}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    💡 Suggested Responses
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {currentObjection.suggestions.map((suggestion, index) => (
                      <Fade in={true} timeout={300 * (index + 1)} key={suggestion.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            background:
                              suggestion.priority === 'high'
                                ? 'linear-gradient(135deg, #f5f7ff 0%, #e8edff 100%)'
                                : 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
                            border:
                              suggestion.priority === 'high'
                                ? '2px solid #667eea'
                                : '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 3,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            },
                          }}
                        >
                          {/* Priority Badge */}
                          {suggestion.priority === 'high' && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderBottomLeftRadius: 12,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                              }}
                            >
                              ⭐ RECOMMENDED
                            </Box>
                          )}

                          {/* Type Badge */}
                          <Box sx={{ mb: 1.5 }}>
                            <Chip
                              label={suggestion.type.toUpperCase()}
                              size="small"
                              sx={{
                                fontSize: 10,
                                height: 20,
                                fontWeight: 600,
                                background: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                              }}
                            />
                          </Box>

                          {/* Response Text */}
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 2,
                              lineHeight: 1.7,
                              color: '#2c3e50',
                              fontWeight: 500,
                            }}
                          >
                            {suggestion.text}
                          </Typography>

                          {/* Reasoning */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mb: 1.5,
                              color: '#7f8c8d',
                              fontStyle: 'italic',
                              fontSize: 11,
                            }}
                          >
                            💭 {suggestion.reasoning}
                          </Typography>

                          {/* Copy Button */}
                          <Button
                            fullWidth
                            size="small"
                            variant={copiedId === suggestion.id ? 'contained' : 'outlined'}
                            color={copiedId === suggestion.id ? 'success' : 'primary'}
                            startIcon={
                              copiedId === suggestion.id ? <CheckCircle /> : <ContentCopy />
                            }
                            onClick={() => handleCopy(suggestion.text, suggestion.id)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            {copiedId === suggestion.id ? 'Copied!' : 'Copy Response'}
                          </Button>
                        </Paper>
                      </Fade>
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}

            {/* No Active Items */}
            {!currentObjection && !currentQuestion && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                }}
              >
                <CircularProgress
                  size={40}
                  sx={{
                    mb: 2,
                    color: '#667eea',
                  }}
                />
                <Typography variant="body1" sx={{ color: '#7f8c8d', mb: 1 }}>
                  Listening to conversation...
                </Typography>
                <Typography variant="caption" sx={{ color: '#bdc3c7' }}>
                  I'll alert you when I detect objections or questions
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Footer */}
        <Box
          sx={{
            borderTop: '1px solid rgba(0,0,0,0.08)',
            p: 1.5,
            background: 'rgba(102, 126, 234, 0.03)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00d2d3',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 600 }}>
            Live Coaching Active
          </Typography>
        </Box>
      </Paper>
    </Draggable>
  );
}
