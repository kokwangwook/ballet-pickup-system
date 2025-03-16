import React, { useState, useContext, useMemo } from 'react';
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
import { PickupContext } from '../contexts/PickupContext';

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
const WeekdayStyledButton = styled(Button)(({ theme, selected, isWeekend, dayName }) => {
  // 요일별 색상 설정
  const getDayColor = (day) => {
    switch(day) {
      case '월': return theme.palette.secondary.main;
      case '화': return theme.palette.success.main;
      case '수': return theme.palette.info.main;
      case '목': return theme.palette.warning.main;
      case '금': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };
  
  // 요일별 hover 색상 설정
  const getDayHoverColor = (day) => {
    switch(day) {
      case '월': return theme.palette.secondary.dark;
      case '화': return theme.palette.success.dark;
      case '수': return theme.palette.info.dark;
      case '목': return theme.palette.warning.dark;
      case '금': return theme.palette.error.dark;
      default: return theme.palette.primary.dark;
    }
  };
  
  const dayColor = getDayColor(dayName);
  const dayHoverColor = getDayHoverColor(dayName);
  
  return {
    width: '40px',
    height: '38px',
    borderRadius: '4px',
    padding: 0,
    minWidth: 'unset',
    margin: '0 2px',
    backgroundColor: selected ? dayColor : 'transparent',
    color: isWeekend 
      ? (selected ? 'white' : '#f44336') 
      : (selected ? 'white' : theme.palette.text.primary),
    border: `1px solid ${selected ? dayColor : '#e0e0e0'}`,
    '&:hover': {
      backgroundColor: selected ? dayHoverColor : theme.palette.action.hover,
    },
  };
});

// 선택 가능한 테이블 행 스타일
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// 요일 버튼 컴포넌트
const WeekdayButtonContent = ({ day, date, selected, onClick, isWeekend }) => {
  const theme = useTheme();
  
  // 요일별 색상 설정
  const getDayColor = (day) => {
    switch(day) {
      case '월': return '#3f51b5'; // 파란색
      case '화': return '#4caf50'; // 초록색
      case '수': return '#2196f3'; // 하늘색
      case '목': return '#ff9800'; // 주황색
      case '금': return '#f44336'; // 빨간색
      case '토': return '#9e9e9e'; // 회색
      case '일': return '#e91e63'; // 분홍색
      default: return theme.palette.primary.main;
    }
  };
  
  // 요일별 hover 색상 설정
  const getDayHoverColor = (day) => {
    switch(day) {
      case '월': return '#303f9f'; // 진한 파란색
      case '화': return '#388e3c'; // 진한 초록색
      case '수': return '#1976d2'; // 진한 하늘색
      case '목': return '#f57c00'; // 진한 주황색
      case '금': return '#d32f2f'; // 진한 빨간색
      case '토': return '#757575'; // 진한 회색
      case '일': return '#c2185b'; // 진한 분홍색
      default: return theme.palette.primary.dark;
    }
  };
  
  // 선택된 요일에 따라 색상 결정
  const buttonColor = selected ? 'white' : (isWeekend ? (day === '일' ? '#e91e63' : '#9e9e9e') : 'inherit');
  
  // 선택된 요일에 따라 배경색 결정
  const buttonBgColor = selected ? getDayColor(day) : 'transparent';
  const buttonHoverColor = selected ? getDayHoverColor(day) : theme.palette.action.hover;
  const buttonBorderColor = selected ? getDayColor(day) : '#e0e0e0';
    
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        width: '40px',
        height: '38px',
        borderRadius: '4px',
        padding: 0,
        minWidth: 'unset',
        margin: '0 2px',
        backgroundColor: buttonBgColor,
        color: buttonColor,
        border: `1px solid ${buttonBorderColor}`,
        '&:hover': {
          backgroundColor: buttonHoverColor,
        },
        transition: 'all 0.3s ease',
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
    </Button>
  );
};

// 시간 형식 표준화 함수
const normalizeClassTime = (time) => {
  if (!time) return time;
  
  // 시간 형식 표준화
  if (time === '16:40') return '16:30';
  if (time === '17:40') return '17:30';
  if (time === '18:40') return '18:30';
  
  return time;
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
  const groupStudentsByClass = () => {
    const groups = {};
    
    students.forEach(student => {
      // 1. classes 배열 확인
      let classTimeList = [];
      
      // classes 배열이 있는 경우
      if (student.classes && student.classes.length > 0) {
        classTimeList = [...student.classes];
      } 
      // classTimes 객체가 있는 경우 (Firebase 데이터 구조)
      else if (student.classTimes && typeof student.classTimes === 'object') {
        // 요일별 수업 시간 중 값이 있는 것만 추출
        Object.values(student.classTimes).forEach(time => {
          if (time && time.trim() !== '' && !classTimeList.includes(time)) {
            classTimeList.push(time);
          }
        });
      }
      // classTime 문자열이 있는 경우
      else if (student.classTime && student.classTime.trim() !== '') {
        classTimeList.push(student.classTime);
      }
      
      // 수업 시간이 없으면 건너뛰기
      if (classTimeList.length === 0) {
        console.warn(`학생 ${student.name}(ID: ${student.id})에 수업 시간 정보가 없습니다.`);
        return;
      }
      
      // 각 수업 시간별로 학생 그룹화
      classTimeList.forEach(classTime => {
        if (!groups[classTime]) {
          groups[classTime] = [];
        }
        groups[classTime].push(student);
      });
    });
    
    // 각 수업 시간 그룹 내에서 학생들을 등원 시간 순으로 정렬
    Object.keys(groups).forEach(classTime => {
      groups[classTime] = sortStudentsByArrivalTime(groups[classTime]);
    });
    
    // 시간 순서대로 정렬
    return Object.keys(groups)
      .sort()
      .map(classTime => ({
        classTime,
        students: groups[classTime]
      }));
  };
  
  // 학생들을 등원 시간 순으로 정렬하는 함수
  const sortStudentsByArrivalTime = (studentList) => {
    return [...studentList].sort((a, b) => {
      // 현재 요일에 해당하는 등원 시간 가져오기
      const currentDayKorean = getDayName(selectedDayOfWeek);
      
      // a 학생의 등원 시간
      let aArrivalTime = null;
      if (a.arrivalTimes && a.arrivalTimes[currentDayKorean]) {
        aArrivalTime = a.arrivalTimes[currentDayKorean];
      } else if (a.arrivalTime) {
        aArrivalTime = a.arrivalTime;
      }
      
      // b 학생의 등원 시간
      let bArrivalTime = null;
      if (b.arrivalTimes && b.arrivalTimes[currentDayKorean]) {
        bArrivalTime = b.arrivalTimes[currentDayKorean];
      } else if (b.arrivalTime) {
        bArrivalTime = b.arrivalTime;
      }
      
      // 등원 시간이 없는 경우 맨 뒤로 정렬
      if (!aArrivalTime) return 1;
      if (!bArrivalTime) return -1;
      
      // 시간 문자열을 비교하여 정렬
      return aArrivalTime.localeCompare(bArrivalTime);
    });
  };
  
  // 수업 시간별 학생 그룹
  const classGroups = groupStudentsByClass();
  
  // 날짜 선택 컴포넌트 렌더링
  const renderDateSelector = () => {
    // 요일 순서를 월~일로 고정
    const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // 월(1), 화(2), 수(3), 목(4), 금(5), 토(6), 일(0)
    
    // 현재 날짜 기준으로 이번 주의 모든 날짜 계산
    const today = new Date();
    const currentDay = today.getDay(); // 오늘의 요일 (0: 일요일, 1: 월요일, ...)
    
    // 이번 주 월요일 계산
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // 일요일이면 -6, 아니면 1 - 현재요일
    const monday = addDays(today, mondayOffset);
    
    // 월~일까지의 날짜 배열 생성
    const dates = orderedDays.map((day, index) => {
      return addDays(monday, index);
    });
    
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
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                const isWeekend = day === 0 || day === 6; // 주말 여부 (토, 일)
                
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
    // 허용된 시간만 필터링
    const allowedTimes = ['15:30', '16:30', '17:30', '18:30'];
    
    // 학생 데이터에서 시간 추출 후 허용된 시간만 필터링
    const classTimes = Array.from(new Set(students.flatMap(student => 
      student.classes && student.classes.length > 0 ? student.classes : [student.classTime]
    )))
    .filter(time => allowedTimes.includes(time))
    .sort();
    
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
        
        {/* 통계 정보 */}
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
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
            통계 정보 {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? '(오늘)' : `(${getDayName(selectedDayOfWeek)}요일)`}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 1.5, 
                  textAlign: 'center', 
                  backgroundColor: '#e3f2fd',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {students.filter(student => student.arrivalLocation || arrivalStatus[student.id]).length + 
                   students.filter(student => student.departureLocation || departureStatus[student.id]).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  전체 운행
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 1.5, 
                  textAlign: 'center', 
                  backgroundColor: '#e8f5e9',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {students.filter(student => arrivalStatus[student.id]).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  등원 완료
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 1.5, 
                  textAlign: 'center', 
                  backgroundColor: '#fff8e1',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {students.filter(student => departureStatus[student.id]).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  하원 완료
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 1.5, 
                  textAlign: 'center', 
                  backgroundColor: '#ffebee',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h5" color="error.main" fontWeight="bold">
                  {Math.max(0, (students.filter(student => student.arrivalLocation || arrivalStatus[student.id]).length + 
                   students.filter(student => student.departureLocation || departureStatus[student.id]).length) - 
                    (students.filter(student => arrivalStatus[student.id]).length + 
                     students.filter(student => departureStatus[student.id]).length))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  남은 운행
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        
        {/* 수업 시간 필터 */}
        {renderClassTimeFilter()}
        
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