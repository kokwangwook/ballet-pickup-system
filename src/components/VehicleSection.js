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
  TableRow
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
const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#f7f7f7',
  color: theme.palette.text.primary,
  fontSize: '0.8rem',
  padding: '8px 10px',
  borderBottom: '1px solid #e0e0e0',
  fontWeight: 'regular',
}));

// 테이블 데이터 셀 스타일
const StyledTableCell = styled(TableCell)(({ theme, highlight }) => ({
  fontSize: '0.8rem',
  padding: '8px 10px',
  borderBottom: '1px solid #f0f0f0',
  fontWeight: 'regular',
  backgroundColor: highlight ? '#f5f5f5' : 'inherit',
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { 
    classInfo, 
    studentLocations, 
    calculateTimes,
    arrivalStatus,
    departureStatus,
    toggleArrivalStatus,
    toggleDepartureStatus 
  } = usePickup();
  
  // 수업 정보
  const classData = classInfo[classTime] || { locations: {}, startTime: '', endTime: '' };
  
  // 등하원 시간 계산
  const { arrivalTime: classArrivalTime } = calculateTimes(classTime);
  
  // 테이블 데이터 준비
  const prepareStudentData = (student) => {
    const { arrivalTime, departureTime } = calculateTimes(classTime);
    const arrivalLocation = studentLocations[student.id]?.arrival;
    const departureLocation = studentLocations[student.id]?.departure;
    
    return {
      arrivalTime,
      departureTime,
      arrivalLocation,
      departureLocation,
      arrivalLocationText: arrivalLocation 
        ? classData.locations[arrivalLocation] || '위치 정보 없음'
        : '차량탑승안함',
      departureLocationText: departureLocation 
        ? classData.locations[departureLocation] || '위치 정보 없음'
        : '차량탑승안함'
    };
  };
  
  // 학생 행 클릭 이벤트 핸들러
  const handleStudentClick = (student) => {
    if (onStudentSelect) {
      onStudentSelect(student);
    }
  };
  
  // PC 버전 테이블 렌더링
  const renderDesktopTable = () => (
    <TableContainer component={Paper} elevation={0} sx={{ mb: 4, border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: 0 }}>
      <Table size="small" aria-label="차량 운행 정보">
        <TableHead>
          <TableRow>
            <StyledHeaderCell align="left">이름 (단축번호)</StyledHeaderCell>
            <StyledHeaderCell align="center">등원 시간</StyledHeaderCell>
            <StyledHeaderCell align="left">등원 위치</StyledHeaderCell>
            <StyledHeaderCell align="center">등원 상태</StyledHeaderCell>
            <StyledHeaderCell align="center">하원 시간</StyledHeaderCell>
            <StyledHeaderCell align="left">하원 위치</StyledHeaderCell>
            <StyledHeaderCell align="center">하원 상태</StyledHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classStudents.map((student) => {
            const { 
              arrivalTime, 
              departureTime, 
              arrivalLocation,
              departureLocation,
              arrivalLocationText,
              departureLocationText
            } = prepareStudentData(student);
            
            return (
              <TableRow 
                key={student.id} 
                hover
                onClick={() => handleStudentClick(student)}
                sx={{ cursor: 'pointer' }}
              >
                <StyledTableCell align="left">
                  {student.name} ({student.shortId})
                  {student.registrationType && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      {student.registrationType}
                      {student.waitingNumber ? ` (대기: ${student.waitingNumber})` : ''}
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {arrivalTime}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {arrivalLocationText}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <StatusToggleButton 
                    status={arrivalStatus[student.id] || false} 
                    onClick={() => toggleArrivalStatus(student.id)}
                    disabled={!arrivalLocation}
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  {departureTime}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {departureLocationText}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <StatusToggleButton 
                    status={departureStatus[student.id] || false} 
                    onClick={() => toggleDepartureStatus(student.id)}
                    disabled={!departureLocation}
                  />
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
      {classStudents.map((student) => {
        const { 
          arrivalTime, 
          departureTime, 
          arrivalLocation,
          departureLocation,
          arrivalLocationText,
          departureLocationText
        } = prepareStudentData(student);
        
        return (
          <Card 
            key={student.id} 
            elevation={0} 
            sx={{ 
              mb: 2, 
              border: '1px solid #e0e0e0',
              cursor: 'pointer'
            }}
            onClick={() => handleStudentClick(student)}
          >
            <InfoSection>
              <Typography variant="subtitle2">
                {student.name} ({student.shortId})
                {student.registrationType && (
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                    {student.registrationType}
                    {student.waitingNumber ? ` (대기: ${student.waitingNumber})` : ''}
                  </Typography>
                )}
              </Typography>
            </InfoSection>
            
            <Divider />
            
            <Box sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>등원 정보</Typography>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="body2">시간:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{arrivalTime}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">위치:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {arrivalLocationText}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">상태:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <StatusToggleButton 
                    status={arrivalStatus[student.id] || false} 
                    onClick={() => toggleArrivalStatus(student.id)}
                    disabled={!arrivalLocation}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>하원 정보</Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="body2">시간:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{departureTime}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">위치:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {departureLocationText}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">상태:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <StatusToggleButton 
                    status={departureStatus[student.id] || false} 
                    onClick={() => toggleDepartureStatus(student.id)}
                    disabled={!departureLocation}
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
  
  return (
    <Box sx={{ mb: 3 }}>
      <SectionHeader elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DirectionsBusIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            {classTime} 수업 (등원 {classArrivalTime}) ({classStudents.length}명)
          </Typography>
        </Box>
      </SectionHeader>
      
      {isMobile ? renderMobileCards() : renderDesktopTable()}
    </Box>
  );
};

export default VehicleSection; 