import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FiberManualRecord,
  Stop,
  Mic,
  MicOff,
  PlayArrow,
  Pause,
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import LiveMeetingWidget from '../../components/meeting/LiveMeetingWidget';
import { objectionDetector } from '../../services/objectionDetector';
import { questionAnalyzer } from '../../services/questionAnalyzer';

interface TranscriptSegment {
  id: string;
  speaker: 'client' | 'salesperson';
  text: string;
  timestamp: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export default function LiveMeetingPage() {
  const { id } = useParams<{ id: string }>();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [currentSentiment, setCurrentSentiment] = useState<'positive' | 'neutral' | 'negative'>(
    'neutral'
  );
  const [talkRatio, setTalkRatio] = useState({ you: 45, client: 55 });
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [buyingSignals, setBuyingSignals] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    socketRef.current = io(wsUrl, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    socketRef.current.on('transcription:segment', (segment: TranscriptSegment) => {
      handleTranscriptSegment(segment);
    });

    socketRef.current.on('sentiment:update', (sentiment: string) => {
      setCurrentSentiment(sentiment as any);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleTranscriptSegment = (segment: TranscriptSegment) => {
    setTranscript((prev) => [...prev, segment]);

    // Analyze for objections
    const objection = objectionDetector.detectObjections(segment.text, segment.speaker);
    if (objection) {
      console.log('🚨 Objection detected:', objection);
      // Widget will handle display
    }

    // Analyze for questions
    const question = questionAnalyzer.analyzeQuestion(segment.text, segment.speaker);
    if (question) {
      console.log('❓ Question detected:', question);
      setQuestionsAsked((prev) => prev + 1);

      const signal = questionAnalyzer.getBuyingSignal(question);
      if (signal === 'strong' || signal === 'moderate') {
        setBuyingSignals((prev) => prev + 1);
      }
    }

    // Update talk ratio
    updateTalkRatio(segment.speaker);
  };

  const updateTalkRatio = (speaker: 'client' | 'salesperson') => {
    setTalkRatio((prev) => {
      const total = prev.you + prev.client;
      if (speaker === 'salesperson') {
        return {
          you: Math.min(100, prev.you + 1),
          client: Math.max(0, prev.client - 1),
        };
      } else {
        return {
          you: Math.max(0, prev.you - 1),
          client: Math.min(100, prev.client + 1),
        };
      }
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current) {
          // Send audio chunk to backend
          const reader = new FileReader();
          reader.readAsArrayBuffer(event.data);
          reader.onloadend = () => {
            socketRef.current?.emit('audio:chunk', {
              meetingId: id,
              audioData: reader.result,
            });
          };
        }
      };

      mediaRecorderRef.current.start(1000); // Send chunk every second
      setIsRecording(true);

      // Emit meeting start
      socketRef.current?.emit('meeting:start', { meetingId: id });
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    socketRef.current?.emit('meeting:end', { meetingId: id });
  };

  const togglePause = () => {
    if (isPaused) {
      mediaRecorderRef.current?.resume();
    } else {
      mediaRecorderRef.current?.pause();
    }
    setIsPaused(!isPaused);
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = () => {
    return currentSentiment === 'positive'
      ? '#00d2d3'
      : currentSentiment === 'negative'
      ? '#ff6b6b'
      : '#95a5a6';
  };

  const getSentimentEmoji = () => {
    return currentSentiment === 'positive' ? '😊' : currentSentiment === 'negative' ? '😟' : '😐';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isRecording && !isPaused && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  >
                    <FiberManualRecord sx={{ color: '#ff6b6b', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 700 }}>
                      LIVE
                    </Typography>
                  </Box>
                )}
                {isPaused && (
                  <Chip label="PAUSED" color="warning" sx={{ fontWeight: 700 }} />
                )}
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatDuration(duration)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {!isRecording ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Mic />}
                    onClick={startRecording}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      px: 4,
                      py: 1.5,
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    Start Recording
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={isPaused ? <PlayArrow /> : <Pause />}
                      onClick={togglePause}
                      sx={{ px: 3 }}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Stop />}
                      onClick={stopRecording}
                      sx={{ px: 3 }}
                    >
                      End Meeting
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Sentiment
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4">{getSentimentEmoji()}</Typography>
                  <Typography variant="h5" sx={{ color: getSentimentColor(), fontWeight: 700 }}>
                    {currentSentiment.charAt(0).toUpperCase() + currentSentiment.slice(1)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Talk Ratio
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={talkRatio.client}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'rgba(102, 126, 234, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2">
                  You: {talkRatio.you}% | Client: {talkRatio.client}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Questions Asked
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#667eea' }}>
                  {questionsAsked}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Buying Signals
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#00d2d3' }}>
                  {buyingSignals}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transcript */}
        <Paper
          elevation={4}
          sx={{
            p: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            height: '50vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Live Transcription
          </Typography>
          <Box
            ref={transcriptContainerRef}
            sx={{
              flexGrow: 1,
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
              },
            }}
          >
            {transcript.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                {isRecording
                  ? 'Listening... Start speaking to see transcription.'
                  : 'Click "Start Recording" to begin'}
              </Typography>
            )}
            {transcript.map((segment) => (
              <Box
                key={segment.id}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background:
                    segment.speaker === 'salesperson'
                      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                      : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: segment.speaker === 'salesperson' ? '#1976d2' : '#7b1fa2',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  {segment.speaker === 'salesperson' ? '👤 You' : '🎯 Client'}
                </Typography>
                <Typography variant="body1">{segment.text}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>

      {/* AI Coaching Widget - Always visible and draggable */}
      {isRecording && <LiveMeetingWidget meetingId={id || ''} />}
    </Box>
  );
}
