import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Dashboard, School, People, Person, ExitToApp, Menu, Assignment, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../../services/AuthService';

const Sidebar = ({ open, handleDrawerToggle, role }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: `/${role}` },
    { text: 'Mata Kuliah', icon: <School />, path: `/${role}/courses` },
    { text: 'Kemajuan', icon: <People />, path: `/${role}/progress` },
    { text: 'Ujian', icon: <Assignment />, path: `/${role}/exams` },
    { text: 'Bank Skripsi', icon: <Description />, path: `/${role}/bank-skripsi` },
    { text: 'Profil', icon: <Person />, path: `/${role}/profile` },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally handle error (e.g., show notification)
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 0 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 260 : 70,
          bgcolor: '#050D31',
          color: '#FFFFFF',
          borderRight: '1px solid rgba(134, 102, 0, 0.3)',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
          borderRadius: 0,
          top: '64px',
          height: 'calc(100vh - 64px)',
        },
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: open ? 'space-between' : 'center', py: 2 }}>
        {open && (
          <Typography
            variant="h5"
            sx={{ fontFamily: '"Orbitron", sans-serif', color: '#efbf04', fontWeight: 700 }}
          >
            MALIGO
          </Typography>
        )}
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={handleDrawerToggle}
          sx={{ color: '#efbf04' }}
        >
          <Menu />
        </IconButton>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(134, 102, 0, 0.3)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(134, 102, 0, 0.2)', transform: 'translateX(4px)' },
                '& .MuiListItemIcon-root': { minWidth: 50 },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon sx={{ color: '#efbf04' }}>{item.icon}</ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 500, color: '#FFFFFF' }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ borderColor: 'rgba(134, 102, 0, 0.3)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 1.5,
              '&:hover': { bgcolor: 'rgba(134, 102, 0, 0.2)', transform: 'translateX(4px)' },
              '& .MuiListItemIcon-root': { minWidth: 50 },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ color: '#efbf04' }}>
              <ExitToApp />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Keluar"
                primaryTypographyProps={{ fontWeight: 500, color: '#FFFFFF' }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;