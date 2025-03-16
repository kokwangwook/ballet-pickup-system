import React, { useState, useEffect } from 'react';
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
  Button,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StatusToggleButton from './StatusToggleButton';
import { usePickup } from '../contexts/PickupContext';
import { Link } from 'react-router-dom';

// 시간 형식 표준화 함수
const normalizeClassTime = (time) => {
  if (!time) return time;
  
  // 시간 형식 표준화
  if (time === '16:40') return '16:30';
  if (time === '17:40') return '17:30';
  if (time === '18:40') return '18:30';
  
  return time;
};

// 섹션 헤더를 위한 스타일 컴포넌트
const SectionHeader = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(0.75, 2),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  boxShadow: 'none'
}));

// 테이블 헤더 셀 스타일
const StyledHeaderCell = styled(TableCell)(({ theme, isArrival }) => ({
  backgroundColor: isArrival ? '#e3f2fd' : '#fce4ec',
  color: theme.palette.text.primary,
  fontSize: '0.8rem',
  padding: '8px 10px',
  borderBottom: '1px solid #e0e0e0',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
}));

// 테이블 데이터 셀 스타일
const StyledTableCell = styled(TableCell)(({ theme, isArrival }) => ({
  fontSize: '0.8rem',
  padding: '8px 10px',
  borderBottom: '1px solid #f0f0f0',
  backgroundColor: isArrival ? 'rgba(227, 242, 253, 0.3)' : 'rgba(252, 228, 236, 0.2)',
  fontWeight: 'regular',
  transition: 'all 0.3s ease',
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

// 테스트 레이아웃 컴포넌트
const TestVehicleLayout = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // 테스트 페이지 데이터 상태
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API에서 테스트 페이지 데이터 가져오기
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/test-page');
        
        if (!response.ok) {
          throw new Error(`서버에서 데이터를 가져오는 데 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('테스트 페이지 데이터:', data);
        setTestData(data);
        setError(null);
      } catch (err) {
        console.error('테스트 데이터 가져오기 오류:', err);
        setError(err.message || '데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestData();
  }, []);
  
  // PickupContext에서 필요한 데이터 가져오기
  const pickupContext = usePickup();
  
  // 컨텍스트가 없는 경우 처리
  if (!pickupContext) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          PickupContext를 찾을 수 없습니다. 애플리케이션이 올바르게 설정되었는지 확인하세요.
        </Alert>
      </Container>
    );
  }
  
  const {
    arrivalStatus,
    departureStatus,
    toggleArrivalStatus,
    toggleDepartureStatus,
    getDayName,
    calculateTimes,
    locations,
    selectedDayOfWeek,
    students
  } = pickupContext;

  // 현재 요일명 가져오기
  const currentDay = getDayName ? getDayName(selectedDayOfWeek) : '월';
  
  // 시간 문자열을 숫자(분)로 변환하는 유틸리티 함수
  const parseTimeToMinutes = (timeString) => {
    if (!timeString) return 9999;
    
    // 정규식으로 HH:MM 형식인지 확인
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      return 9999;
    }
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    // 시간을 분으로 변환
    return hours * 60 + minutes;
  };

  // 학생 데이터 준비
  const prepareStudentData = (student) => {
    if (!student) return null;
    
    // 기본 등하원 시간 계산
    const defaultTimes = calculateTimes ? calculateTimes('15:30') : { arrivalTime: '15:00', departureTime: '16:30' };
    
    // 학생 데이터에서 요일별 위치 정보 가져오기
    const arrivalLocation = student.arrivalLocations && student.arrivalLocations[currentDay] 
      ? student.arrivalLocations[currentDay] 
      : (student.arrivalLocation || null);
      
    const departureLocation = student.departureLocations && student.departureLocations[currentDay]
      ? student.departureLocations[currentDay]
      : (student.departureLocation || null);
    
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
    
    // 차량 정보가 있는지 확인
    const hasArrivalInfo = arrivalLocation !== null && arrivalLocation !== undefined && arrivalLocation !== '';
    const hasDepartureInfo = departureLocation !== null && departureLocation !== undefined && departureLocation !== '';
    
    // 차량 이용 여부 확인
    const isArrivalNoVehicle = !hasArrivalInfo || 
      ['도보', '자차', '없음', '해당없음', '-'].includes(arrivalLocation);
    const isDepartureNoVehicle = !hasDepartureInfo || 
      ['도보', '자차', '없음', '해당없음', '-'].includes(departureLocation);
    
    return {
      ...student,
      arrivalTime,
      departureTime,
      arrivalLocation,
      departureLocation,
      arrivalLocationText: arrivalLocation || '정보 없음',
      departureLocationText: departureLocation || '정보 없음',
      hasArrivalInfo,
      hasDepartureInfo,
      isArrivalNoVehicle,
      isDepartureNoVehicle,
      arrivalTimeMinutes: parseTimeToMinutes(arrivalTime)
    };
  };

  // 학생 데이터 준비 및 정렬
  const preparedStudents = students && Array.isArray(students) 
    ? students.map(prepareStudentData).filter(Boolean)
    : [];
  
  // 분 단위로 정렬
  const sortedStudents = [...preparedStudents].sort((a, b) => {
    // 분 단위로 비교 (없으면 맨 뒤로)
    if (a.arrivalTimeMinutes === 9999 && b.arrivalTimeMinutes !== 9999) return 1;
    if (a.arrivalTimeMinutes !== 9999 && b.arrivalTimeMinutes === 9999) return -1;
    
    // 분 단위로 비교
    if (a.arrivalTimeMinutes !== b.arrivalTimeMinutes) {
      return a.arrivalTimeMinutes - b.arrivalTimeMinutes;
    }
    
    // 이름으로 비교
    return (a.name || '').localeCompare(b.name || '');
  });

  // 수업 시간별로 학생 그룹화
  const classGroups = {};
  
  // 기본 수업 시간 설정
  const defaultClassTimes = ['15:30', '16:30', '17:30', '18:30'];
  
  // 기본 수업 시간으로 빈 그룹 초기화
  defaultClassTimes.forEach(time => {
    classGroups[time] = [];
  });
  
  // 학생 데이터가 있으면 그룹화
  if (sortedStudents && sortedStudents.length > 0) {
    sortedStudents.forEach(student => {
      if (!student) return;
      
      const classTime = normalizeClassTime(student.classTime) || '15:30'; // 기본값 설정
      if (!classGroups[classTime]) {
        classGroups[classTime] = [];
      }
      classGroups[classTime].push(student);
    });
  }

  // 수업 시간 목록 (정렬된)
  const classTimeList = Object.keys(classGroups).sort((a, b) => {
    return parseTimeToMinutes(a) - parseTimeToMinutes(b);
  });

  // 차량 섹션 렌더링
  const renderVehicleSection = (classTime, students) => {
    // 학생 데이터가 없으면 빈 배열로 초기화
    const studentsToRender = students && Array.isArray(students) ? students : [];
    
    // 등원 서비스를 이용하는 학생 필터링
    const arrivalStudents = studentsToRender.filter(student => 
      student && student.hasArrivalInfo && !student.isArrivalNoVehicle
    );
    
    // 하원 서비스를 이용하는 학생 필터링
    const departureStudents = studentsToRender.filter(student => 
      student && student.hasDepartureInfo && !student.isDepartureNoVehicle
    );
    
    return (
      <Box sx={{ mb: 4 }} key={classTime}>
        <SectionHeader>
          <DirectionsBusIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="medium">
            {classTime} 수업 (차량 이용: {studentsToRender.filter(student => 
              student && ((student.hasArrivalInfo && !student.isArrivalNoVehicle) || 
              (student.hasDepartureInfo && !student.isDepartureNoVehicle))
            ).length}명)
          </Typography>
        </SectionHeader>
        
        {isSmallScreen || isMediumScreen ? (
          // 모바일 버전
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
              
              {arrivalStudents.map((student) => (
                <MobileStudentCard key={`arrival-${student.id}`}>
                  <InfoSection>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {classTime} 수업
                    </Typography>
                  </InfoSection>
                  <Box sx={{ p: 1.5, backgroundColor: 'rgba(227, 242, 253, 0.3)' }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          등원시간
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {student.arrivalTime || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <Typography variant="body2" color="text.secondary">
                          등원위치
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {student.arrivalLocationText}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <StatusToggleButton 
                          status={arrivalStatus && student.id ? (arrivalStatus[student.id] || false) : false}
                          onChange={() => toggleArrivalStatus && student.id ? toggleArrivalStatus(student.id) : null}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </MobileStudentCard>
              ))}
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
              
              {departureStudents.map((student) => (
                <MobileStudentCard key={`departure-${student.id}`}>
                  <InfoSection>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {classTime} 수업
                    </Typography>
                  </InfoSection>
                  <Box sx={{ p: 1.5, backgroundColor: 'rgba(252, 228, 236, 0.2)' }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          하원시간
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {student.departureTime || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <Typography variant="body2" color="text.secondary">
                          하원위치
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {student.departureLocationText}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <StatusToggleButton 
                          status={departureStatus && student.id ? (departureStatus[student.id] || false) : false}
                          onChange={() => toggleDepartureStatus && student.id ? toggleDepartureStatus(student.id) : null}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </MobileStudentCard>
              ))}
              {departureStudents.length === 0 && (
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    하원 서비스를 이용하는 학생이 없습니다.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        ) : (
          // 데스크톱 버전
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
                        <StyledHeaderCell isArrival={true} width="65px" align="left">학생</StyledHeaderCell>
                        <StyledHeaderCell isArrival={true} width="60px" align="center">등원시간</StyledHeaderCell>
                        <StyledHeaderCell isArrival={true} width="150px" align="left">등원위치</StyledHeaderCell>
                        <StyledHeaderCell isArrival={true} width="80px" align="center">등원확인</StyledHeaderCell>
                        <StyledHeaderCell isArrival={true} width="50px" align="center">수정</StyledHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {arrivalStudents.map((student) => (
                        <ClickableRow 
                          key={`arrival-${student.id}`} 
                          hover
                        >
                          <StyledTableCell isArrival={true}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight="medium">
                                {student.name}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell isArrival={true} align="center">
                            {student.arrivalTime || '-'}
                          </StyledTableCell>
                          <StyledTableCell isArrival={true}>
                            {student.arrivalLocationText}
                          </StyledTableCell>
                          <StyledTableCell isArrival={true} align="center">
                            <StatusToggleButton 
                              status={arrivalStatus && student.id ? (arrivalStatus[student.id] || false) : false}
                              onChange={() => toggleArrivalStatus && student.id ? toggleArrivalStatus(student.id) : null}
                              size="small"
                            />
                          </StyledTableCell>
                          <StyledTableCell isArrival={true} align="center">
                            <Button
                              size="small"
                              variant="text"
                              color="primary"
                            >
                              수정
                            </Button>
                          </StyledTableCell>
                        </ClickableRow>
                      ))}
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
                        <StyledHeaderCell isArrival={false} width="65px" align="left">학생</StyledHeaderCell>
                        <StyledHeaderCell isArrival={false} width="60px" align="center">하원시간</StyledHeaderCell>
                        <StyledHeaderCell isArrival={false} width="150px" align="left">하원위치</StyledHeaderCell>
                        <StyledHeaderCell isArrival={false} width="80px" align="center">하원확인</StyledHeaderCell>
                        <StyledHeaderCell isArrival={false} width="50px" align="center">수정</StyledHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departureStudents.map((student) => (
                        <ClickableRow 
                          key={`departure-${student.id}`} 
                          hover
                        >
                          <StyledTableCell isArrival={false}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight="medium">
                                {student.name}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell isArrival={false} align="center">
                            {student.departureTime || '-'}
                          </StyledTableCell>
                          <StyledTableCell isArrival={false}>
                            {student.departureLocationText}
                          </StyledTableCell>
                          <StyledTableCell isArrival={false} align="center">
                            <StatusToggleButton 
                              status={departureStatus && student.id ? (departureStatus[student.id] || false) : false}
                              onChange={() => toggleDepartureStatus && student.id ? toggleDepartureStatus(student.id) : null}
                              size="small"
                            />
                          </StyledTableCell>
                          <StyledTableCell isArrival={false} align="center">
                            <Button
                              size="small"
                              variant="text"
                              color="primary"
                            >
                              수정
                            </Button>
                          </StyledTableCell>
                        </ClickableRow>
                      ))}
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
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button 
          component={Link} 
          to="/" 
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          돌아가기
        </Button>
        <Typography variant="h5" component="h1">
          새로운 레이아웃 테스트
        </Typography>
      </Box>
      
      {/* 테스트 페이지 데이터 표시 */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          API 테스트 데이터
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {testData && (
          <Box>
            <Typography variant="h5" gutterBottom>
              {testData.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {testData.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {testData.sections && testData.sections.map((section) => (
              <Box key={section.id} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {section.title}
                </Typography>
                <Typography variant="body1">
                  {section.content}
                </Typography>
              </Box>
            ))}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="caption" color="text.secondary">
                마지막 업데이트: {new Date(testData.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
      
      {classTimeList && classTimeList.length > 0 && classTimeList.map(classTime => 
        renderVehicleSection(classTime, classGroups[classTime])
      )}
    </Container>
  );
};

export default TestVehicleLayout; 