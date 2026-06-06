import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
} from '@mui/material';
import { BarChart, People, Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { label: '数据总览', path: '/admin/overview', icon: BarChart },
    { label: '用户管理', path: '/admin/user-manager', icon: People },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#1a1a2e',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #333' }}>
          <Typography variant="h5" fontWeight="bold">
            同途打卡
          </Typography>
          <Typography variant="body2" color="#aaa">
            管理后台
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <ListItem
                button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: location.pathname === item.path ? '#6366f1' : 'transparent',
                  '&:hover': { backgroundColor: '#333' },
                }}
              >
                <ListItemIcon sx={{ color: '#fff' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            );
          })}
        </List>
        <Box sx={{ mt: 'auto', p: 3, borderTop: '1px solid #333' }}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={handleLogout}
            startIcon={<Logout />}
          >
            退出登录
          </Button>
        </Box>
      </Drawer>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 4, borderBottom: '1px solid #eee' }}></Box>
        <Box sx={{ flex: 1, p: 4, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;