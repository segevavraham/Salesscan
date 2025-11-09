import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './hooks/useAuth';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MeetingsPage from './pages/meeting/MeetingsPage';
import MeetingDetailPage from './pages/meeting/MeetingDetailPage';
import LiveMeetingPage from './pages/meeting/LiveMeetingPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Components
import Layout from './components/common/Layout';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Private routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="meetings/:id" element={<MeetingDetailPage />} />
        <Route path="meetings/live/:id" element={<LiveMeetingPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
