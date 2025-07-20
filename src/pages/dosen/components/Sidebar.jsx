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
import { Dashboard, School, People, Person, ExitToApp, Menu, AssignmentTurnedIn, Quiz, Description, Diversity3 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../../services/AuthService';

const Sidebar = ({ open, handleDrawerToggle, role }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: `/${role}` },
    { text: 'Mata Kuliah', icon: <School />, path: `/${role}/courses` },
    ...(role === 'dosen' ? [
      { text: 'Validasi Nilai', icon: <AssignmentTurnedIn />, path: `/${role}/grade-validation` },
      { text: 'Manajemen Ujian', icon: <Quiz />, path: `/${role}/exams` }
    ] : []),
    { text: 'Rekapitulasi', icon: <People />, path: `/${role}/progress` },
    { text: 'Manajemen Skripsi', icon: <Description  />, path: `/${role}/bank-skripsi` },
    { text: 'Tim KBK', icon: <Diversity3 />, path: `/${role}/kbk` },
    { text: 'Profil', icon: <Person />, path: `/${role}/profile` },
        
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 260 : 70,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 260 : 70,
          bgcolor: '#092669', // Removed !important, relying on specificity
          color: '#FFFFFF',
          borderRight: '1px solid rgba(134, 102, 0, 0.3)',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
          borderRadius: 0,
          top: '64px', // Below header
          height: 'calc(100vh - 64px)', // Adjust for header height
          // Ensure theme's MuiPaper background does not override
          background: '#092669', // Explicitly set background
          backgroundImage: 'none', // Remove any gradient
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
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
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