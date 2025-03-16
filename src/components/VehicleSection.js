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
import { normalizeClassTime, sortStudentsByArrivalTime } from '../utils/tableUtils';
import { 
  SectionHeader, 
  ClickableRow, 
  StyledHeaderCell, 
  StyledTableCell,
  MobileCard
} from '../styles/commonStyles';

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

// 학생 정보 섹션 컴포넌트
const InfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 1.5),
  },
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

// 학생 정보 표시 컴포넌트
const StudentInfo = ({ student }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight="medium">
        {student.name}
        {student.shortId && (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            (#{student.shortId})
          </Typography>
        )}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {student.school || '학교 정보 없음'}
        {student.grade && ` ${student.grade}`}
      </Typography>
      {student.displayClassDays && student.displayClassDays.length > 0 && (
        <Typography variant="body2" color="text.secondary">
          수업: {student.displayClassDays.join(', ')}요일
        </Typography>
      )}
    </Box>
  );
};

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
      console.log(`${student.name}(${student.id}) - 요일별 등원시간 사용: ${arrivalTime}`);
    } 
    // 기존 arrivalTime 속성이 있는 경우
    else if (student.arrivalTime) {
      arrivalTime = student.arrivalTime;
      console.log(`${student.name}(${student.id}) - 기본 등원시간 사용: ${arrivalTime}`);
    } else {
      console.log(`${student.name}(${student.id}) - 기본값 등원시간 사용: ${arrivalTime}`);
    }
    
    // 시간 형식을 HH:MM으로 표준화
    if (arrivalTime) {
      // 시간 형식 표준화
      const timeMatch = String(arrivalTime).match(/^(\d{1,2}):(\d{2})$/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        // 2자리로 포맷팅 (예: 9:30 -> 09:30)
        arrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        console.log(`${student.name}(${student.id}) - 등원시간 형식 표준화: ${arrivalTime}`);
      } else {
        console.warn(`${student.name}(${student.id}) - 잘못된 등원시간 형식: ${arrivalTime}`);
      }
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
    
    // 차량 이용 여부 확인 (위치 정보가 '도보', '자차', '없음' 등인 경우 차량 이용 안함)
    const isArrivalNoVehicle = !hasArrivalInfo || 
      ['도보', '자차', '없음', '해당없음', '-'].includes(arrivalLocation);
    const isDepartureNoVehicle = !hasDepartureInfo || 
      ['도보', '자차', '없음', '해당없음', '-'].includes(departureLocation);
    
    console.log(`학생 ${student.name}(${student.id})의 최종 등원시간: ${arrivalTime}`);
    console.log(`학생 ID: ${student.id}, 이름: ${student.name}, ${currentDay}요일 등원위치: ${arrivalLocation}, ${currentDay}요일 하원위치: ${departureLocation}`);
    console.log(`학생 ID: ${student.id}, 이름: ${student.name}, ${currentDay}요일 등원시간: ${arrivalTime}, ${currentDay}요일 하원시간: ${departureTime}`);
    console.log(`차량 정보 존재 여부 - 등원: ${hasArrivalInfo}, 하원: ${hasDepartureInfo}`);
    console.log(`차량 이용 여부 - 등원: ${!isArrivalNoVehicle}, 하원: ${!isDepartureNoVehicle}`);
    console.log(`등원 상태: ${arrivalStatus[student.id] ? '완료' : '대기중'}, 하원 상태: ${departureStatus[student.id] ? '완료' : '대기중'}`);
    
    // 위치 텍스트 생성
    const arrivalLocationText = arrivalLocation || '정보 없음';
    const departureLocationText = departureLocation || '정보 없음';
    
    return {
      ...student,
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

  // 학생 데이터 준비 및 정렬
  const preparedStudents = filteredStudents.map(prepareStudentData);

  // 시간 문자열을 숫자(분)로 변환하는 유틸리티 함수 추가
  const parseTimeToMinutes = (timeString) => {
    if (!timeString) return 9999; // 시간이 없으면 맨 뒤로 정렬
    
    // 문자열 확인
    if (typeof timeString !== 'string') {
      console.warn(`시간이 문자열이 아님: ${timeString}, 타입: ${typeof timeString}`);
      return 9999; // 문자열이 아니면 맨 뒤로 정렬
    }
    
    // 시간 문자열 정규화 (공백 제거, 소문자 변환)
    timeString = timeString.trim();
    
    // 정규식으로 HH:MM 형식인지 확인
    let match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      // 다른 시간 형식 시도 (예: H:MM)
      match = timeString.match(/^(\d{1}):(\d{2})$/);
      if (!match) {
        console.warn(`잘못된 시간 형식: ${timeString}`);
        return 9999; // 잘못된 형식은 맨 뒤로 정렬
      }
    }
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    // 시간이 유효한지 확인
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn(`시간 범위 초과 또는 유효하지 않은 값: ${timeString}, 시간: ${hours}, 분: ${minutes}`);
      return 9999; // 범위를 벗어난 값은 맨 뒤로 정렬
    }
    
    // 시간을 분으로 변환
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes;
  };

  // 모든 학생의 시간 데이터를 미리 계산
  const studentsWithMinutes = preparedStudents.map(student => {
    const minutesValue = parseTimeToMinutes(student.arrivalTime);
    return {
      ...student,
      arrivalTimeMinutes: minutesValue
    };
  });
  
  // 디버그: 변환된 시간 확인
  console.log('=== 시간 변환 결과 ===');
  studentsWithMinutes.forEach(student => {
    console.log(`${student.name}(${student.id}) - ${student.arrivalTime} → ${student.arrivalTimeMinutes}분`);
  });
  console.log('=====================');
  
  // 분 단위로 정렬
  const sortedStudents = sortStudentsByArrivalTime(studentsWithMinutes, currentDay);
  
  // 디버그: 최종 정렬 결과 출력
  console.log('=== 최종 정렬 결과 ===');
  sortedStudents.forEach((student, index) => {
    console.log(`${index+1}. ${student.name}(${student.id}) - ${student.arrivalTime} (${student.arrivalTimeMinutes}분)`);
  });
  console.log('=====================');
  
  // 데이터 구조 디버깅
  console.log('=== VehicleSection 데이터 구조 ===');
  console.log(`클래스 시간: ${classTime}, 정규화된 시간: ${normalizedClassTime}`);
  console.log(`클래스 데이터:`, classData);
  console.log(`학생 데이터 수: ${(students || []).length + (classStudents || []).length}`);
  console.log(`학생 데이터 키:`, students && students.length > 0 ? Object.keys(students[0]) : []);
  console.log('=====================');
  
  // PC 버전 테이블 렌더링
  const renderDesktopTable = () => {
    // 등원 서비스를 이용하는 학생 필터링
    const arrivalStudents = sortedStudents.filter(student => 
      student.hasArrivalInfo && !student.isArrivalNoVehicle
    );
    
    // 하원 서비스를 이용하는 학생 필터링
    const departureStudents = sortedStudents.filter(student => 
      student.hasDepartureInfo && !student.isDepartureNoVehicle
    );
    
    return (
      <Grid container spacing={2}>
        {/* 등원 테이블 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#e3f2fd', p: 1, px: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                등원 ({arrivalStudents.length}명)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <HeaderCell isarrival="true" width="65px" align="left">학생</HeaderCell>
                    <HeaderCell isarrival="true" width="60px" align="center">등원시간</HeaderCell>
                    <HeaderCell isarrival="true" width="150px" align="left">등원위치</HeaderCell>
                    <HeaderCell isarrival="true" width="80px" align="center">등원확인</HeaderCell>
                    <HeaderCell isarrival="true" width="50px" align="center">수정</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {arrivalStudents.map((student) => {
                    const studentData = student;
                    
                    return (
                      <ClickableRow 
                        key={`arrival-${student.id}`} 
                        onClick={() => onStudentSelect && onStudentSelect(student)}
                        hover
                      >
                        <DataCell isarrival="true">
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
                        <DataCell isarrival="true" align="center">
                          <StatusToggleButton 
                            status={arrivalStatus[student.id] || false}
                            onChange={() => toggleArrivalStatus(student.id)}
                            size="small"
                          />
                        </DataCell>
                        <DataCell isarrival="true" align="center">
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStudentSelect && onStudentSelect(student);
                            }}
                          >
                            수정
                          </Button>
                        </DataCell>
                      </ClickableRow>
                    );
                  })}
                  {arrivalStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          등원 서비스를 이용하는 학생이 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* 하원 테이블 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#fce4ec', p: 1, px: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                하원 ({departureStudents.length}명)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <HeaderCell width="65px" align="left">학생</HeaderCell>
                    <HeaderCell width="60px" align="center">하원시간</HeaderCell>
                    <HeaderCell width="150px" align="left">하원위치</HeaderCell>
                    <HeaderCell width="80px" align="center">하원확인</HeaderCell>
                    <HeaderCell width="50px" align="center">수정</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departureStudents.map((student) => {
                    const studentData = student;
                    
                    return (
                      <ClickableRow 
                        key={`departure-${student.id}`} 
                        onClick={() => onStudentSelect && onStudentSelect(student)}
                        hover
                      >
                        <DataCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {student.name}
                            </Typography>
                          </Box>
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
                            size="small"
                          />
                        </DataCell>
                        <DataCell align="center">
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStudentSelect && onStudentSelect(student);
                            }}
                          >
                            수정
                          </Button>
                        </DataCell>
                      </ClickableRow>
                    );
                  })}
                  {departureStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          하원 서비스를 이용하는 학생이 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  // 모바일 버전 카드 렌더링
  const renderMobileCards = () => {
    // 등원 서비스를 이용하는 학생 필터링
    const arrivalStudents = sortedStudents.filter(student => 
      student.hasArrivalInfo && !student.isArrivalNoVehicle
    );
    
    // 하원 서비스를 이용하는 학생 필터링
    const departureStudents = sortedStudents.filter(student => 
      student.hasDepartureInfo && !student.isDepartureNoVehicle
    );
    
    return (
      <Grid container spacing={2}>
        {/* 등원 카드 섹션 */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#e3f2fd', p: 1, px: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                등원 ({arrivalStudents.length}명)
              </Typography>
            </Box>
          </Paper>
          
          {arrivalStudents.map((student) => {
            const studentData = student;
            
            return (
              <MobileCard key={`arrival-${student.id}`} onClick={() => onStudentSelect && onStudentSelect(student)}>
                <InfoSection>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {student.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {normalizedClassTime} 수업
                  </Typography>
                </InfoSection>
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
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </MobileCard>
            );
          })}
          {arrivalStudents.length === 0 && (
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                등원 서비스를 이용하는 학생이 없습니다.
              </Typography>
            </Paper>
          )}
        </Grid>
        
        {/* 하원 카드 섹션 */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#fce4ec', p: 1, px: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                하원 ({departureStudents.length}명)
              </Typography>
            </Box>
          </Paper>
          
          {departureStudents.map((student) => {
            const studentData = student;
            
            return (
              <MobileCard key={`departure-${student.id}`} onClick={() => onStudentSelect && onStudentSelect(student)}>
                <InfoSection>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {student.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {normalizedClassTime} 수업
                  </Typography>
                </InfoSection>
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
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </MobileCard>
            );
          })}
          {departureStudents.length === 0 && (
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                하원 서비스를 이용하는 학생이 없습니다.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    );
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <SectionHeader>
        <DirectionsBusIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight="medium">
          {normalizedClassTime} 수업 (차량 이용: {sortedStudents.filter(student => 
            (student.hasArrivalInfo && !student.isArrivalNoVehicle) || 
            (student.hasDepartureInfo && !student.isDepartureNoVehicle)
          ).length}명)
        </Typography>
      </SectionHeader>
      
      {isSmallScreen ? renderMobileCards() : isMediumScreen ? renderMobileCards() : renderDesktopTable()}
    </Box>
  );
};

export default VehicleSection; 