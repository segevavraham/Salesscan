import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  VpnKey,
  Settings,
  Security,
  Delete,
  Edit,
  Add,
  CheckCircle,
  Warning,
  Error,
  Info,
  Refresh,
  FilterList,
} from '@mui/icons-material';

interface Activity {
  id: string;
  type: 'user' | 'api' | 'system' | 'security';
  action: 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'error' | 'warning';
  user?: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'user',
    action: 'created',
    user: 'admin@example.com',
    description: 'Created new user: john.doe@example.com',
    timestamp: '2 minutes ago',
    severity: 'success',
  },
  {
    id: '2',
    type: 'api',
    action: 'updated',
    user: 'admin@example.com',
    description: 'Updated OpenAI API key',
    timestamp: '15 minutes ago',
    severity: 'info',
  },
  {
    id: '3',
    type: 'security',
    action: 'login',
    user: 'jane@example.com',
    description: 'Failed login attempt from IP: 192.168.1.100',
    timestamp: '1 hour ago',
    severity: 'warning',
  },
  {
    id: '4',
    type: 'system',
    action: 'error',
    description: 'Database connection timeout - Auto-recovered',
    timestamp: '2 hours ago',
    severity: 'error',
  },
  {
    id: '5',
    type: 'user',
    action: 'deleted',
    user: 'admin@example.com',
    description: 'Deleted user: old.user@example.com',
    timestamp: '3 hours ago',
    severity: 'warning',
  },
  {
    id: '6',
    type: 'api',
    action: 'warning',
    description: 'API quota reached 90% - OpenAI',
    timestamp: '4 hours ago',
    severity: 'warning',
  },
  {
    id: '7',
    type: 'system',
    action: 'updated',
    user: 'admin@example.com',
    description: 'Updated system settings: Email configuration',
    timestamp: '5 hours ago',
    severity: 'info',
  },
  {
    id: '8',
    type: 'security',
    action: 'login',
    user: 'admin@example.com',
    description: 'Successful admin login from IP: 192.168.1.1',
    timestamp: '6 hours ago',
    severity: 'success',
  },
];

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      user: <Person />,
      api: <VpnKey />,
      system: <Settings />,
      security: <Security />,
    };
    return icons[type];
  };

  const getActionIcon = (action: Activity['action']) => {
    const icons = {
      created: <Add />,
      updated: <Edit />,
      deleted: <Delete />,
      login: <CheckCircle />,
      logout: <Info />,
      error: <Error />,
      warning: <Warning />,
    };
    return icons[action];
  };

  const getSeverityColor = (severity: Activity['severity']) => {
    const colors = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'error',
    };
    return colors[severity] as any;
  };

  const getTypeColor = (type: Activity['type']) => {
    const colors = {
      user: '#667eea',
      api: '#10a37f',
      system: '#3b82f6',
      security: '#ef4444',
    };
    return colors[type];
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || activity.severity === severityFilter;
    return matchesType && matchesSeverity;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          📋 Activity Feed
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="api">API</MenuItem>
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="security">Security</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Severity</InputLabel>
            <Select value={severityFilter} label="Severity" onChange={(e) => setSeverityFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Timeline */}
      <Card elevation={2}>
        <CardContent>
          <Timeline position="right">
            {filteredActivities.map((activity, index) => (
              <TimelineItem key={activity.id}>
                <TimelineOppositeContent
                  sx={{ m: 'auto 0', minWidth: 120 }}
                  align="right"
                  variant="body2"
                  color="text.secondary"
                >
                  {activity.timestamp}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot
                    sx={{
                      bgcolor: getTypeColor(activity.type),
                      p: 1,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </TimelineDot>
                  {index < filteredActivities.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${getTypeColor(activity.type)}11 0%, ${getTypeColor(activity.type)}22 100%)`,
                      border: `1px solid ${getTypeColor(activity.type)}33`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        icon={getActionIcon(activity.action)}
                        label={activity.action.toUpperCase()}
                        size="small"
                        color={getSeverityColor(activity.severity)}
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={activity.type.toUpperCase()}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: getTypeColor(activity.type),
                          color: getTypeColor(activity.type),
                        }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {activity.description}
                    </Typography>
                    {activity.user && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: getTypeColor(activity.type) }}>
                          {activity.user.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {activity.user}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </CardContent>
      </Card>
    </Box>
  );
}
