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
import { BarChart, People, CheckCircle, LibraryBooks, Person, Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { label: '数据总览', path: '/user/overview', icon: BarChart },
    { label: '搭子列表', path: '/user/friends', icon: People },
    { label: '互督打卡', path: '/user/clock', icon: CheckCircle },
    { label: '互督日记', path: '/user/diary', icon: LibraryBooks },
    { label: '个人主页', path: '/user/profile', icon: Person },
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
            {user?.nickname || user?.id}
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
        <Box sx={{ flex: 1, p: 4, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;