import React, { useState, useEffect } from 'react';
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
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  DialogActions
} from '@mui/material';
import { PickupProvider, usePickup } from './contexts/PickupContext';
import StudentTable from './components/StudentTable';
import StudentForm from './components/StudentForm';
import StudentSearch from './components/StudentSearch';
import StudentDetail from './components/StudentDetail';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ParentDashboard from './components/ParentDashboard';
import MessageTemplateManager from './components/MessageTemplateManager';
import NotificationHistory from './components/NotificationHistory';
import NotificationSettings from './components/NotificationSettings';
import DriverApp from './components/DriverApp';
import VehicleTracker from './components/VehicleTracker';
import ButtonExample from './components/ButtonExample';
import Layout from './components/Layout';

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

// AppContent 컴포넌트 - PickupProvider 내부에서 usePickup 사용
function AppContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [withdrawnStudentsDialogOpen, setWithdrawnStudentsDialogOpen] = useState(false);
  
  // PickupContext에서 필요한 데이터 가져오기
  const { studentLocations, classInfo, allStudents, updateStudent } = usePickup();

  // 퇴원한 학생 목록 가져오기
  const withdrawnStudents = allStudents.filter(student => student.isActive === false);

  // 전역 함수로 학생 검색 다이얼로그 열기 함수 등록
  useEffect(() => {
    window.openStudentSearch = handleOpenSearchDialog;
    
    return () => {
      window.openStudentSearch = undefined;
    };
  }, []);

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
  const handleDetailStudent = (student) => {
    console.log("선택된 학생 전체 데이터:", student);
    
    // student.id가 없는 경우 처리
    if (!student || !student.id) {
      console.error("학생 정보가 없거나 ID가 없습니다.");
      setSelectedStudent(student);
      setDetailDialogOpen(true);
      return;
    }
    
    // 학생 위치 정보 추가
    const studentLocation = studentLocations[student.id];
    console.log("학생 위치 정보 원본:", studentLocation);
    
    const { arrival: arrivalLocation, departure: departureLocation } = studentLocation || { arrival: null, departure: null };
    
    // 학생 수업 시간 정보 확인
    console.log("학생 수업 속성:", student.classes);
    // 학생의 classes에 classTime이 없을 경우 classTime 속성 사용
    let classTime = null;
    if (student.classes && student.classes.length > 0) {
      classTime = student.classes[0];
    } else if (student.classTime) {
      classTime = student.classTime;
    }
    
    console.log("사용할 수업 시간:", classTime);
    console.log("전체 수업 정보:", classInfo);
    
    const classData = classTime ? classInfo[classTime] || { locations: {} } : { locations: {} };
    
    console.log("학생:", student.name);
    console.log("학생 ID:", student.id);
    console.log("학생 수업시간:", classTime);
    console.log("위치 정보:", { arrivalLocation, departureLocation });
    console.log("수업 데이터:", classData);
    
    // 위치 정보 텍스트 생성
    let arrivalLocationText = '차량탑승 안함';
    let departureLocationText = '차량탑승 안함';
    
    if (arrivalLocation !== null && arrivalLocation !== undefined) {
      console.log(`등원 위치 ID(${arrivalLocation})에 대한 위치 이름 찾기 시도`);
      if (classData.locations && classData.locations[arrivalLocation]) {
        arrivalLocationText = classData.locations[arrivalLocation];
        console.log(`등원 위치 찾음: ${arrivalLocationText}`);
      } else {
        // 모든 수업 시간에서 위치 찾기 시도
        let foundLocation = false;
        Object.keys(classInfo).forEach(time => {
          if (!foundLocation && classInfo[time].locations && classInfo[time].locations[arrivalLocation]) {
            arrivalLocationText = classInfo[time].locations[arrivalLocation];
            console.log(`다른 수업 시간(${time})에서 등원 위치 찾음: ${arrivalLocationText}`);
            foundLocation = true;
          }
        });
        
        if (!foundLocation) {
          arrivalLocationText = `위치 ${arrivalLocation}`;
          console.log(`등원 위치를 찾을 수 없음. 기본값 사용: ${arrivalLocationText}`);
        }
      }
    } else {
      console.log("등원 위치 정보 없음");
    }
    
    if (departureLocation !== null && departureLocation !== undefined) {
      console.log(`하원 위치 ID(${departureLocation})에 대한 위치 이름 찾기 시도`);
      if (classData.locations && classData.locations[departureLocation]) {
        departureLocationText = classData.locations[departureLocation];
        console.log(`하원 위치 찾음: ${departureLocationText}`);
      } else {
        // 모든 수업 시간에서 위치 찾기 시도
        let foundLocation = false;
        Object.keys(classInfo).forEach(time => {
          if (!foundLocation && classInfo[time].locations && classInfo[time].locations[departureLocation]) {
            departureLocationText = classInfo[time].locations[departureLocation];
            console.log(`다른 수업 시간(${time})에서 하원 위치 찾음: ${departureLocationText}`);
            foundLocation = true;
          }
        });
        
        if (!foundLocation) {
          departureLocationText = `위치 ${departureLocation}`;
          console.log(`하원 위치를 찾을 수 없음. 기본값 사용: ${departureLocationText}`);
        }
      }
    } else {
      console.log("하원 위치 정보 없음");
    }
    
    console.log("등원 위치 텍스트:", arrivalLocationText);
    console.log("하원 위치 텍스트:", departureLocationText);
    
    // 위치 정보가 포함된 학생 데이터 설정
    const updatedStudent = {
      ...student,
      arrivalLocationText,
      departureLocationText
    };
    
    console.log("업데이트된 학생 정보:", updatedStudent);
    
    setSelectedStudent(updatedStudent);
    setDetailDialogOpen(true);
  };

  // 학생 정보 상세 다이얼로그 닫기
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    
    // 학생 데이터 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // 학생 정보 수정 다이얼로그 열기
  const handleOpenEditDialog = (student) => {
    if (student) {
      setSelectedStudent(student);
      setEditDialogOpen(true);
      setDetailDialogOpen(false);
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
    handleDetailStudent(student);
  };

  // 퇴원 학생 목록 다이얼로그 열기
  const handleOpenWithdrawnStudentsDialog = () => {
    setWithdrawnStudentsDialogOpen(true);
    handleMenuClose();
  };

  // 퇴원 학생 목록 다이얼로그 닫기
  const handleCloseWithdrawnStudentsDialog = () => {
    setWithdrawnStudentsDialogOpen(false);
  };

  // 학생 재등록 처리
  const handleReactivateStudent = async (studentId) => {
    try {
      await updateStudent(studentId, { isActive: true });
      setSnackbarMessage('학생이 성공적으로 재등록되었습니다.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('학생 재등록 처리 중 오류 발생:', error);
      setSnackbarMessage('학생 재등록 처리 중 오류가 발생했습니다.');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <StudentTable onStudentSelect={handleStudentSelect} />
      
      {/* 학생 정보 상세 다이얼로그 */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          학생 정보
        </DialogTitle>
        <DialogContent>
          <StudentDetail 
            student={selectedStudent} 
            onEdit={handleOpenEditDialog} 
            onClose={handleCloseDetailDialog}
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

      {/* 퇴원 학생 목록 다이얼로그 */}
      <Dialog
        open={withdrawnStudentsDialogOpen}
        onClose={handleCloseWithdrawnStudentsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          퇴원 학생 목록
          <Typography variant="subtitle2" color="text.secondary">
            총 {withdrawnStudents.length}명의 퇴원 학생이 있습니다.
          </Typography>
        </DialogTitle>
        <DialogContent>
          {withdrawnStudents.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>번호</TableCell>
                    <TableCell>이름</TableCell>
                    <TableCell>단축번호</TableCell>
                    <TableCell>수업시간</TableCell>
                    <TableCell>연락처</TableCell>
                    <TableCell>학교</TableCell>
                    <TableCell>액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawnStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.shortId || '-'}</TableCell>
                      <TableCell>{student.classTime || '-'}</TableCell>
                      <TableCell>{student.motherPhone || student.fatherPhone || student.studentPhone || '-'}</TableCell>
                      <TableCell>{student.school || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleReactivateStudent(student.id)}
                        >
                          재등록
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <DialogContentText sx={{ textAlign: 'center', py: 4 }}>
              퇴원한 학생이 없습니다.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWithdrawnStudentsDialog}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

// 메인 App 컴포넌트
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PickupProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout><AppContent /></Layout>} />
            <Route path="/parent" element={<Layout><ParentDashboard /></Layout>} />
            <Route path="/templates" element={<Layout><MessageTemplateManager /></Layout>} />
            <Route path="/notifications" element={<Layout><NotificationHistory /></Layout>} />
            <Route path="/settings" element={<Layout><NotificationSettings /></Layout>} />
            <Route path="/driver" element={<Layout><DriverApp /></Layout>} />
            <Route path="/vehicle-tracker" element={<Layout><VehicleTracker /></Layout>} />
            <Route path="/buttons" element={<Layout><ButtonExample /></Layout>} />
          </Routes>
        </Router>
      </PickupProvider>
    </ThemeProvider>
  );
}

export default App; 