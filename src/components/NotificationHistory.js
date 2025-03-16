import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Pagination
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ko } from 'date-fns/locale';
import SearchIcon from '@mui/icons-material/Search';

const NotificationHistory = () => {
  // 샘플 알림 데이터
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: '등원', 
      recipient: '김학부모', 
      studentName: '김학생', 
      content: '안녕하세요. 김학생님의 등원 차량이 5분 후 도착 예정입니다.', 
      sentAt: new Date(2023, 5, 15, 14, 30), 
      status: '성공' 
    },
    { 
      id: 2, 
      type: '하원', 
      recipient: '이학부모', 
      studentName: '이학생', 
      content: '안녕하세요. 이학생님의 하원 차량이 10분 후 도착 예정입니다.', 
      sentAt: new Date(2023, 5, 15, 17, 45), 
      status: '성공' 
    },
    { 
      id: 3, 
      type: '수업', 
      recipient: '박학부모', 
      studentName: '박학생', 
      content: '안녕하세요. 박학생님의 발레 수업이 1시간 후 시작됩니다.', 
      sentAt: new Date(2023, 5, 16, 15, 30), 
      status: '성공' 
    },
    { 
      id: 4, 
      type: '등원', 
      recipient: '최학부모', 
      studentName: '최학생', 
      content: '안녕하세요. 최학생님의 등원 차량이 5분 후 도착 예정입니다.', 
      sentAt: new Date(2023, 5, 16, 14, 25), 
      status: '실패' 
    },
    { 
      id: 5, 
      type: '하원', 
      recipient: '정학부모', 
      studentName: '정학생', 
      content: '안녕하세요. 정학생님의 하원 차량이 10분 후 도착 예정입니다.', 
      sentAt: new Date(2023, 5, 17, 17, 40), 
      status: '성공' 
    },
  ]);

  // 필터 상태
  const [filters, setFilters] = useState({
    type: '',
    studentName: '',
    startDate: null,
    endDate: null,
    status: ''
  });

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // 필터 변경 핸들러
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
    setPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilters({
      type: '',
      studentName: '',
      startDate: null,
      endDate: null,
      status: ''
    });
    setPage(1);
  };

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter(notification => {
    // 알림 유형 필터
    if (filters.type && notification.type !== filters.type) return false;
    
    // 학생 이름 필터
    if (filters.studentName && !notification.studentName.includes(filters.studentName)) return false;
    
    // 시작 날짜 필터
    if (filters.startDate && notification.sentAt < filters.startDate) return false;
    
    // 종료 날짜 필터
    if (filters.endDate) {
      const endDateWithTime = new Date(filters.endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (notification.sentAt > endDateWithTime) return false;
    }
    
    // 상태 필터
    if (filters.status && notification.status !== filters.status) return false;
    
    return true;
  });

  // 페이지네이션된 알림 목록
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // 페이지 변경 핸들러
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          알림 이력
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          학부모에게 발송된 알림 메시지 이력을 조회할 수 있습니다.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          필터
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>알림 유형</InputLabel>
              <Select
                value={filters.type}
                label="알림 유형"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="등원">등원</MenuItem>
                <MenuItem value="하원">하원</MenuItem>
                <MenuItem value="수업">수업</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="학생 이름"
              value={filters.studentName}
              onChange={(e) => handleFilterChange('studentName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DatePicker
                label="시작 날짜"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DatePicker
                label="종료 날짜"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>상태</InputLabel>
              <Select
                value={filters.status}
                label="상태"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="성공">성공</MenuItem>
                <MenuItem value="실패">실패</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SearchIcon />}
              fullWidth
            >
              검색
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={handleResetFilters}
            >
              필터 초기화
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            알림 목록
          </Typography>
          <Typography variant="body2" color="text.secondary">
            총 {filteredNotifications.length}개의 알림
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>번호</TableCell>
                <TableCell>유형</TableCell>
                <TableCell>수신자</TableCell>
                <TableCell>학생</TableCell>
                <TableCell>내용</TableCell>
                <TableCell>발송 시간</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedNotifications.map((notification, index) => (
                <TableRow key={notification.id}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Chip 
                      label={notification.type} 
                      color={
                        notification.type === '등원' ? 'primary' : 
                        notification.type === '하원' ? 'secondary' : 
                        'info'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{notification.recipient}</TableCell>
                  <TableCell>{notification.studentName}</TableCell>
                  <TableCell>{notification.content}</TableCell>
                  <TableCell>
                    {notification.sentAt.toLocaleDateString()} {notification.sentAt.toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={notification.status} 
                      color={notification.status === '성공' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))}
              {paginatedNotifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      조회된 알림이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(filteredNotifications.length / rowsPerPage)} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default NotificationHistory; 