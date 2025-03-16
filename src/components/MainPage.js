import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Paper
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const MainPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          발레 픽업 시스템
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          학생 관리 및 차량 위치 추적을 위한 통합 시스템
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* 학생 목록 카드 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  학생 목록
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                등록된 모든 학생들의 목록을 확인하고 관리합니다.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/students" 
                variant="contained" 
                color="primary" 
                fullWidth
              >
                학생 목록 보기
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 학생 등록 카드 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonAddIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  학생 등록
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                새로운 학생을 시스템에 등록합니다.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/add-student" 
                variant="contained" 
                color="primary" 
                fullWidth
              >
                학생 등록하기
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 학생 검색 카드 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <SearchIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  학생 검색
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                이름, 학급, 또는 다른 정보로 학생을 검색합니다.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/search" 
                variant="contained" 
                color="primary" 
                fullWidth
              >
                학생 검색하기
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 차량 레이아웃 테스트 카드 */}
        <Grid item xs={12} sm={6} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <DirectionsCarIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  차량 레이아웃
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                차량 내 학생 배치를 테스트하고 시각화합니다.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/test-vehicle" 
                variant="contained" 
                color="primary" 
                fullWidth
              >
                차량 레이아웃 테스트
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 차량 위치 추적 카드 */}
        <Grid item xs={12} sm={6} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, border: '2px solid #1976d2' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOnIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  차량 위치 추적
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                실시간으로 차량의 위치를 지도에서 추적합니다.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/vehicle-tracker" 
                variant="contained" 
                color="primary" 
                fullWidth
              >
                차량 위치 확인하기
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainPage; 