import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
} from '@mui/material';
import { TrendingUp, TrendingDown, People, AttachMoney, Timer, Check } from '@mui/icons-material';

export default function AnalyticsDashboard() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$127,450',
      change: '+12.5%',
      trend: 'up',
      icon: <AttachMoney />,
      color: '#10a37f',
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: <People />,
      color: '#3b82f6',
    },
    {
      title: 'Avg Session Time',
      value: '24m 32s',
      change: '-2.1%',
      trend: 'down',
      icon: <Timer />,
      color: '#f59e0b',
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+3.4%',
      trend: 'up',
      icon: <Check />,
      color: '#10b981',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        📊 Analytics Overview
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}44 100%)`,
                border: `2px solid ${stat.color}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {stat.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Usage Stats */}
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            📈 API Usage
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">OpenAI API</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  45,234 / 50,000 requests
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={90} sx={{ height: 10, borderRadius: 5 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">AssemblyAI API</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  12,450 / 20,000 requests
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={62} sx={{ height: 10, borderRadius: 5 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Eleven Labs API</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  8,123 / 15,000 requests
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={54} sx={{ height: 10, borderRadius: 5 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
