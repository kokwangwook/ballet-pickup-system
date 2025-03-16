import React, { useState, useContext, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  AppBar, 
  Toolbar, 
  TextField,
  Button,
  ButtonGroup,
  Alert,
  CircularProgress,
  useTheme,
  Paper,
  Grid,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Card
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VehicleSection from './VehicleSection';
import { usePickup } from '../contexts/PickupContext';
import { addDays, format, parse } from 'date-fns';
import { PickupContext } from '../contexts/PickupContext';
import DateSelector from './DateSelector';
import ClassTimeFilter from './ClassTimeFilter';
import { parseTimeToMinutes, normalizeClassTime, sortStudentsByArrivalTime, groupStudentsByClass } from '../utils/tableUtils';
import { 
  ResponsiveContainer, 
  StatCard, 
  ContentContainer, 
  GridContainer 
} from '../styles/commonStyles';

// 선택 가능한 테이블 행 스타일
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// 학생 테이블 컴포넌트
const StudentTable = ({ onStudentSelect }) => {
  const { 
    students, 
    selectedDate,
    selectedDayOfWeek,
    selectedClassTime,
    handleDateChange,
    handleDayChange,
    handleClassTimeChange,
    formatDate, 
    loading, 
    error,
    arrivalStatus,
    departureStatus,
    studentLocations,
    useNotion,
    getDayName,
    classInfo
  } = usePickup();
  
  const theme = useTheme();
  
  // 오늘 날짜로 빠르게 이동하는 함수
  const goToToday = () => {
    const today = new Date();
    // 주말인 경우 가장 가까운 평일로 이동
    const day = today.getDay();
    let targetDate = today;
    
    if (day === 0) { // 일요일인 경우 다음 월요일로
      targetDate = addDays(today, 1);
    } else if (day === 6) { // 토요일인 경우 다음 월요일로
      targetDate = addDays(today, 2);
    }
    
    handleDateChange(targetDate);
    handleDayChange(targetDate.getDay());
  };
  
  // 어제 날짜로 빠르게 이동하는 함수
  const goToYesterday = () => {
    let yesterday = addDays(selectedDate, -1);
    // 주말인 경우 이전 금요일로 이동
    const day = yesterday.getDay();
    if (day === 0) { // 일요일인 경우 금요일로 (2일 전)
      yesterday = addDays(yesterday, -2);
    } else if (day === 6) { // 토요일인 경우 금요일로 (1일 전)
      yesterday = addDays(yesterday, -1);
    }
    handleDateChange(yesterday);
    handleDayChange(yesterday.getDay());
  };
  
  // 내일 날짜로 빠르게 이동하는 함수
  const goToTomorrow = () => {
    let tomorrow = addDays(selectedDate, 1);
    // 주말인 경우 다음 월요일로 이동
    const day = tomorrow.getDay();
    if (day === 0) { // 일요일인 경우 월요일로 (1일 후)
      tomorrow = addDays(tomorrow, 1);
    } else if (day === 6) { // 토요일인 경우 월요일로 (2일 후)
      tomorrow = addDays(tomorrow, 2);
    }
    handleDateChange(tomorrow);
    handleDayChange(tomorrow.getDay());
  };
  
  // 수업 시간별 학생 그룹화
  const classGroups = groupStudentsByClass(students, selectedDayOfWeek, getDayName);
  
  // 학생 정보 표시 함수
  const renderStudentInfo = (student) => {
    // 시간 형식 표준화
    const displayClassTime = normalizeClassTime(student.classTime);
    const displayClassTimes = student.classTimes ? { ...student.classTimes } : {};
    
    if (displayClassTimes) {
      Object.keys(displayClassTimes).forEach(day => {
        displayClassTimes[day] = normalizeClassTime(displayClassTimes[day]);
      });
    }
    
    return (
      <div className="student-info">
        <div className="student-name">{student.name}</div>
        <div className="student-details">
          {/* 표준화된 시간 표시 */}
          <div>수업 시간: {displayClassTime || (displayClassTimes && displayClassTimes[selectedDayOfWeek]) || '정보 없음'}</div>
          {/* ... existing code ... */}
        </div>
      </div>
    );
  };
  
  // 학생 목록 필터링 및 정렬
  const filteredStudents = useMemo(() => {
    // 학생 목록을 그대로 사용
    const sortedStudents = [...students];
    
    // 필터링된 학생 목록에 시간 형식 표준화 적용
    return sortedStudents.map(student => {
      // 학생 객체 복사
      const normalizedStudent = { ...student };
      
      // classTime 필드 표준화
      if (normalizedStudent.classTime) {
        normalizedStudent.classTime = normalizeClassTime(normalizedStudent.classTime);
      }
      
      // classTimes 객체 표준화
      if (normalizedStudent.classTimes && typeof normalizedStudent.classTimes === 'object') {
        const normalizedClassTimes = { ...normalizedStudent.classTimes };
        Object.keys(normalizedClassTimes).forEach(day => {
          normalizedClassTimes[day] = normalizeClassTime(normalizedClassTimes[day]);
        });
        normalizedStudent.classTimes = normalizedClassTimes;
      }
      
      return normalizedStudent;
    });
  }, [students, selectedDayOfWeek]);
  
  // 로딩 중 표시
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>데이터를 불러오는 중입니다...</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          노션 API에서 데이터를 가져오고 있습니다. 잠시만 기다려주세요.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <ResponsiveContainer maxWidth="lg" sx={{ mt: 2 }}>
        {/* 노션 연동 상태 표시 */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography variant="body2" color={useNotion ? 'success.main' : 'error.main'} sx={{ display: 'flex', alignItems: 'center' }}>
            {useNotion ? (
              <>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4caf50', marginRight: 4 }} />
                노션 연동됨
              </>
            ) : (
              <>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f44336', marginRight: 4 }} />
                모의 데이터 사용 중
              </>
            )}
          </Typography>
        </Box>
        
        {/* 날짜 선택 */}
        <DateSelector 
          selectedDate={selectedDate}
          setSelectedDate={handleDateChange}
          selectedDayOfWeek={selectedDayOfWeek}
          setSelectedDayOfWeek={handleDayChange}
        />
        
        {/* 통계 정보 */}
        <ContentContainer>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
            통계 정보 {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? '(오늘)' : `(${getDayName(selectedDayOfWeek)}요일)`}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <StatCard bgcolor="#e3f2fd">
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {students.filter(student => student.arrivalLocation || arrivalStatus[student.id]).length + 
                   students.filter(student => student.departureLocation || departureStatus[student.id]).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  전체 운행
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard bgcolor="#e8f5e9">
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {students.filter(student => arrivalStatus[student.id]).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  등원 완료
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard bgcolor="#fff8e1">
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {students.filter(student => departureStatus[student.id]).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  하원 완료
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard bgcolor="#ffebee">
                <Typography variant="h5" color="error.main" fontWeight="bold">
                  {Math.max(0, (students.filter(student => student.arrivalLocation || arrivalStatus[student.id]).length + 
                   students.filter(student => student.departureLocation || departureStatus[student.id]).length) - 
                    (students.filter(student => arrivalStatus[student.id]).length + 
                     students.filter(student => departureStatus[student.id]).length))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  남은 운행
                </Typography>
              </StatCard>
            </Grid>
          </Grid>
        </ContentContainer>
        
        {/* 수업 시간 필터 */}
        <ClassTimeFilter 
          selectedClassTime={selectedClassTime}
          handleClassTimeChange={handleClassTimeChange}
          classInfo={classInfo}
        />
        
        {/* 에러 메시지 표시 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* 차량 섹션 */}
        {classGroups.map(group => (
          <VehicleSection
            key={group.classTime}
            classTime={group.classTime}
            classStudents={group.students}
            onStudentSelect={onStudentSelect}
          />
        ))}
        
        {classGroups.length === 0 && (
          <Alert severity="info">
            등록된 학생이 없습니다.
          </Alert>
        )}
      </ResponsiveContainer>
    </Box>
  );
};

export default StudentTable; 