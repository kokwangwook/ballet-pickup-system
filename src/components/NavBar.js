import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link, useNavigate } from 'react-router-dom';
import SettingsDialog from './SettingsDialog';

const NavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // 메뉴 상태 관리
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // 설정 다이얼로그 상태
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 메뉴 열기 핸들러
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // 메뉴 닫기 핸들러
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // 설정 다이얼로그 열기 핸들러
  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };
  
  // 설정 다이얼로그 닫기 핸들러
  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };
  
  // 메뉴 항목 클릭 핸들러
  const handleMenuItemClick = (path) => {
    navigate(path);
    handleClose();
  };
  
  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            발레학원픽업시스템
          </Typography>
          
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={() => handleMenuItemClick('/')}>홈</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/students')}>학생관리</MenuItem>
                <MenuItem onClick={handleSettingsOpen}>환경설정</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button color="inherit" component={Link} to="/">
                홈
              </Button>
              <Button color="inherit" component={Link} to="/students">
                학생관리
              </Button>
              <Tooltip title="환경설정">
                <IconButton 
                  color="inherit" 
                  onClick={handleSettingsOpen}
                  sx={{ ml: 1 }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* 설정 다이얼로그 */}
      <SettingsDialog 
        open={settingsOpen} 
        onClose={handleSettingsClose} 
      />
    </>
  );
};

export default NavBar; 