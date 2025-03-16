import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { usePickup } from '../contexts/PickupContext';
import StudentForm from './StudentForm';
import StudentSearch from './StudentSearch';

const Layout = ({ children }) => {
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [withdrawnStudentsDialogOpen, setWithdrawnStudentsDialogOpen] = useState(false);

  // PickupContext에서 필요한 데이터 가져오기
  const { allStudents } = usePickup();

  // 퇴원한 학생 목록 가져오기
  const withdrawnStudents = allStudents ? allStudents.filter(student => student.isActive === false) : [];

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

  // 학생 수정 다이얼로그 닫기
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedStudent(null);
  };

  // 퇴원 학생 목록 다이얼로그 열기
  const handleOpenWithdrawnStudentsDialog = () => {
    setWithdrawnStudentsDialogOpen(true);
    handleMenuClose();
  };

  // 네비게이션 항목 정의
  const navItems = [
    { path: '/', label: '학생관리' },
    { path: '/parent', label: '학부모페이지' },
    { path: '/templates', label: '메시지템플릿' },
    { path: '/notifications', label: '알림이력' },
    { path: '/settings', label: '알림설정' },
    { path: '/driver', label: '운전자앱' },
    { path: '/vehicle-tracker', label: '차량위치' },
    { path: '/test-layout', label: '새 레이아웃 테스트' },
    { path: '/buttons', label: '버튼예제' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            발레학원픽업시스템
          </Typography>
          
          {/* 네비게이션 항목 렌더링 */}
          {navItems.map((item) => (
            <Button 
              key={item.path}
              color="inherit" 
              component={Link}
              to={item.path}
              sx={{ 
                mr: 1,
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                borderBottom: location.pathname === item.path ? '2px solid white' : 'none'
              }}
            >
              {item.label}
            </Button>
          ))}
          
          <Button 
            color="inherit" 
            startIcon={<PersonAddIcon />}
            onClick={handleOpenDialog}
            sx={{ mr: 1 }}
          >
            학생등록
          </Button>
          <Button 
            color="inherit" 
            onClick={handleOpenSearchDialog}
            sx={{ mr: 1 }}
          >
            학생검색
          </Button>
          <IconButton 
            color="inherit" 
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleOpenSearchDialog}>
              학생 검색
            </MenuItem>
            <MenuItem onClick={handleOpenWithdrawnStudentsDialog}>
              퇴원 학생 목록
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
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
      <Dialog
        open={searchDialogOpen}
        onClose={handleCloseSearchDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: 0 }}>
          <StudentSearch 
            onStudentSelect={(student) => {
              setSelectedStudent(student);
              setEditDialogOpen(true);
            }}
            onClose={handleCloseSearchDialog}
            onAddStudent={handleOpenDialog}
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
            onClose={() => {
              handleCloseEditDialog();
            }} 
            isEdit={true} 
          />
        </DialogContent>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 퇴원 학생 목록 다이얼로그 */}
      <Dialog
        open={withdrawnStudentsDialogOpen}
        onClose={() => setWithdrawnStudentsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          퇴원 학생 목록
        </DialogTitle>
        <DialogContent>
          {withdrawnStudents && withdrawnStudents.length > 0 ? (
            <Box>
              {/* 퇴원 학생 목록 내용 */}
              {withdrawnStudents.map(student => (
                <Box key={student.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography variant="subtitle1">{student.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {student.id}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ p: 2 }}>
              퇴원한 학생이 없습니다.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Layout; 