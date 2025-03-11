import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Grid, 
  Divider, 
  Paper,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import StatusToggleButton from './StatusToggleButton';
import { usePickup } from '../contexts/PickupContext';

// 섹션 헤더를 위한 스타일 컴포넌트
const SectionHeader = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(0.75, 2),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  marginBottom: 0,
  boxShadow: 'none'
}));

// 테이블 헤더 셀 스타일
const StyledHeaderCell = styled(TableCell)(({ theme, rightBorder, isArrival, width }) => ({
  backgroundColor: isArrival ? '#e3f2fd' : '#fce4ec',
  color: theme.palette.text.primary,
  fontSize: '0.8rem',
  padding: '8px 10px',
  borderBottom: '1px solid #e0e0e0',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  width: width || 'auto',
  minWidth: width || 'auto',
  ...(rightBorder && {
    borderRight: '2px solid #f0f0f0',
  }),
}));

// 테이블 데이터 셀 스타일
const StyledTableCell = styled(TableCell)(({ theme, highlight, rightBorder, isArrival, width }) => ({
  fontSize: '0.8rem',
  padding: '8px 10px',
  borderBottom: '1px solid #f0f0f0',
  backgroundColor: isArrival ? 'rgba(227, 242, 253, 0.3)' : 'rgba(252, 228, 236, 0.2)',
  fontWeight: 'regular',
  transition: 'all 0.3s ease',
  width: width || 'auto',
  minWidth: width || 'auto',
  ...(rightBorder && {
    borderRight: '2px solid #f0f0f0',
  }),
}));

// 클릭 가능한 행 스타일
const ClickableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'background-color 0.2s ease',
}));

// 모바일 카드 컴포넌트
const MobileStudentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  overflow: 'visible',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
}));

// 학생 정보 섹션 컴포넌트
const InfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
}));

// 차량 섹션 컴포넌트
const VehicleSection = ({ classTime, classStudents, onStudentSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { 
    arrivalStatus, 
    departureStatus, 
    toggleArrivalStatus, 
    toggleDepartureStatus,
    studentLocations,
    locations,
    calculateTimes,
    selectedDayOfWeek
  } = usePickup();
  
  // 수업 정보
  const classData = locations[classTime] || { 
    locations: {
      1: "기본 위치 1",
      2: "기본 위치 2",
      3: "기본 위치 3"
    }, 
    startTime: classTime, 
    endTime: classTime ? calculateEndTime(classTime) : '' 
  };
  
  // 요일별 학생 필터링
  const filteredStudents = classStudents.filter(student => {
    // classDays 속성이 없거나 비어있는 경우 모든 요일에 표시
    if (!student.classDays || student.classDays.length === 0) return true;
    
    // 요일 매핑 (0: 일요일, 1: 월요일, ..., 6: 토요일)
    const dayMap = {
      0: '일',
      1: '월',
      2: '화', 
      3: '수',
      4: '목',
      5: '금',
      6: '토'
    };
    
    // 현재 선택된 요일이 학생의 수업 요일에 포함되는지 확인
    return student.classDays.includes(dayMap[selectedDayOfWeek]);
  });
  
  // 종료 시간 계산 (시작 시간 + 1시간)
  function calculateEndTime(startTime) {
    if (!startTime) return '';
    
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      let endHours = hours + 1;
      
      if (endHours >= 24) {
        endHours -= 24;
      }
      
      return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('종료 시간 계산 오류:', error);
      return '';
    }
  }
  
  // 등하원 시간 계산
  const { arrivalTime: classArrivalTime } = calculateTimes(classTime);
  
  // 테이블 데이터 준비
  const prepareStudentData = (student) => {
    const { arrivalTime, departureTime } = calculateTimes(classTime);
    
    // studentLocations에서 위치 정보 가져오기
    let arrivalLocation = studentLocations[student.id]?.arrival;
    let departureLocation = studentLocations[student.id]?.departure;
    
    // studentLocations에 위치 정보가 없으면 학생 데이터에서 직접 가져오기
    if (arrivalLocation === undefined || arrivalLocation === null) {
      arrivalLocation = student.arrivalLocation || null;
    }
    
    if (departureLocation === undefined || departureLocation === null) {
      departureLocation = student.departureLocation || null;
    }
    
    // 차량 정보가 있는지 확인 (null이나 undefined가 아닌 경우)
    const hasArrivalInfo = arrivalLocation !== null && arrivalLocation !== undefined && arrivalLocation !== '';
    const hasDepartureInfo = departureLocation !== null && departureLocation !== undefined && departureLocation !== '';
    
    console.log(`학생 ID: ${student.id}, 이름: ${student.name}, 등원위치: ${arrivalLocation}, 하원위치: ${departureLocation}`);
    console.log(`차량 정보 존재 여부 - 등원: ${hasArrivalInfo}, 하원: ${hasDepartureInfo}`);
    
    // 등원 위치 텍스트 설정
    let arrivalLocationText = '차량탑승 안함';  // 기본값
    let isArrivalNoVehicle = !hasArrivalInfo;
    
    if (hasArrivalInfo) {
      // 1. 먼저 classData.locations에서 확인
      if (classData && classData.locations && classData.locations[arrivalLocation]) {
        arrivalLocationText = classData.locations[arrivalLocation];
      } 
      // 2. 다음으로 전역 locations에서 확인
      else if (locations && locations[arrivalLocation]) {
        arrivalLocationText = locations[arrivalLocation];
      }
      // 3. 그래도 없으면 위치 ID 표시 또는 직접 문자열 사용
      else {
        // 숫자인 경우 위치 ID로 표시, 문자열인 경우 그대로 사용
        arrivalLocationText = typeof arrivalLocation === 'number' ? `위치 ${arrivalLocation}` : arrivalLocation;
      }
    }
    
    // 하원 위치 텍스트 설정
    let departureLocationText = '차량탑승 안함';  // 기본값
    let isDepartureNoVehicle = !hasDepartureInfo;
    
    if (hasDepartureInfo) {
      // 1. 먼저 classData.locations에서 확인
      if (classData && classData.locations && classData.locations[departureLocation]) {
        departureLocationText = classData.locations[departureLocation];
      } 
      // 2. 다음으로 전역 locations에서 확인
      else if (locations && locations[departureLocation]) {
        departureLocationText = locations[departureLocation];
      }
      // 3. 그래도 없으면 위치 ID 표시 또는 직접 문자열 사용
      else {
        // 숫자인 경우 위치 ID로 표시, 문자열인 경우 그대로 사용
        departureLocationText = typeof departureLocation === 'number' ? `위치 ${departureLocation}` : departureLocation;
      }
    }
    
    return {
      arrivalTime,
      departureTime,
      arrivalLocation,
      departureLocation,
      arrivalLocationText,
      departureLocationText,
      hasArrivalInfo,
      hasDepartureInfo,
      isArrivalNoVehicle,
      isDepartureNoVehicle
    };
  };
  
  // PC 버전 테이블 렌더링
  const renderDesktopTable = () => (
    <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledHeaderCell align="left" isArrival={true} width="65px" rightBorder={true}>학생</StyledHeaderCell>
            <StyledHeaderCell align="center" isArrival={true} width="60px">등원시간</StyledHeaderCell>
            <StyledHeaderCell align="left" isArrival={true} width="150px">등원위치</StyledHeaderCell>
            <StyledHeaderCell align="center" rightBorder={true} isArrival={true} width="100px">등원확인</StyledHeaderCell>
            <StyledHeaderCell align="center" width="60px">하원시간</StyledHeaderCell>
            <StyledHeaderCell align="left" width="150px">하원위치</StyledHeaderCell>
            <StyledHeaderCell align="center" rightBorder={true} width="100px">하원확인</StyledHeaderCell>
            <StyledHeaderCell align="center" width="60px">수정</StyledHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredStudents.map((student) => {
            const { 
              arrivalTime, 
              departureTime, 
              arrivalLocation,
              departureLocation,
              arrivalLocationText,
              departureLocationText,
              hasArrivalInfo,
              hasDepartureInfo
            } = prepareStudentData(student);
            
            return (
              <TableRow 
                key={student.id}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <StyledTableCell align="left" isArrival={true} width="65px" rightBorder={true}>
                  {student.name} ({student.shortId})
                  {student.waitingNumber && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      {student.waitingNumber ? `대기: ${student.waitingNumber}` : ''}
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell align="center" isArrival={true} width="60px">
                  {arrivalTime}
                </StyledTableCell>
                <StyledTableCell align="left" isArrival={true} width="150px">
                  <Typography variant="body2" sx={{ 
                    display: 'inline-block',
                    '&::before': { display: 'none' }
                  }}>
                    {hasArrivalInfo ? arrivalLocationText : "차량탑승 안함"}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" rightBorder={true} isArrival={true} width="100px">
                  <StatusToggleButton 
                    status={arrivalStatus[student.id] || false} 
                    onClick={() => toggleArrivalStatus(student.id)}
                    disabled={!hasArrivalInfo}
                  />
                </StyledTableCell>
                <StyledTableCell align="center" width="60px">
                  {departureTime}
                </StyledTableCell>
                <StyledTableCell align="left" width="150px">
                  <Typography variant="body2" sx={{ 
                    display: 'inline-block',
                    '&::before': { display: 'none' }
                  }}>
                    {hasDepartureInfo ? departureLocationText : "차량탑승 안함"}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" rightBorder={true} width="100px">
                  <StatusToggleButton 
                    status={departureStatus[student.id] || false} 
                    onClick={() => toggleDepartureStatus(student.id)}
                    disabled={!hasDepartureInfo}
                  />
                </StyledTableCell>
                <StyledTableCell align="center" width="60px">
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      if(onStudentSelect) {
                        onStudentSelect(student);
                      }
                    }}
                  >
                    수정
                  </Button>
                </StyledTableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // 모바일 버전 카드 렌더링
  const renderMobileCards = () => (
    <Box sx={{ mt: 1 }}>
      {filteredStudents.map((student) => {
        const { 
          arrivalTime, 
          departureTime, 
          arrivalLocation,
          departureLocation,
          arrivalLocationText,
          departureLocationText,
          hasArrivalInfo,
          hasDepartureInfo
        } = prepareStudentData(student);
        
        return (
          <Card 
            key={student.id} 
            elevation={1} 
            sx={{ 
              mb: 2, 
              borderRadius: 1, 
              overflow: 'visible',
              '&:hover': {
                boxShadow: 3
              },
              transition: 'box-shadow 0.2s ease-in-out'
            }}
          >
            <InfoSection>
              <Typography variant="subtitle2">
                {student.name} ({student.shortId})
                {student.waitingNumber && (
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                    {student.waitingNumber ? `대기: ${student.waitingNumber}` : ''}
                  </Typography>
                )}
              </Typography>
            </InfoSection>
            
            <Divider />
            
            <Box sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ 
                mb: 1, 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                '&::before': hasArrivalInfo ? {
                  content: '""',
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  marginRight: '8px'
                } : {}
              }}>등원 정보</Typography>
              <Grid container spacing={1} sx={{ 
                mb: 1,
                p: 1,
                backgroundColor: 'rgba(227, 242, 253, 0.4)',
                borderRadius: '4px'
              }}>
                <Grid item xs={4}>
                  <Typography variant="body2">시간:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{arrivalTime}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">등원위치:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" sx={{ 
                    display: 'inline-block',
                    '&::before': { display: 'none' }
                  }}>
                    {hasArrivalInfo ? arrivalLocationText : "차량탑승 안함"}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">상태:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <StatusToggleButton 
                    status={arrivalStatus[student.id] || false} 
                    onClick={() => toggleArrivalStatus(student.id)}
                    disabled={!hasArrivalInfo}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ 
                my: 2,
                borderWidth: '3px', 
                borderStyle: 'solid',
                borderColor: '#bdbdbd',
                position: 'relative',
                width: '100%',
                '&::after': {
                  content: '"구분"',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '50px',
                  height: '24px',
                  backgroundColor: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1,
                  border: '1px solid #bdbdbd',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#757575',
                  boxShadow: 'none'
                }
              }} />
              
              <Typography variant="subtitle2" sx={{ 
                mb: 1, 
                fontWeight: 'bold',
                color: theme.palette.secondary.main,
                display: 'flex',
                alignItems: 'center',
                '&::before': hasDepartureInfo ? {
                  content: '""',
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.palette.secondary.main,
                  marginRight: '8px'
                } : {}
              }}>하원 정보</Typography>
              <Grid container spacing={1} sx={{ 
                p: 1,
                backgroundColor: 'rgba(252, 228, 236, 0.3)',
                borderRadius: '4px'
              }}>
                <Grid item xs={4}>
                  <Typography variant="body2">시간:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{departureTime}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">하원위치:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" sx={{ 
                    display: 'inline-block',
                    '&::before': { display: 'none' }
                  }}>
                    {hasDepartureInfo ? departureLocationText : "차량탑승 안함"}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">상태:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <StatusToggleButton 
                    status={departureStatus[student.id] || false} 
                    onClick={() => toggleDepartureStatus(student.id)}
                    disabled={!hasDepartureInfo}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => {
                    if(onStudentSelect) {
                      onStudentSelect(student);
                    }
                  }}
                >
                  학생정보 수정
                </Button>
              </Box>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
  
  return (
    <Box sx={{ mt: 3 }}>
      <SectionHeader>
        <DirectionsBusIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          {classTime} 수업
        </Typography>
      </SectionHeader>
      
      {isMobile ? renderMobileCards() : renderDesktopTable()}
    </Box>
  );
};

export default VehicleSection; 