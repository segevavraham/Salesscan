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
  Checkbox,
  Alert,
  DialogContentText,
  Collapse,
  Stack,
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
  DeleteSweep,
  GroupRemove,
  Security,
  Warning,
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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    severity: 'warning' | 'error';
    action: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    severity: 'warning',
    action: () => {},
  });
  const [bulkAction, setBulkAction] = useState<'suspend' | 'delete' | 'role' | null>(null);
  const [bulkRole, setBulkRole] = useState<User['role']>('USER');

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

  const openConfirmDialog = (
    title: string,
    message: string,
    action: () => void,
    severity: 'warning' | 'error' = 'warning'
  ) => {
    setConfirmDialog({ open: true, title, message, severity, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleDelete = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    openConfirmDialog(
      'Delete User',
      `Are you sure you want to permanently delete "${user?.name}"? This action cannot be undone.`,
      () => {
        setUsers(users.filter((u) => u.id !== userId));
        closeConfirmDialog();
      },
      'error'
    );
  };

  const handleSuspend = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    openConfirmDialog(
      'Suspend User',
      `Are you sure you want to suspend "${user?.name}"? They will lose access to the platform until reactivated.`,
      () => {
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: 'suspended' as const } : u)));
        closeConfirmDialog();
      }
    );
  };

  // Bulk selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUserIds(filteredUsers.map((user) => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;
  const isSomeSelected = selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length;

  // Bulk action handlers
  const handleBulkSuspend = () => {
    openConfirmDialog(
      'Suspend Selected Users',
      `Are you sure you want to suspend ${selectedUserIds.length} user(s)? They will lose access to the platform.`,
      () => {
        setUsers(
          users.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: 'suspended' as const } : u))
        );
        setSelectedUserIds([]);
        closeConfirmDialog();
      }
    );
  };

  const handleBulkDelete = () => {
    openConfirmDialog(
      'Delete Selected Users',
      `⚠️ DANGER: You are about to permanently delete ${selectedUserIds.length} user(s). This action CANNOT be undone. All their data, meetings, and history will be lost forever.`,
      () => {
        setUsers(users.filter((u) => !selectedUserIds.includes(u.id)));
        setSelectedUserIds([]);
        closeConfirmDialog();
      },
      'error'
    );
  };

  const handleBulkChangeRole = () => {
    setUsers(
      users.map((u) => (selectedUserIds.includes(u.id) ? { ...u, role: bulkRole } : u))
    );
    setSelectedUserIds([]);
    setBulkAction(null);
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

      {/* Bulk Actions Toolbar */}
      <Collapse in={selectedUserIds.length > 0}>
        <Alert
          severity="info"
          icon={<CheckCircle />}
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #667eea22 0%, #764ba244 100%)',
            border: '2px solid #667eea',
          }}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Block />}
                onClick={handleBulkSuspend}
                sx={{ borderColor: '#f59e0b', color: '#f59e0b' }}
              >
                Suspend ({selectedUserIds.length})
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Security />}
                onClick={() => setBulkAction('role')}
                sx={{ borderColor: '#3b82f6', color: '#3b82f6' }}
              >
                Change Role
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DeleteSweep />}
                onClick={handleBulkDelete}
                sx={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                Delete ({selectedUserIds.length})
              </Button>
            </Stack>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedUserIds.length} user(s) selected
          </Typography>
        </Alert>
      </Collapse>

      {/* Bulk Role Change Dialog */}
      <Dialog open={bulkAction === 'role'} onClose={() => setBulkAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Role for Selected Users</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>New Role</InputLabel>
              <Select value={bulkRole} label="New Role" onChange={(e) => setBulkRole(e.target.value as User['role'])}>
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="TEAM_LEADER">Team Leader</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="warning" sx={{ mt: 2 }}>
              This will change the role for {selectedUserIds.length} user(s).
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAction(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkChangeRole}>
            Change Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Users Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={handleSelectAll}
                  color="primary"
                />
              </TableCell>
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
              <TableRow
                key={user.id}
                hover
                selected={selectedUserIds.includes(user.id)}
                sx={{
                  backgroundColor: selectedUserIds.includes(user.id) ? '#667eea11' : 'inherit',
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    color="primary"
                  />
                </TableCell>
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            border: confirmDialog.severity === 'error' ? '3px solid #ef4444' : '2px solid #f59e0b',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            background:
              confirmDialog.severity === 'error'
                ? 'linear-gradient(135deg, #ef444422 0%, #dc262644 100%)'
                : 'linear-gradient(135deg, #f59e0b22 0%, #d9770644 100%)',
            borderBottom: confirmDialog.severity === 'error' ? '2px solid #ef4444' : '2px solid #f59e0b',
          }}
        >
          <Warning
            sx={{
              fontSize: 32,
              color: confirmDialog.severity === 'error' ? '#ef4444' : '#f59e0b',
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {confirmDialog.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity={confirmDialog.severity} sx={{ mb: 2 }}>
            <DialogContentText sx={{ color: 'inherit', fontWeight: 600 }}>
              {confirmDialog.message}
            </DialogContentText>
          </Alert>
          {confirmDialog.severity === 'error' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please double-check before proceeding. This is a destructive action.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeConfirmDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.action}
            variant="contained"
            color={confirmDialog.severity === 'error' ? 'error' : 'warning'}
            startIcon={confirmDialog.severity === 'error' ? <Delete /> : <Warning />}
          >
            {confirmDialog.severity === 'error' ? 'Delete Permanently' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
