import React from 'react';
import { Box, Typography, Paper, Container, Grid, Card, CardContent } from '@mui/material';

const ParentDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          학부모 페이지
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          학부모를 위한 정보와 기능을 제공하는 페이지입니다.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              학생 정보
            </Typography>
            <Typography variant="body1" paragraph>
              자녀의 수업 일정, 등하원 정보 등을 확인할 수 있습니다.
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">
                  수업 일정
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  월, 수, 금 16:30 발레 수업
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1">
                  등하원 정보
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  등원: 15:50 / 하원: 17:30
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              알림 설정
            </Typography>
            <Typography variant="body1" paragraph>
              등하원 알림, 수업 알림 등의 설정을 관리할 수 있습니다.
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1">
                  등하원 알림
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  차량 도착 10분 전 SMS 알림 설정됨
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1">
                  수업 알림
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  수업 시작 1시간 전 알림 설정됨
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              최근 알림
            </Typography>
            <Typography variant="body1" paragraph>
              최근에 받은 알림 내역을 확인할 수 있습니다.
            </Typography>
            <Grid container spacing={2}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} key={item}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body1">
                        {item === 1 ? '하원 차량이 5분 후 도착 예정입니다.' : 
                         item === 2 ? '오늘 수업이 1시간 후 시작됩니다.' : 
                         '내일 수업 일정 안내: 16:30 발레 수업'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ParentDashboard; 