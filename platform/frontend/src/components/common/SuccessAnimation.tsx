import { Box, Typography, Fade, Zoom } from '@mui/material';
import { CheckCircle, Check, Done, Star } from '@mui/icons-material';
import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  message?: string;
  duration?: number;
  onComplete?: () => void;
  variant?: 'checkmark' | 'celebration' | 'pulse';
}

export function CheckmarkAnimation() {
  return (
    <Zoom in timeout={300}>
      <Box
        sx={{
          position: 'relative',
          width: 120,
          height: 120,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            animation: 'pulse 1s ease-in-out',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(0)',
                opacity: 0.8,
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 1,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        />
        <CheckCircle
          sx={{
            fontSize: 80,
            color: 'white',
            zIndex: 1,
            animation: 'checkmark 0.8s ease-in-out',
            '@keyframes checkmark': {
              '0%': {
                transform: 'scale(0) rotate(-45deg)',
                opacity: 0,
              },
              '50%': {
                transform: 'scale(1.2) rotate(10deg)',
              },
              '100%': {
                transform: 'scale(1) rotate(0deg)',
                opacity: 1,
              },
            },
          }}
        />
      </Box>
    </Zoom>
  );
}

export function CelebrationAnimation() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 120,
        height: 120,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Confetti particles */}
      {Array.from({ length: 12 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: `hsl(${index * 30}, 70%, 60%)`,
            animation: `confetti-${index} 1.5s ease-out`,
            [`@keyframes confetti-${index}`]: {
              '0%': {
                transform: `translate(0, 0) rotate(0deg)`,
                opacity: 1,
              },
              '100%': {
                transform: `translate(${Math.cos((index * Math.PI) / 6) * 100}px, ${
                  Math.sin((index * Math.PI) / 6) * 100
                }px) rotate(${index * 30}deg)`,
                opacity: 0,
              },
            },
          }}
        />
      ))}
      <Star
        sx={{
          fontSize: 80,
          color: '#fbbf24',
          zIndex: 1,
          animation: 'star 1s ease-in-out',
          '@keyframes star': {
            '0%, 100%': {
              transform: 'scale(1) rotate(0deg)',
            },
            '50%': {
              transform: 'scale(1.3) rotate(180deg)',
            },
          },
        }}
      />
    </Box>
  );
}

export function PulseAnimation() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 120,
        height: 120,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Ripple effect */}
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '3px solid #10b981',
            animation: `ripple 2s ease-out infinite`,
            animationDelay: `${index * 0.4}s`,
            '@keyframes ripple': {
              '0%': {
                transform: 'scale(0.3)',
                opacity: 1,
              },
              '100%': {
                transform: 'scale(1.5)',
                opacity: 0,
              },
            },
          }}
        />
      ))}
      <Done
        sx={{
          fontSize: 60,
          color: '#10b981',
          zIndex: 1,
        }}
      />
    </Box>
  );
}

export default function SuccessAnimation({
  message = 'Success!',
  duration = 2000,
  onComplete,
  variant = 'checkmark',
}: SuccessAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Wait for fade out
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const AnimationComponent =
    variant === 'checkmark'
      ? CheckmarkAnimation
      : variant === 'celebration'
        ? CelebrationAnimation
        : PulseAnimation;

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          py: 4,
        }}
      >
        <AnimationComponent />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
}

// Mini success badge for inline use
export function SuccessBadge({ message = 'Saved' }: { message?: string }) {
  return (
    <Zoom in timeout={200}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <Check fontSize="small" />
        {message}
      </Box>
    </Zoom>
  );
}
