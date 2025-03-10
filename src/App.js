import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
  Alert
} from '@mui/material';
import { PickupProvider } from './contexts/PickupContext';
import StudentTable from './components/StudentTable';
import StudentForm from './components/StudentForm';
import StudentSearch from './components/StudentSearch';
import StudentDetail from './components/StudentDetail';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans KR',
      'sans-serif',
    ].join(','),
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500, 
    },
    body2: {
      fontSize: '0.8rem',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
  },
});

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // 메뉴 열기
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // 메뉴 닫기
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // 학생 등록 다이얼로그 열기
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // 학생 등록 다이얼로그 닫기
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // 학생 검색 다이얼로그 열기
  const handleOpenSearchDialog = () => {
    setSearchDialogOpen(true);
  };

  // 학생 검색 다이얼로그 닫기
  const handleCloseSearchDialog = () => {
    setSearchDialogOpen(false);
  };

  // 학생 정보 상세 다이얼로그 열기
  const handleOpenDetailDialog = (student) => {
    if (student) {
      setSelectedStudent(student);
      setDetailDialogOpen(true);
      handleCloseSearchDialog();
    } else {
      setSnackbarMessage('학생 정보를 볼 학생을 먼저 선택해주세요.');
      setSnackbarOpen(true);
    }
  };

  // 학생 정보 상세 다이얼로그 닫기
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };

  // 학생 정보 수정 다이얼로그 열기
  const handleOpenEditDialog = (student) => {
    if (student) {
      setSelectedStudent(student);
      setEditDialogOpen(true);
      handleCloseDetailDialog();
    } else {
      setSnackbarMessage('수정할 학생을 먼저 선택해주세요.');
      setSnackbarOpen(true);
    }
  };

  // 학생 정보 수정 다이얼로그 닫기
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedStudent(null);
  };

  // 학생 선택 이벤트 처리
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    handleOpenDetailDialog(student);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PickupProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                발레 학원 픽업 시스템
              </Typography>
              <Button 
                color="inherit" 
                startIcon={<PersonAddIcon />}
                onClick={handleOpenDialog}
                sx={{ mr: 1 }}
              >
                학생 등록
              </Button>
              <Button 
                color="inherit" 
                startIcon={<EditIcon />}
                onClick={handleOpenSearchDialog}
                sx={{ mr: 1 }}
              >
                등록정보수정
              </Button>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                size="large"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                {/* 메뉴 항목들이 필요하면 이곳에 추가 */}
              </Menu>
            </Toolbar>
          </AppBar>

          <Box component="main" sx={{ flexGrow: 1 }}>
            <StudentTable onStudentSelect={handleStudentSelect} />
          </Box>

          {/* 학생 등록 다이얼로그 */}
          <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              새 학생 등록
            </DialogTitle>
            <DialogContent>
              <StudentForm onClose={handleCloseDialog} />
            </DialogContent>
          </Dialog>

          {/* 학생 검색 다이얼로그 */}
          <Dialog open={searchDialogOpen} onClose={handleCloseSearchDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              학생 검색
            </DialogTitle>
            <DialogContent>
              <StudentSearch 
                onStudentSelect={handleStudentSelect} 
                onClose={handleCloseSearchDialog} 
              />
            </DialogContent>
          </Dialog>

          {/* 학생 정보 상세 다이얼로그 */}
          <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              학생 정보
            </DialogTitle>
            <DialogContent>
              <StudentDetail 
                student={selectedStudent} 
                onEdit={handleOpenEditDialog} 
              />
            </DialogContent>
          </Dialog>

          {/* 학생 정보 수정 다이얼로그 */}
          <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              학생 정보 수정
            </DialogTitle>
            <DialogContent>
              <StudentForm 
                student={selectedStudent} 
                onClose={handleCloseEditDialog} 
                isEdit={true} 
              />
            </DialogContent>
          </Dialog>

          {/* 알림 스낵바 */}
          <Snackbar 
            open={snackbarOpen} 
            autoHideDuration={3000} 
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setSnackbarOpen(false)} 
              severity="info" 
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </PickupProvider>
    </ThemeProvider>
  );
}

export default App; 