import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/favicon.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  const navItems = [
    { label: 'Beranda', path: '/' },
    { label: 'Fitur', path: '/#features' },
    { label: 'Masuk', path: '/login' },
    { label: 'Daftar', path: '/register', variant: 'contained', color: 'secondary' },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{ background: 'linear-gradient(45deg, #050D31 30%, #1A237E 90%)', boxShadow: '0 0 15px rgba(134, 102, 0, 0.3)' }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="MALIGO Logo"
              sx={{ height: 40, mr: 1.5, objectFit: 'contain' }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#E0E7FF' }}>
              MALIGO
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color={item.color || 'inherit'}
                variant={item.variant || 'text'}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  color: item.color ? '#fff' : '#E0E7FF',
                  '&:hover': {
                    backgroundColor: 'rgba(134, 102, 0, 0.2)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
            <IconButton onClick={handleProfileClick} sx={{ ml: 2 }}>
              <Avatar sx={{ bgcolor: '#866600', color: '#fff' }}>
                {user ? user.username?.[0]?.toUpperCase() || 'U' : 'P'}
              </Avatar>
            </IconButton>
          </Box>

          {/* Mobile Hamburger Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open menu"
              edge="end"
              onClick={handleMenuOpen}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  backgroundColor: '#050D31',
                  color: '#E0E7FF',
                  minWidth: 200,
                  boxShadow: '0 0 15px rgba(134, 102, 0, 0.3)',
                },
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    handleMenuClose();
                  }}
                  sx={{ py: 1.5, '&:hover': { backgroundColor: 'rgba(134, 102, 0, 0.2)' } }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
            <IconButton onClick={handleProfileClick}>
              <Avatar sx={{ bgcolor: '#866600', color: '#fff' }}>
                {user ? user.username?.[0]?.toUpperCase() || 'U' : 'P'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;