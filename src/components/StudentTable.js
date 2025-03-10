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
  InputAdornment
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

// 요일 버튼 컴포넌트
const WeekdayButton = ({ day, date, selected, onClick, isWeekend }) => {
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
const StudentTable = () => {
  const { 
    students, 
    selectedDate, 
    setSelectedDate, 
    formatDate, 
    loading, 
    error,
    arrivalStatus,
    departureStatus,
    studentLocations,
    useNotion
  } = usePickup();
  
  const theme = useTheme();
  
  // 날짜 변경 핸들러
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  
  // 수업 시간별 학생 그룹화
  const groupStudentsByClass = () => {
    const groups = {};
    
    students.forEach(student => {
      student.classes.forEach(classTime => {
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
  
  // 통계 정보 계산 - 실제 상태 기반으로 계산
  const totalStudents = students.length;
  
  // 등원 완료 학생 수 계산
  const arrivalCount = Object.values(arrivalStatus).filter(status => status).length;
  
  // 하원 완료 학생 수 계산
  const departureCount = Object.values(departureStatus).filter(status => status).length;
  
  // 남은 운행 수 계산 (등하원 모두 필요한 경우 각각 카운트)
  const totalTrips = students.reduce((count, student) => {
    // 등원 위치가 있으면 등원 운행 추가
    if (studentLocations[student.id]?.arrival) count++;
    // 하원 위치가 있으면 하원 운행 추가
    if (studentLocations[student.id]?.departure) count++;
    return count;
  }, 0);
  
  // 남은 운행 = 전체 운행 - 완료된 운행
  const remainingCount = totalTrips - arrivalCount - departureCount;
  
  // 요일 버튼 생성
  const renderDateButtons = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0(일) ~ 6(토)
    const buttons = [];
    
    // 7일의 요일 버튼 생성
    for (let i = 0; i < 7; i++) {
      // 현재 선택된 날짜의 요일과 일치하는지 확인
      const isSelected = i === selectedDate.getDay();
      const isWeekend = i === 0 || i === 6; // 일요일 또는 토요일
      
      // 해당 요일에 해당하는 날짜 계산 (이번 주 기준)
      const dayDiff = i - currentDayOfWeek;
      const date = addDays(today, dayDiff);
      const dateNum = date.getDate();
      
      buttons.push(
        <WeekdayButton
          key={i}
          day={days[i]}
          date={dateNum}
          selected={isSelected}
          isWeekend={isWeekend}
          onClick={() => {
            // 요일 클릭 시 해당 요일의 날짜로 설정
            const newDate = addDays(today, i - currentDayOfWeek);
            handleDateChange(newDate);
          }}
        />
      );
    }
    
    return buttons;
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
        
        {/* 요일 선택 섹션 */}
        <Box sx={{ mb: 2 }}>
          <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f7f7f7', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>요일 선택</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                날짜: {formatDate(selectedDate)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {renderDateButtons()}
            </Box>
          </Paper>
        </Box>
        
        {/* 에러 메시지 표시 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* 통계 정보 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="#1976d2">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>전체 운행</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalStudents}</Typography>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="#388e3c">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>등원 완료</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{arrivalCount}</Typography>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="#1976d2">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>하원 완료</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{departureCount}</Typography>
            </StatCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard bgcolor="#f57c00">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>남은 운행</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{remainingCount}</Typography>
            </StatCard>
          </Grid>
        </Grid>
        
        {/* 차량 섹션 */}
        {classGroups.map(group => (
          <VehicleSection 
            key={group.classTime}
            classTime={group.classTime}
            classStudents={group.students}
          />
        ))}
        
        {classGroups.length === 0 && (
          <Alert severity="info">
            선택한 날짜에 등록된 학생이 없습니다.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default StudentTable; 