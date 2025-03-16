import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  TextField,
  Alert,
  Grid,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BugReportIcon from '@mui/icons-material/BugReport';

// 테스트용 위치 데이터
const TEST_LOCATIONS = [
  {
    name: '나주 혁신도시 호수공원',
    data: {
      latitude: 35.0175,
      longitude: 126.7873,
      accuracy: 10,
      timestamp: new Date().toISOString()
    }
  },
  {
    name: '나주 시내',
    data: {
      latitude: 35.0159,
      longitude: 126.7192,
      accuracy: 10,
      timestamp: new Date().toISOString()
    }
  },
  {
    name: '광주 송정역',
    data: {
      latitude: 35.1396,
      longitude: 126.7953,
      accuracy: 10,
      timestamp: new Date().toISOString()
    }
  }
];

const DriverApp = () => {
  const [vehicleId, setVehicleId] = useState('');
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 컴포넌트 언마운트 시 위치 추적 중지
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('브라우저가 위치 정보를 지원하지 않습니다.');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        setLocation(newLocation);
        setLoading(false);
        setSuccess('현재 위치를 성공적으로 가져왔습니다.');
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => setSuccess(null), 3000);
      },
      (err) => {
        console.error('위치 정보 가져오기 오류:', err);
        setError(`위치 정보를 가져오는데 실패했습니다: ${err.message}`);
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  // 위치 추적 시작/중지
  const toggleTracking = () => {
    if (isTracking) {
      // 추적 중지
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsTracking(false);
      setSuccess('위치 추적이 중지되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      // 추적 시작
      if (!navigator.geolocation) {
        setError('브라우저가 위치 정보를 지원하지 않습니다.');
        return;
      }
      
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          setLocation(newLocation);
          setLastUpdate(new Date());
          
          // 차량 ID가 입력된 경우 자동으로 서버에 위치 전송
          if (vehicleId) {
            sendLocationToServer(vehicleId, newLocation);
          }
        },
        (err) => {
          console.error('위치 추적 오류:', err);
          setError(`위치 추적 중 오류가 발생했습니다: ${err.message}`);
          setIsTracking(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
      
      setWatchId(id);
      setIsTracking(true);
      setSuccess('위치 추적이 시작되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // 위치 정보 서버에 전송
  const sendLocationToServer = async (id, locationData) => {
    if (!id || !locationData) {
      setError('차량 ID와 위치 정보가 필요합니다.');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/vehicles/update-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: id,
          location: locationData
        }),
      });
      
      if (!response.ok) {
        throw new Error('서버에 위치 정보를 전송하는데 실패했습니다.');
      }
      
      setSuccess('위치 정보가 성공적으로 서버에 전송되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('위치 정보 전송 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 수동으로 위치 정보 전송
  const handleSendLocation = () => {
    if (!vehicleId) {
      setError('차량 ID를 입력해주세요.');
      return;
    }
    
    if (!location) {
      setError('위치 정보가 없습니다. 먼저 위치를 가져와주세요.');
      return;
    }
    
    sendLocationToServer(vehicleId, location);
  };

  // 테스트 위치 전송
  const sendTestLocation = (testLocation) => {
    if (!vehicleId) {
      setError('차량 ID를 입력해주세요.');
      return;
    }
    
    // 타임스탬프 업데이트
    const locationWithCurrentTime = {
      ...testLocation,
      timestamp: new Date().toISOString()
    };
    
    setLocation(locationWithCurrentTime);
    sendLocationToServer(vehicleId, locationWithCurrentTime);
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <DirectionsCarIcon fontSize="large" sx={{ mr: 1 }} />
          운전자 앱
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          차량 위치 정보를 실시간으로 전송하는 앱입니다. 차량 ID를 입력하고 위치 추적을 시작하세요.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              차량 정보
            </Typography>
            
            <TextField
              label="차량 ID"
              variant="outlined"
              fullWidth
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              margin="normal"
              helperText="차량 식별을 위한 고유 ID를 입력하세요"
            />
            
            <Box mt={2}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<MyLocationIcon />}
                onClick={getCurrentLocation}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                현재 위치 가져오기
              </Button>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={isTracking}
                    onChange={toggleTracking}
                    color="primary"
                  />
                }
                label="실시간 위치 추적"
              />
            </Box>
            
            <Box mt={2}>
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<SendIcon />}
                onClick={handleSendLocation}
                disabled={loading || !location || !vehicleId}
                fullWidth
              >
                위치 정보 전송
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Box mt={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BugReportIcon fontSize="small" sx={{ mr: 1 }} />
                테스트 위치 전송
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                테스트를 위해 미리 정의된 위치 정보를 전송할 수 있습니다.
              </Typography>
              
              <Grid container spacing={2} mt={1}>
                {TEST_LOCATIONS.map((loc, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Button
                      variant="outlined"
                      color="info"
                      fullWidth
                      onClick={() => sendTestLocation(loc.data)}
                      disabled={!vehicleId || loading}
                    >
                      {loc.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              현재 위치 정보
            </Typography>
            
            {loading && (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            {location ? (
              <Box>
                <Typography variant="body1">
                  <strong>위도:</strong> {location.latitude}
                </Typography>
                <Typography variant="body1">
                  <strong>경도:</strong> {location.longitude}
                </Typography>
                <Typography variant="body1">
                  <strong>정확도:</strong> {location.accuracy} 미터
                </Typography>
                <Typography variant="body1">
                  <strong>시간:</strong> {new Date(location.timestamp).toLocaleString()}
                </Typography>
                
                {isTracking && lastUpdate && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            ) : (
              <Alert severity="info">
                위치 정보가 없습니다. '현재 위치 가져오기' 버튼을 클릭하세요.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverApp; 