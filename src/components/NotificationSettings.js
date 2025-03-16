import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  Slider,
  InputAdornment,
  Alert,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const NotificationSettings = () => {
  // 알림 설정 상태
  const [settings, setSettings] = useState({
    // 등원 알림 설정
    arrivalEnabled: true,
    arrivalTimeBeforeMinutes: 10,
    arrivalMessage: '안녕하세요. [학생이름]님의 등원 차량이 [시간]분 후 도착 예정입니다.',
    
    // 하원 알림 설정
    departureEnabled: true,
    departureTimeBeforeMinutes: 10,
    departureMessage: '안녕하세요. [학생이름]님의 하원 차량이 [시간]분 후 도착 예정입니다.',
    
    // 수업 알림 설정
    classEnabled: true,
    classTimeBeforeMinutes: 60,
    classMessage: '안녕하세요. [학생이름]님의 [수업명] 수업이 [시간]분 후 시작됩니다.',
    
    // 알림 채널 설정
    smsEnabled: true,
    kakaoEnabled: true,
    emailEnabled: false,
    emailAddress: '',
  });

  // 스낵바 상태
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // 설정 변경 핸들러
  const handleSettingChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  // 스위치 변경 핸들러
  const handleSwitchChange = (field) => (event) => {
    handleSettingChange(field, event.target.checked);
  };

  // 슬라이더 변경 핸들러
  const handleSliderChange = (field) => (event, newValue) => {
    handleSettingChange(field, newValue);
  };

  // 텍스트 필드 변경 핸들러
  const handleTextChange = (field) => (event) => {
    handleSettingChange(field, event.target.value);
  };

  // 설정 저장 핸들러
  const handleSaveSettings = () => {
    // 이메일 유효성 검사
    if (settings.emailEnabled && !validateEmail(settings.emailAddress)) {
      setSnackbarMessage('유효한 이메일 주소를 입력해주세요.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // 여기서 실제로는 API 호출을 통해 설정을 저장할 것입니다.
    console.log('저장된 설정:', settings);
    setSnackbarMessage('설정이 성공적으로 저장되었습니다.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // 이메일 유효성 검사 함수
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 스낵바 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          알림 설정
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          학부모에게 발송되는 알림 메시지 설정을 관리할 수 있습니다.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              등원 알림 설정
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.arrivalEnabled}
                    onChange={handleSwitchChange('arrivalEnabled')}
                    color="primary"
                  />
                }
                label="등원 알림 활성화"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                도착 {settings.arrivalTimeBeforeMinutes}분 전에 알림 발송
              </Typography>
              <Slider
                value={settings.arrivalTimeBeforeMinutes}
                onChange={handleSliderChange('arrivalTimeBeforeMinutes')}
                disabled={!settings.arrivalEnabled}
                min={5}
                max={30}
                step={5}
                marks={[
                  { value: 5, label: '5분' },
                  { value: 10, label: '10분' },
                  { value: 15, label: '15분' },
                  { value: 20, label: '20분' },
                  { value: 25, label: '25분' },
                  { value: 30, label: '30분' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                알림 메시지
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={settings.arrivalMessage}
                onChange={handleTextChange('arrivalMessage')}
                disabled={!settings.arrivalEnabled}
                helperText="사용 가능한 변수: [학생이름], [시간]"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              하원 알림 설정
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.departureEnabled}
                    onChange={handleSwitchChange('departureEnabled')}
                    color="primary"
                  />
                }
                label="하원 알림 활성화"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                도착 {settings.departureTimeBeforeMinutes}분 전에 알림 발송
              </Typography>
              <Slider
                value={settings.departureTimeBeforeMinutes}
                onChange={handleSliderChange('departureTimeBeforeMinutes')}
                disabled={!settings.departureEnabled}
                min={5}
                max={30}
                step={5}
                marks={[
                  { value: 5, label: '5분' },
                  { value: 10, label: '10분' },
                  { value: 15, label: '15분' },
                  { value: 20, label: '20분' },
                  { value: 25, label: '25분' },
                  { value: 30, label: '30분' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                알림 메시지
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={settings.departureMessage}
                onChange={handleTextChange('departureMessage')}
                disabled={!settings.departureEnabled}
                helperText="사용 가능한 변수: [학생이름], [시간]"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              수업 알림 설정
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.classEnabled}
                    onChange={handleSwitchChange('classEnabled')}
                    color="primary"
                  />
                }
                label="수업 알림 활성화"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                수업 시작 {settings.classTimeBeforeMinutes}분 전에 알림 발송
              </Typography>
              <Slider
                value={settings.classTimeBeforeMinutes}
                onChange={handleSliderChange('classTimeBeforeMinutes')}
                disabled={!settings.classEnabled}
                min={30}
                max={120}
                step={15}
                marks={[
                  { value: 30, label: '30분' },
                  { value: 60, label: '1시간' },
                  { value: 90, label: '1.5시간' },
                  { value: 120, label: '2시간' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                알림 메시지
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={settings.classMessage}
                onChange={handleTextChange('classMessage')}
                disabled={!settings.classEnabled}
                helperText="사용 가능한 변수: [학생이름], [수업명], [시간]"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              알림 채널 설정
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsEnabled}
                    onChange={handleSwitchChange('smsEnabled')}
                    color="primary"
                  />
                }
                label="SMS 알림"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.kakaoEnabled}
                    onChange={handleSwitchChange('kakaoEnabled')}
                    color="primary"
                  />
                }
                label="카카오톡 알림"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailEnabled}
                    onChange={handleSwitchChange('emailEnabled')}
                    color="primary"
                  />
                }
                label="이메일 알림"
              />
              {settings.emailEnabled && (
                <TextField
                  fullWidth
                  margin="normal"
                  label="이메일 주소"
                  value={settings.emailAddress}
                  onChange={handleTextChange('emailAddress')}
                  error={settings.emailEnabled && !validateEmail(settings.emailAddress)}
                  helperText={settings.emailEnabled && !validateEmail(settings.emailAddress) ? '유효한 이메일 주소를 입력해주세요.' : ''}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              size="large"
            >
              설정 저장
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationSettings; 