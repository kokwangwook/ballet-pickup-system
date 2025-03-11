import React, { useState } from 'react';
import { 
  Box, 
  Container, 
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

// 스타일이 적용된 날짜 버튼 컴포넌트
const DateButton = styled(Button)(({ theme, selected, isWeekend }) => ({
  width: '40px',
  height: '38px',
  borderRadius: '4px',
  padding: 0,
  minWidth: 'unset',
  margin: '0 2px',
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: isWeekend 
    ? (selected ? 'white' : '#f44336') 
    : (selected ? 'white' : theme.palette.text.primary),
  '&:hover': {
    backgroundColor: selected 
      ? theme.palette.primary.main 
      : theme.palette.action.hover,
  },
}));

// 스타일이 적용된 요일 버튼 컴포넌트
const WeekdayStyledButton = styled(Button)(({ theme, selected, isWeekend }) => ({
  width: '40px',
  height: '38px',
  borderRadius: '4px',
  padding: 0,
  minWidth: 'unset',
  margin: '0 2px',
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: isWeekend 
    ? (selected ? 'white' : '#f44336') 
    : (selected ? 'white' : theme.palette.text.primary),
  border: `1px solid ${selected ? theme.palette.primary.main : '#e0e0e0'}`,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
  },
}));

// 통계 카드 컴포넌트
const StatCard = styled(Paper)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor,
  color: 'white',
  padding: theme.spacing(2, 1.5),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  boxShadow: 'none'
}));

// 선택 가능한 테이블 행 스타일
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// 요일 버튼 컴포넌트
const WeekdayButtonContent = ({ day, date, selected, onClick, isWeekend }) => {
  const buttonColor = isWeekend 
    ? (selected ? 'white' : '#f44336') 
    : (selected ? 'white' : 'inherit');
    
  return (
    <DateButton
      variant="outlined"
      selected={selected}
      onClick={onClick}
      sx={{
        color: buttonColor
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="caption" fontSize={11} lineHeight={1.1} fontWeight="regular">
          {day}
        </Typography>
        <Typography variant="body2" fontSize={14} fontWeight={selected ? 'bold' : 'medium'}>
          {date}
        </Typography>
      </Box>
    </DateButton>
  );
};

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
    getDayName
  } = usePickup();
  
  const theme = useTheme();
  
  // 오늘 날짜로 빠르게 이동하는 함수
  const goToToday = () => {
    const today = new Date();
    handleDateChange(today);
    handleDayChange(today.getDay());
  };
  
  // 어제 날짜로 빠르게 이동하는 함수
  const goToYesterday = () => {
    const yesterday = addDays(selectedDate, -1);
    handleDateChange(yesterday);
    handleDayChange(yesterday.getDay());
  };
  
  // 내일 날짜로 빠르게 이동하는 함수
  const goToTomorrow = () => {
    const tomorrow = addDays(selectedDate, 1);
    handleDateChange(tomorrow);
    handleDayChange(tomorrow.getDay());
  };
  
  // 수업 시간별 학생 그룹화
  const groupStudentsByClass = () => {
    const groups = {};
    
    students.forEach(student => {
      // classes 배열이 없는 경우를 처리
      const classes = student.classes || [];
      
      // 클래스가 없는 경우 classTime을 기본값으로 사용
      if (classes.length === 0 && student.classTime) {
        classes.push(student.classTime);
      }
      
      // 여전히 클래스가 없으면 건너뛰기
      if (classes.length === 0) {
        console.warn(`학생 ${student.name}(ID: ${student.id})에 수업 시간 정보가 없습니다.`);
        return;
      }
      
      classes.forEach(classTime => {
        if (!groups[classTime]) {
          groups[classTime] = [];
        }
        groups[classTime].push(student);
      });
    });
    
    // 시간 순서대로 정렬
    return Object.keys(groups)
      .sort()
      .map(classTime => ({
        classTime,
        students: groups[classTime]
      }));
  };
  
  // 수업 시간별 학생 그룹
  const classGroups = groupStudentsByClass();
  
  // 날짜 선택 컴포넌트 렌더링
  const renderDateSelector = () => {
    // 이전 7일 및 다음 7일 계산
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const date = addDays(selectedDate, i);
      dates.push(date);
    }
    
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.5, 
          mb: 2, 
          borderRadius: 2,
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0' 
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
              날짜 선택
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ButtonGroup size="small" variant="outlined" sx={{ mr: 1 }}>
                <Button 
                  onClick={goToYesterday}
                  sx={{ fontSize: '0.75rem' }}
                >
                  어제
                </Button>
                <Button 
                  onClick={goToToday}
                  variant="contained"
                  color="primary"
                  sx={{ fontSize: '0.75rem' }}
                >
                  오늘
                </Button>
                <Button 
                  onClick={goToTomorrow}
                  sx={{ fontSize: '0.75rem' }}
                >
                  내일
                </Button>
              </ButtonGroup>
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                {format(selectedDate, 'yyyy년 MM월 dd일')} ({getDayName(selectedDayOfWeek)})
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              {dates.map((date, index) => {
                const day = date.getDay();
                const isWeekend = day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                
                return (
                  <WeekdayButtonContent
                    key={index}
                    day={getDayName(day)}
                    date={format(date, 'd')}
                    selected={isSelected}
                    isWeekend={isWeekend}
                    onClick={() => {
                      handleDateChange(date);
                      handleDayChange(day);
                    }}
                  />
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  const renderClassTimeFilter = () => {
    const classTimes = Array.from(new Set(students.flatMap(student => 
      student.classes && student.classes.length > 0 ? student.classes : [student.classTime]
    ))).filter(Boolean).sort();
    
    const uniqueClassTimes = ['all', ...classTimes];
    
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.5, 
          mb: 2, 
          borderRadius: 2,
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0' 
        }}
      >
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
              수업 시간 필터
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedClassTime === 'all' ? '모든 수업 시간' : `${selectedClassTime} 수업`}을 보고 있습니다.
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {uniqueClassTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedClassTime === time ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  onClick={() => handleClassTimeChange(time)}
                  sx={{ 
                    m: 0.5, 
                    px: 1.5,
                    fontSize: '0.8rem',
                    backgroundColor: selectedClassTime === time ? theme.palette.primary.main : 'transparent',
                    '&:hover': {
                      backgroundColor: selectedClassTime === time ? theme.palette.primary.dark : theme.palette.action.hover,
                    }
                  }}
                >
                  {time === 'all' ? '모든 시간' : `${time}`}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  // TableRow 클릭 이벤트 핸들러 추가
  const handleRowClick = (student) => {
    if (onStudentSelect) {
      onStudentSelect(student);
    }
  };
  
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
  
  // 통계 렌더링
  const renderStats = () => {
    // 통계 계산
    const totalStudents = students.length;
    const totalPossibleTrips = totalStudents * 2; // 등원 + 하원 (모든 학생)
    const presentStudents = students.filter(student => student.isActive).length;
    const totalTrips = presentStudents * 2; // 등원 + 하원 (활성 학생만)
    
    const arrivalCount = Object.values(arrivalStatus).filter(Boolean).length;
    const departureCount = Object.values(departureStatus).filter(Boolean).length;
    const completedTrips = arrivalCount + departureCount;
    const remainingCount = totalTrips - completedTrips;
    
    const arrivalPercentage = totalTrips > 0 ? Math.round((arrivalCount / presentStudents) * 100) : 0;
    const departurePercentage = totalTrips > 0 ? Math.round((departureCount / presentStudents) * 100) : 0;
    const completedPercentage = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;
    
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.5, 
          mb: 2, 
          borderRadius: 2,
          backgroundColor: '#f8f8f8',
          border: '1px solid #e0e0e0' 
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
          오늘의 차량 운행 현황
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatCard bgcolor="#4caf50">
              <Typography variant="h5" fontWeight="bold">
                {completedPercentage}%
              </Typography>
              <Typography variant="body2">
                완료율
              </Typography>
              <Typography variant="caption">
                {completedTrips}/{totalTrips} 완료
              </Typography>
            </StatCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard bgcolor="#2196f3">
              <Typography variant="h5" fontWeight="bold">
                {arrivalPercentage}%
              </Typography>
              <Typography variant="body2">
                등원 완료
              </Typography>
              <Typography variant="caption">
                {arrivalCount}/{presentStudents} 학생
              </Typography>
            </StatCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard bgcolor="#ff9800">
              <Typography variant="h5" fontWeight="bold">
                {departurePercentage}%
              </Typography>
              <Typography variant="body2">
                하원 완료
              </Typography>
              <Typography variant="caption">
                {departureCount}/{presentStudents} 학생
              </Typography>
            </StatCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard bgcolor={remainingCount > 0 ? "#f44336" : "#9e9e9e"}>
              <Typography variant="h5" fontWeight="bold">
                {remainingCount}
              </Typography>
              <Typography variant="body2">
                남은 운행
              </Typography>
              <Typography variant="caption">
                {completedTrips}/{totalTrips} 완료
              </Typography>
            </StatCard>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 앱바 */}
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1.1rem' }}>
            발레 픽업 시스템
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 2 }}>
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
        {renderDateSelector()}
        
        {/* 수업 시간 필터 */}
        {renderClassTimeFilter()}
        
        {/* 통계 카드 */}
        {renderStats()}
        
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
      </Container>
    </Box>
  );
};

export default StudentTable; 