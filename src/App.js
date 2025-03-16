import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  DialogActions
} from '@mui/material';
import { PickupProvider } from './contexts/PickupContext';
import StudentTable from './components/StudentTable';
import StudentForm from './components/StudentForm';
import StudentSearch from './components/StudentSearch';
import StudentDetail from './components/StudentDetail';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ParentDashboard from './components/ParentDashboard';
import MessageTemplateManager from './components/MessageTemplateManager';
import NotificationHistory from './components/NotificationHistory';
import NotificationSettings from './components/NotificationSettings';
import DriverApp from './components/DriverApp';
import VehicleTracker from './components/VehicleTracker';
import ButtonExample from './components/ButtonExample';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import ParentPage from './components/ParentPage';
import TestVehicleLayout from './components/TestVehicleLayout';
import MainPage from './components/MainPage';

// 테마 설정
let theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans KR',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#c51162',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          overflow: 'hidden',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

// 반응형 폰트 크기 적용
theme = responsiveFontSizes(theme);

// 메인 앱 컴포넌트
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PickupProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/students" element={<StudentTable />} />
            <Route path="/add-student" element={<StudentForm />} />
            <Route path="/edit-student/:id" element={<StudentForm />} />
            <Route path="/search" element={<StudentSearch />} />
            <Route path="/test-vehicle" element={<TestVehicleLayout />} />
            <Route path="/templates" element={<Layout><MessageTemplateManager /></Layout>} />
            <Route path="/notifications" element={<Layout><NotificationHistory /></Layout>} />
            <Route path="/settings" element={<Layout><NotificationSettings /></Layout>} />
            <Route path="/vehicle-tracker" element={<Layout><VehicleTracker /></Layout>} />
            <Route path="/buttons" element={<Layout><ButtonExample /></Layout>} />
            <Route path="/parent" element={<Layout><ParentPage /></Layout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/driver" element={<Layout><DriverApp /></Layout>} />
            {/* 존재하지 않는 경로는 홈으로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </PickupProvider>
    </ThemeProvider>
  );
};

// 메인 앱 내부 컴포넌트
const MainApp = () => {
  const [openForm, setOpenForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const { students, addStudent, updateStudent, deleteStudent } = usePickup();
  
  const handleOpenForm = () => {
    setSelectedStudent(null);
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
  };
  
  const handleOpenDetail = (student) => {
    setSelectedStudent(student);
    setOpenDetail(true);
  };
  
  const handleCloseDetail = () => {
    setOpenDetail(false);
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEditStudent = () => {
    if (selectedStudent) {
      setOpenForm(true);
      setOpenDetail(false);
    }
    handleMenuClose();
  };
  
  const handleDeleteStudent = () => {
    if (selectedStudent) {
      deleteStudent(selectedStudent.id);
      setOpenDetail(false);
      showSnackbar('학생 정보가 삭제되었습니다.', 'success');
    }
    handleMenuClose();
  };
  
  const handleStudentSubmit = (studentData, isEdit) => {
    if (isEdit) {
      updateStudent(studentData);
      showSnackbar('학생 정보가 수정되었습니다.', 'success');
    } else {
      addStudent(studentData);
      showSnackbar('학생이 추가되었습니다.', 'success');
    }
    setOpenForm(false);
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            발레 픽업 시스템
          </Typography>
          <Button 
            component={Link} 
            to="/test-vehicle" 
            color="inherit" 
            sx={{ mr: 2 }}
          >
            새 레이아웃 테스트
          </Button>
          <Button 
            color="inherit" 
            startIcon={<PersonAddIcon />} 
            onClick={handleOpenForm}
          >
            학생 추가
          </Button>
          <Button
            variant="contained"
            color="primary"
            component="a"
            href="/driver"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mr: 2 }}
          >
            운전자 앱
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <StudentTable onStudentSelect={handleOpenDetail} />
      </Box>
      
      {/* 학생 추가/수정 폼 다이얼로그 */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStudent ? '학생 정보 수정' : '학생 추가'}
        </DialogTitle>
        <DialogContent>
          <StudentForm 
            student={selectedStudent} 
            onSubmit={handleStudentSubmit} 
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
      
      {/* 학생 상세 정보 다이얼로그 */}
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          학생 상세 정보
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && <StudentDetail student={selectedStudent} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>닫기</Button>
          <Button 
            color="primary" 
            startIcon={<EditIcon />} 
            onClick={handleEditStudent}
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditStudent}>수정</MenuItem>
        <MenuItem onClick={handleDeleteStudent}>삭제</MenuItem>
      </Menu>
      
      {/* 스낵바 알림 */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App; 