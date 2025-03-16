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

// 시간 형식 표준화 함수
const normalizeClassTime = (time) => {
  if (!time) return time;
  
  // 시간 형식 표준화
  if (time === '16:40') return '16:30';
  if (time === '17:40') return '17:30';
  if (time === '18:40') return '18:30';
  
  return time;
};

// 요일 매핑
const dayMap = {
  '월': 'monday',
  '화': 'tuesday',
  '수': 'wednesday',
  '목': 'thursday',
  '금': 'friday',
  '토': 'saturday',
  '일': 'sunday'
};

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

// StyledHeaderCell과 StyledTableCell에 대한 래퍼 컴포넌트 생성
const HeaderCell = ({ isarrival, rightborder, children, ...props }) => (
  <StyledHeaderCell isArrival={isarrival === 'true'} rightBorder={rightborder === 'true'} {...props}>
    {children}
  </StyledHeaderCell>
);

const DataCell = ({ isarrival, rightborder, children, ...props }) => (
  <StyledTableCell isArrival={isarrival === 'true'} rightBorder={rightborder === 'true'} {...props}>
    {children}
  </StyledTableCell>
);

// 차량 섹션 컴포넌트
const VehicleSection = ({ classTime, classData, students, classStudents, maxHeight, onStudentSelect }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // 시간 형식 표준화
  const normalizedClassTime = normalizeClassTime(classTime);
  
  const {
    arrivalStatus,
    departureStatus,
    toggleArrivalStatus,
    toggleDepartureStatus,
    getDayName,
    calculateTimes,
    locations,
    selectedDayOfWeek
  } = usePickup();

  // 현재 요일명 가져오기
  const currentDay = getDayName(selectedDayOfWeek);
  
  // 수업 정보 - 변수명 변경: classData -> classTimeData
  const classTimeData = locations[normalizedClassTime] || { 
    locations: {
      1: "기본 위치 1",
      2: "기본 위치 2",
      3: "기본 위치 3"
    }, 
    startTime: normalizedClassTime, 
    endTime: normalizedClassTime ? calculateEndTime(normalizedClassTime) : '' 
  };
  
  // students 또는 classStudents 프로퍼티 사용 (호환성 유지)
  const studentData = students || classStudents || [];

  // 요일별 학생 필터링
  const filteredStudents = studentData.filter(student => {
    // 요일 매핑 (1: 월요일, 2: 화요일, ..., 5: 금요일)
    const dayMap = {
      1: '월',
      2: '화', 
      3: '수',
      4: '목',
      5: '금'
    };
    
    // 현재 선택된 요일의 한글 표기
    const currentDayKorean = dayMap[selectedDayOfWeek];
    
    // 디버깅 로그 추가
    console.log(`학생: ${student.name}, 수업 요일: ${student.classDays}, 현재 요일: ${currentDayKorean}`);
    console.log(`학생: ${student.name}, 수업 시간: ${student.classTimes ? JSON.stringify(student.classTimes) : student.classTime}, 현재 수업 시간: ${normalizedClassTime}`);
    
    // 1. 요일 필터링
    // classDays 속성이 있는 경우, 현재 요일이 학생의 수업 요일에 포함되는지 확인
    if (student.classDays && student.classDays.length > 0) {
      const isClassDay = student.classDays.includes(currentDayKorean);
      if (!isClassDay) {
        console.log(`${student.name} 학생은 ${currentDayKorean}요일 수업이 아닙니다.`);
        return false; // 현재 요일이 학생의 수업 요일에 포함되지 않으면 필터링
      }
    }
    
    // 2. 수업 시간 필터링
    // 요일별 수업 시간이 있는 경우
    if (student.classTimes && student.classTimes[currentDayKorean]) {
      const studentClassTime = normalizeClassTime(student.classTimes[currentDayKorean]);
      const isMatchingClassTime = studentClassTime === normalizedClassTime;
      console.log(`${student.name} 학생의 ${currentDayKorean}요일 수업 시간: ${studentClassTime}, 현재 수업 시간: ${normalizedClassTime}, 일치 여부: ${isMatchingClassTime}`);
      return isMatchingClassTime;
    } 
    // 기존 classTime 속성이 있는 경우
    else if (student.classTime) {
      const studentClassTime = normalizeClassTime(student.classTime);
      const isMatchingClassTime = studentClassTime === normalizedClassTime;
      console.log(`${student.name} 학생의 수업 시간: ${studentClassTime}, 현재 수업 시간: ${normalizedClassTime}, 일치 여부: ${isMatchingClassTime}`);
      return isMatchingClassTime;
    }
    // 수업 시간 정보가 없는 경우
    else {
      console.log(`${student.name} 학생은 수업 시간 정보가 없습니다.`);
      return false;
    }
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
  const prepareStudentData = (student) => {
    // 기본 등하원 시간 계산
    const defaultTimes = calculateTimes(normalizedClassTime);
    
    // 학생 데이터에서 요일별 위치 정보 가져오기
    const arrivalLocation = student.arrivalLocations && student.arrivalLocations[currentDay] 
      ? student.arrivalLocations[currentDay] 
      : (student.arrivalLocation || null); // 기존 형식과의 호환성 유지
      
    const departureLocation = student.departureLocations && student.departureLocations[currentDay]
      ? student.departureLocations[currentDay]
      : (student.departureLocation || null); // 기존 형식과의 호환성 유지
    
    // 학생 데이터에서 요일별 시간 정보 가져오기
    let arrivalTime = defaultTimes.arrivalTime;
    let departureTime = defaultTimes.departureTime;
    
    // 요일별 등원시간이 있는 경우
    if (student.arrivalTimes && student.arrivalTimes[currentDay]) {
      arrivalTime = student.arrivalTimes[currentDay];
    } 
    // 기존 arrivalTime 속성이 있는 경우
    else if (student.arrivalTime) {
      arrivalTime = student.arrivalTime;
    }
    
    // 요일별 하원시간이 있는 경우
    if (student.departureTimes && student.departureTimes[currentDay]) {
      departureTime = student.departureTimes[currentDay];
    }
    // 기존 departureTime 속성이 있는 경우
    else if (student.departureTime) {
      departureTime = student.departureTime;
    }
    
    // 차량 정보가 있는지 확인 (null이나 undefined가 아닌 경우)
    const hasArrivalInfo = arrivalLocation !== null && arrivalLocation !== undefined && arrivalLocation !== '';
    const hasDepartureInfo = departureLocation !== null && departureLocation !== undefined && departureLocation !== '';
    
    console.log(`학생 ID: ${student.id}, 이름: ${student.name}, ${currentDay}요일 등원위치: ${arrivalLocation}, ${currentDay}요일 하원위치: ${departureLocation}`);
    console.log(`학생 ID: ${student.id}, 이름: ${student.name}, ${currentDay}요일 등원시간: ${arrivalTime}, ${currentDay}요일 하원시간: ${departureTime}`);
    console.log(`차량 정보 존재 여부 - 등원: ${hasArrivalInfo}, 하원: ${hasDepartureInfo}`);
    console.log(`등원 상태: ${arrivalStatus[student.id] ? '완료' : '대기중'}, 하원 상태: ${departureStatus[student.id] ? '완료' : '대기중'}`);
    
    // 등원 위치 텍스트 설정
    let arrivalLocationText = '차량탑승 안함';  // 기본값
    let isArrivalNoVehicle = !hasArrivalInfo;
    
    if (hasArrivalInfo) {
      // 1. 먼저 classData.locations에서 확인
      if (classData && classData.locations && classData.locations[arrivalLocation]) {
        arrivalLocationText = classData.locations[arrivalLocation];
      } 
      // 2. 다음으로 classTimeData.locations에서 확인
      else if (classTimeData && classTimeData.locations && classTimeData.locations[arrivalLocation]) {
        arrivalLocationText = classTimeData.locations[arrivalLocation];
      }
      // 3. 다음으로 전역 locations 객체에서 확인
      else if (locations && locations[arrivalLocation]) {
        arrivalLocationText = locations[arrivalLocation];
      }
      // 4. 그래도 없으면 위치 ID 표시 또는 직접 문자열 사용
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
      // 2. 다음으로 classTimeData.locations에서 확인
      else if (classTimeData && classTimeData.locations && classTimeData.locations[departureLocation]) {
        departureLocationText = classTimeData.locations[departureLocation];
      }
      // 3. 다음으로 전역 locations에서 확인
      else if (locations && locations[departureLocation]) {
        departureLocationText = locations[departureLocation];
      }
      // 4. 그래도 없으면 위치 ID 표시 또는 직접 문자열 사용
      else {
        // 숫자인 경우 위치 ID로 표시, 문자열인 경우 그대로 사용
        departureLocationText = typeof departureLocation === 'number' ? `위치 ${departureLocation}` : departureLocation;
      }
    }
    
    return {
      ...student,
      arrivalTime,
      departureTime,
      arrivalLocation,
      departureLocation,
      arrivalLocationText,
      departureLocationText,
      hasArrivalInfo,
      hasDepartureInfo
    };
  };

  // 학생 데이터 준비 및 정렬
  const preparedStudents = filteredStudents.map(prepareStudentData);

  // 등원 시간 순으로 정렬
  const sortedStudents = [...preparedStudents].sort((a, b) => {
    // 등원 시간이 없는 경우 맨 뒤로 정렬
    if (!a.arrivalTime) return 1;
    if (!b.arrivalTime) return -1;

    // 시간 문자열을 비교하여 정렬
    return a.arrivalTime.localeCompare(b.arrivalTime);
  });
  
  // PC 버전 테이블 렌더링
  const renderDesktopTable = () => (
    <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <HeaderCell isarrival="true" rightborder="true" width="65px" align="left">학생</HeaderCell>
            <HeaderCell isarrival="true" width="60px" align="center">등원시간</HeaderCell>
            <HeaderCell isarrival="true" width="150px" align="left">등원위치</HeaderCell>
            <HeaderCell isarrival="true" rightborder="true" width="100px" align="center">등원확인</HeaderCell>
            <HeaderCell width="60px" align="center">하원시간</HeaderCell>
            <HeaderCell width="150px" align="left">하원위치</HeaderCell>
            <HeaderCell width="100px" align="center">하원확인</HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedStudents.map((student) => {
            // 학생 데이터 준비
            const studentData = student;
            
            return (
              <ClickableRow 
                key={student.id} 
                onClick={() => onStudentSelect && onStudentSelect(student)}
                hover
              >
                <DataCell isarrival="true" rightborder="true">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {student.name}
                    </Typography>
                  </Box>
                </DataCell>
                <DataCell isarrival="true" align="center">
                  {studentData.arrivalTime || '-'}
                </DataCell>
                <DataCell isarrival="true">
                  {studentData.arrivalLocationText}
                </DataCell>
                <DataCell isarrival="true" rightborder="true" align="center">
                  <StatusToggleButton 
                    status={arrivalStatus[student.id] || false}
                    onChange={() => toggleArrivalStatus(student.id)}
                    disabled={studentData.isArrivalNoVehicle}
                    size="small"
                  />
                </DataCell>
                <DataCell align="center">
                  {studentData.departureTime || '-'}
                </DataCell>
                <DataCell>
                  {studentData.departureLocationText}
                </DataCell>
                <DataCell align="center">
                  <StatusToggleButton 
                    status={departureStatus[student.id] || false}
                    onChange={() => toggleDepartureStatus(student.id)}
                    disabled={studentData.isDepartureNoVehicle}
                    size="small"
                  />
                </DataCell>
              </ClickableRow>
            );
          })}
          {sortedStudents.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  이 수업 시간에 등록된 학생이 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // 모바일 버전 카드 렌더링
  const renderMobileCards = () => (
    <Box sx={{ mb: 3 }}>
      {sortedStudents.map((student) => {
        // 학생 데이터 준비
        const studentData = student;
        
        return (
          <MobileStudentCard key={student.id} onClick={() => onStudentSelect && onStudentSelect(student)}>
            <InfoSection>
              <Typography variant="subtitle1" fontWeight="medium">
                {student.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {normalizedClassTime} 수업
              </Typography>
            </InfoSection>
            <Divider />
            <Box sx={{ p: 1.5, backgroundColor: 'rgba(227, 242, 253, 0.3)' }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    등원시간
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {studentData.arrivalTime || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">
                    등원위치
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {studentData.arrivalLocationText}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <StatusToggleButton 
                    status={arrivalStatus[student.id] || false}
                    onChange={() => toggleArrivalStatus(student.id)}
                    disabled={studentData.isArrivalNoVehicle}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
            <Divider />
            <Box sx={{ p: 1.5, backgroundColor: 'rgba(252, 228, 236, 0.2)' }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    하원시간
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {studentData.departureTime || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">
                    하원위치
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {studentData.departureLocationText}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <StatusToggleButton 
                    status={departureStatus[student.id] || false}
                    onChange={() => toggleDepartureStatus(student.id)}
                    disabled={studentData.isDepartureNoVehicle}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          </MobileStudentCard>
        );
      })}
      {sortedStudents.length === 0 && (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            이 수업 시간에 등록된 학생이 없습니다.
          </Typography>
        </Paper>
      )}
    </Box>
  );
  
  return (
    <Box sx={{ mb: 3 }}>
      <SectionHeader>
        <DirectionsBusIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight="medium">
          {normalizedClassTime} 수업 ({sortedStudents.length}명)
        </Typography>
      </SectionHeader>
      
      {isSmallScreen ? renderMobileCards() : isMediumScreen ? renderMobileCards() : renderDesktopTable()}
    </Box>
  );
};

export default VehicleSection; 