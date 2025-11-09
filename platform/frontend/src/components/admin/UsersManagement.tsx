import { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Email,
  Phone,
  PersonAdd,
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'TEAM_LEADER' | 'ADMIN';
  status: 'active' | 'suspended' | 'inactive';
  lastLogin: string;
  meetingsCount: number;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'ADMIN',
    status: 'active',
    lastLogin: '2 hours ago',
    meetingsCount: 145,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'TEAM_LEADER',
    status: 'active',
    lastLogin: '1 day ago',
    meetingsCount: 89,
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'USER',
    status: 'active',
    lastLogin: '5 minutes ago',
    meetingsCount: 23,
    createdAt: '2024-03-10',
  },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getRoleColor = (role: User['role']) => {
    const colors = {
      ADMIN: 'error',
      TEAM_LEADER: 'warning',
      USER: 'primary',
    };
    return colors[role] as any;
  };

  const getStatusColor = (status: User['status']) => {
    const colors = {
      active: 'success',
      suspended: 'warning',
      inactive: 'default',
    };
    return colors[status] as any;
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleSuspend = (userId: string) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: 'suspended' as const } : u))
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          👥 User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => {
            setSelectedUser(null);
            setOpenDialog(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Add New User
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search users by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Users Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Meetings</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#667eea' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Joined {user.createdAt}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    {user.email}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={getStatusColor(user.status)}
                    size="small"
                    icon={user.status === 'active' ? <CheckCircle /> : <Block />}
                  />
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <Chip
                    label={user.meetingsCount}
                    size="small"
                    sx={{ fontWeight: 600 }}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(user)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Suspend">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleSuspend(user.id)}
                      >
                        <Block fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit/Add User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              defaultValue={selectedUser?.name}
              placeholder="John Doe"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              defaultValue={selectedUser?.email}
              placeholder="john@example.com"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select defaultValue={selectedUser?.role || 'USER'} label="Role">
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="TEAM_LEADER">Team Leader</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select defaultValue={selectedUser?.status || 'active'} label="Status">
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
