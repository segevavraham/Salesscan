import { useState } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Settings,
  Assessment,
  Security,
  VpnKey,
} from '@mui/icons-material';
import UsersManagement from '../../components/admin/UsersManagement';
import APIKeysManagement from '../../components/admin/APIKeysManagement';
import SystemSettings from '../../components/admin/SystemSettings';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import SystemLogs from '../../components/admin/SystemLogs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                🛡️ Admin Control Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage users, settings, and system configuration
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<Security />}>
                Security
              </Button>
              <Button variant="outlined" startIcon={<Assessment />}>
                Reports
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Users
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  1,247
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  +12% this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                  Active Sessions
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  89
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Live meetings now
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                  API Calls Today
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  45.2K
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  87% of quota
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                  System Health
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  99.9%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  All systems operational
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper
          elevation={4}
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 72,
                fontSize: 16,
              },
            }}
          >
            <Tab
              icon={<DashboardIcon />}
              label="Dashboard"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab icon={<People />} label="Users" iconPosition="start" sx={{ gap: 1 }} />
            <Tab icon={<VpnKey />} label="API Keys" iconPosition="start" sx={{ gap: 1 }} />
            <Tab icon={<Settings />} label="Settings" iconPosition="start" sx={{ gap: 1 }} />
            <Tab icon={<Assessment />} label="Analytics" iconPosition="start" sx={{ gap: 1 }} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={currentTab} index={0}>
              <AnalyticsDashboard />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <UsersManagement />
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <APIKeysManagement />
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
              <SystemSettings />
            </TabPanel>

            <TabPanel value={currentTab} index={4}>
              <SystemLogs />
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
