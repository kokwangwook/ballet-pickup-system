import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // 입력값이 4자리 숫자인지 확인
    if (!/^\d{4}$/.test(phoneNumber)) {
      setError('휴대폰 번호 뒤 4자리를 입력해주세요.');
      return;
    }

    // 관리자 로그인 (1111)
    if (phoneNumber === '1111') {
      localStorage.setItem('userRole', 'admin');
      navigate('/admin');
      return;
    }

    // 학부모 로그인
    // TODO: Firestore에서 해당 번호와 매칭되는 학생 확인
    localStorage.setItem('userRole', 'parent');
    localStorage.setItem('phoneNumber', phoneNumber);
    navigate('/parent');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            발레 픽업 시스템
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            휴대폰 번호 뒤 4자리를 입력해주세요
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="휴대폰 번호 뒤 4자리"
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            type="password"
            inputProps={{ maxLength: 4 }}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            size="large"
          >
            로그인
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 