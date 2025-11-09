import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, People, Assessment, AttachMoney } from '@mui/icons-material';

// Mock data
const userGrowthData = [
  { month: 'Jan', users: 420, active: 380, premium: 120 },
  { month: 'Feb', users: 580, active: 520, premium: 165 },
  { month: 'Mar', users: 720, active: 650, premium: 210 },
  { month: 'Apr', users: 890, active: 800, premium: 280 },
  { month: 'May', users: 1050, active: 950, premium: 340 },
  { month: 'Jun', users: 1247, active: 1120, premium: 425 },
];

const revenueData = [
  { month: 'Jan', revenue: 12400, costs: 8200 },
  { month: 'Feb', revenue: 18500, costs: 9100 },
  { month: 'Mar', revenue: 24600, costs: 10200 },
  { month: 'Apr', revenue: 32800, costs: 11500 },
  { month: 'May', revenue: 45200, costs: 13200 },
  { month: 'Jun', revenue: 58700, costs: 15800 },
];

const apiUsageData = [
  { name: 'OpenAI', value: 45234, color: '#10a37f' },
  { name: 'AssemblyAI', value: 12450, color: '#3b82f6' },
  { name: 'Eleven Labs', value: 8123, color: '#8b5cf6' },
  { name: 'Other', value: 3200, color: '#94a3b8' },
];

const meetingStatsData = [
  { day: 'Mon', meetings: 42, successful: 38, duration: 1250 },
  { day: 'Tue', meetings: 56, successful: 51, duration: 1680 },
  { day: 'Wed', meetings: 38, successful: 34, duration: 1140 },
  { day: 'Thu', meetings: 64, successful: 59, duration: 1920 },
  { day: 'Fri', meetings: 71, successful: 68, duration: 2130 },
  { day: 'Sat', meetings: 28, successful: 25, duration: 840 },
  { day: 'Sun', meetings: 19, successful: 17, duration: 570 },
];

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('6m');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          📊 Advanced Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={chartType === 'line' ? 'contained' : 'outlined'}
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'area' ? 'contained' : 'outlined'}
              onClick={() => setChartType('area')}
            >
              Area
            </Button>
            <Button
              variant={chartType === 'bar' ? 'contained' : 'outlined'}
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
          </ButtonGroup>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="1m">Last Month</MenuItem>
              <MenuItem value="3m">Last 3 Months</MenuItem>
              <MenuItem value="6m">Last 6 Months</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <People /> User Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'line' && (
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={2} />
                    <Line type="monotone" dataKey="active" stroke="#10a37f" strokeWidth={2} />
                    <Line type="monotone" dataKey="premium" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                )}
                {chartType === 'area' && (
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="active" stackId="2" stroke="#10a37f" fill="#10a37f" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="premium" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  </AreaChart>
                )}
                {chartType === 'bar' && (
                  <BarChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#667eea" />
                    <Bar dataKey="active" fill="#10a37f" />
                    <Bar dataKey="premium" fill="#f59e0b" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* API Usage Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment /> API Usage Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={apiUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {apiUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney /> Revenue & Costs
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="costs"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Meeting Stats */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                📅 Weekly Meeting Statistics
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={meetingStatsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="meetings" fill="#667eea" />
                  <Bar dataKey="successful" fill="#10a37f" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
