import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Download,
  Info,
  Warning,
  Error,
  CheckCircle,
} from '@mui/icons-material';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  user?: string;
  ip?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-11-09 18:45:23',
    level: 'info',
    category: 'AUTH',
    message: 'User login successful',
    user: 'john@example.com',
    ip: '192.168.1.100',
  },
  {
    id: '2',
    timestamp: '2024-11-09 18:44:15',
    level: 'success',
    category: 'API',
    message: 'OpenAI API request completed successfully',
    user: 'jane@example.com',
    ip: '192.168.1.101',
  },
  {
    id: '3',
    timestamp: '2024-11-09 18:43:02',
    level: 'warning',
    category: 'SYSTEM',
    message: 'High API usage detected - 87% of quota used',
    ip: 'system',
  },
  {
    id: '4',
    timestamp: '2024-11-09 18:42:30',
    level: 'error',
    category: 'DATABASE',
    message: 'Connection timeout - retrying...',
    ip: 'system',
  },
  {
    id: '5',
    timestamp: '2024-11-09 18:41:45',
    level: 'info',
    category: 'MEETING',
    message: 'New meeting started',
    user: 'bob@example.com',
    ip: '192.168.1.102',
  },
];

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getLevelIcon = (level: LogEntry['level']) => {
    const icons = {
      info: <Info />,
      warning: <Warning />,
      error: <Error />,
      success: <CheckCircle />,
    };
    return icons[level];
  };

  const getLevelColor = (level: LogEntry['level']) => {
    const colors = {
      info: 'info',
      warning: 'warning',
      error: 'error',
      success: 'success',
    };
    return colors[level] as any;
  };

  const getLevelBgColor = (level: LogEntry['level']) => {
    const colors = {
      info: '#e3f2fd',
      warning: '#fff3e0',
      error: '#ffebee',
      success: '#e8f5e9',
    };
    return colors[level];
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          📋 System Logs
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Logs">
            <IconButton>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Level</InputLabel>
              <Select
                value={levelFilter}
                label="Level"
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="AUTH">Authentication</MenuItem>
                <MenuItem value="API">API</MenuItem>
                <MenuItem value="SYSTEM">System</MenuItem>
                <MenuItem value="DATABASE">Database</MenuItem>
                <MenuItem value="MEETING">Meeting</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filteredLogs.map((log) => (
          <Card
            key={log.id}
            elevation={1}
            sx={{
              borderLeft: `4px solid`,
              borderLeftColor: getLevelColor(log.level),
              background: getLevelBgColor(log.level),
            }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Timestamp */}
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    minWidth: 140,
                  }}
                >
                  {log.timestamp}
                </Typography>

                {/* Level Badge */}
                <Chip
                  icon={getLevelIcon(log.level)}
                  label={log.level.toUpperCase()}
                  color={getLevelColor(log.level)}
                  size="small"
                  sx={{ minWidth: 100, fontWeight: 700 }}
                />

                {/* Category */}
                <Chip
                  label={log.category}
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: 120 }}
                />

                {/* Message */}
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {log.message}
                </Typography>

                {/* User */}
                {log.user && (
                  <Chip
                    label={log.user}
                    size="small"
                    variant="filled"
                    sx={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  />
                )}

                {/* IP */}
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    minWidth: 120,
                  }}
                >
                  {log.ip}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <Card elevation={2}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No logs found matching your filters
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
