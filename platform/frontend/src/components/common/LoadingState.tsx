import { Box, Skeleton, Card, CardContent, Typography } from '@mui/material';
import { CircularProgress } from '@mui/material';

interface LoadingStateProps {
  type?: 'table' | 'cards' | 'chart' | 'full' | 'inline';
  rows?: number;
  message?: string;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={60} height={24} />
            </Box>
            <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={24} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export function ChartSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 300 }}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            sx={{
              flex: 1,
              height: `${Math.random() * 80 + 20}%`,
              borderRadius: '8px 8px 0 0',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: 3,
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="circular" width={12} height={12} animation="wave" />
        <Skeleton variant="circular" width={12} height={12} animation="wave" sx={{ animationDelay: '0.2s' }} />
        <Skeleton variant="circular" width={12} height={12} animation="wave" sx={{ animationDelay: '0.4s' }} />
      </Box>
    </Box>
  );
}

export function InlineLoader({ size = 24, message }: { size?: number; message?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={size} thickness={4} sx={{ color: '#667eea' }} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default function LoadingState({ type = 'full', rows = 5, message = 'Loading...' }: LoadingStateProps) {
  switch (type) {
    case 'table':
      return <TableSkeleton rows={rows} />;
    case 'cards':
      return <CardsSkeleton count={rows} />;
    case 'chart':
      return <ChartSkeleton />;
    case 'inline':
      return <InlineLoader message={message} />;
    case 'full':
    default:
      return <FullPageLoader message={message} />;
  }
}
