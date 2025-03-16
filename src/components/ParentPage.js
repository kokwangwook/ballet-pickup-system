import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePickup } from '../contexts/PickupContext';

const ParentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();
  const { students, arrivalStatus, departureStatus } = usePickup();

  useEffect(() => {
    const checkAuth = () => {
      const userRole = localStorage.getItem('userRole');
      const phoneNumber = localStorage.getItem('phoneNumber');

      if (!userRole || !phoneNumber) {
        navigate('/login');
        return;
      }

      if (userRole !== 'parent') {
        navigate('/login');
        return;
      }

      // 학생 정보 찾기
      const foundStudent = students.find(student => 
        student.parentPhone && student.parentPhone.endsWith(phoneNumber)
      );

      if (!foundStudent) {
        setError('등록된 학생 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      setStudentInfo(foundStudent);
      setLoading(false);
    };

    checkAuth();
  }, [navigate, students]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('phoneNumber');
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          로그아웃
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            {studentInfo.name} 학생 정보
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              오늘의 등/하원 현황
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
              <Typography color={arrivalStatus[studentInfo.id] ? 'success.main' : 'text.secondary'}>
                등원: {arrivalStatus[studentInfo.id] ? '완료' : '대기중'}
              </Typography>
              <Typography color={departureStatus[studentInfo.id] ? 'success.main' : 'text.secondary'}>
                하원: {departureStatus[studentInfo.id] ? '완료' : '대기중'}
              </Typography>
            </Paper>

            <Typography variant="subtitle1" gutterBottom>
              수업 정보
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography>
                수업 시간: {studentInfo.classTime || '정보 없음'}
              </Typography>
              <Typography>
                등원 시간: {studentInfo.arrivalTime || '정보 없음'}
              </Typography>
              <Typography>
                하원 시간: {studentInfo.departureTime || '정보 없음'}
              </Typography>
            </Paper>
          </Box>
        </Paper>

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogout}
          color="primary"
        >
          로그아웃
        </Button>
      </Box>
    </Container>
  );
};

export default ParentPage; 