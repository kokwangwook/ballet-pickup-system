import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert, TextField, Switch, FormControlLabel } from '@mui/material';

const DriverApp = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [vehicleId, setVehicleId] = useState('vehicle1');
  const [updateInterval, setUpdateInterval] = useState(10); // 초 단위
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  // 위치 정보 권한 상태 확인
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(status => {
          setPermissionStatus(status.state);
          status.onchange = () => {
            setPermissionStatus(status.state);
          };
        });
    }
  }, []);

  // 위치 정보 가져오기
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        setLocation(locationData);
        setLastUpdateTime(new Date().toLocaleTimeString());
        setLoading(false);

        if (vehicleId) {
          sendLocationToServer(locationData);
        } else {
          setError('차량 ID를 입력해주세요.');
        }
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('위치 정보 접근 권한이 거부되었습니다.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('위치 정보를 사용할 수 없습니다.');
            break;
          case error.TIMEOUT:
            setError('위치 정보 요청 시간이 초과되었습니다.');
            break;
          default:
            setError('알 수 없는 오류가 발생했습니다.');
            break;
        }
      },
      { enableHighAccuracy: true }
    );
  };

  // 위치 정보 서버로 전송
  const sendLocationToServer = async (locationData) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        throw new Error('서버에 위치 정보 전송 실패');
      }

      setLastUpdateTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('위치 정보 전송 오류:', err);
      setError(`위치 정보 전송 실패: ${err.message}`);
    }
  };

  // 자동 업데이트 시작
  const startAutoUpdate = () => {
    if (watchIdRef.current) return;

    if (navigator.geolocation) {
      try {
        // 위치 모니터링
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            };
            setLocation(newLocation);
          },
          (err) => {
            // 보안 오류 처리
            if (err.code === 1) {
              setError('위치 정보 권한이 거부되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.');
            } else if (err.code === 2) {
              setError('위치 정보를 가져올 수 없습니다. GPS 신호가 약하거나 없습니다.');
            } else if (err.code === 3) {
              setError('위치 정보 요청 시간이 초과되었습니다.');
            } else {
              setError(`위치 정보 오류: ${err.message}`);
              
              // 보안 오류 (Only secure origins are allowed) 처리
              if (err.message.includes('Only secure origins are allowed')) {
                setError('보안 연결(HTTPS)에서만 위치 정보를 사용할 수 있습니다. HTTPS로 접속해주세요.');
              }
            }
            stopAutoUpdate();
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );

        // 서버로 주기적으로 전송
        intervalRef.current = setInterval(() => {
          if (location) {
            sendLocationToServer({
              ...location,
              timestamp: new Date().toISOString()
            });
          }
        }, updateInterval * 1000);
      } catch (e) {
        setError(`위치 정보 모니터링 중 오류가 발생했습니다: ${e.message}`);
        stopAutoUpdate();
      }
    } else {
      setError('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    }
  };

  // 자동 업데이트 중지
  const stopAutoUpdate = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 자동 업데이트 토글
  const handleAutoUpdateToggle = (event) => {
    const isChecked = event.target.checked;
    setAutoUpdate(isChecked);

    if (isChecked) {
      startAutoUpdate();
    } else {
      stopAutoUpdate();
    }
  };

  // 업데이트 간격 변경
  const handleIntervalChange = (event) => {
    const newInterval = parseInt(event.target.value, 10);
    if (newInterval > 0) {
      setUpdateInterval(newInterval);
      
      // 자동 업데이트 중이면 재시작
      if (autoUpdate) {
        stopAutoUpdate();
        startAutoUpdate();
      }
    }
  };

  // 위치 정보 권한 요청 함수
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionStatus('granted');
          // 권한이 허용되면 위치 정보 가져오기
          getLocation();
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionStatus('denied');
            setError('위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
          }
        }
      );
    }
  };

  // 컴포넌트 언마운트 시 자동 업데이트 중지
  useEffect(() => {
    return () => {
      stopAutoUpdate();
    };
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        운전자 앱
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          차량 위치 전송
        </Typography>

        <Box mb={2}>
          <TextField
            label="차량 ID"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>

        <Box mb={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoUpdate}
                onChange={handleAutoUpdateToggle}
                color="primary"
              />
            }
            label="자동 위치 업데이트"
          />
        </Box>

        {autoUpdate && (
          <Box mb={2}>
            <TextField
              label="업데이트 간격 (초)"
              type="number"
              value={updateInterval}
              onChange={handleIntervalChange}
              inputProps={{ min: 1 }}
              fullWidth
              margin="normal"
            />
          </Box>
        )}

        <Box mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={getLocation}
            disabled={loading || permissionStatus === 'denied'}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : '현재 위치 전송'}
          </Button>
        </Box>

        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {location && (
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              현재 위치:
            </Typography>
            <Typography>위도: {location.latitude}</Typography>
            <Typography>경도: {location.longitude}</Typography>
            <Typography>정확도: {location.accuracy}m</Typography>
            {lastUpdateTime && (
              <Typography>마지막 업데이트: {lastUpdateTime}</Typography>
            )}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          사용 방법
        </Typography>
        <Typography paragraph>
          1. 차량 ID를 입력합니다 (기본값: vehicle1).
        </Typography>
        <Typography paragraph>
          2. "자동 위치 업데이트"를 켜면 설정한 간격으로 위치가 자동 전송됩니다.
        </Typography>
        <Typography paragraph>
          3. 수동으로 위치를 전송하려면 "현재 위치 전송" 버튼을 클릭합니다.
        </Typography>
        <Typography paragraph>
          4. 위치 정보 권한을 요청하면 "허용"을 선택해주세요.
        </Typography>
        <Typography paragraph>
          5. 이 앱은 백그라운드에서도 실행되어야 하므로, 화면을 켜둔 상태로 유지해주세요.
        </Typography>
      </Paper>

      {/* 위치 정보 권한 상태 및 요청 버튼 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          위치 정보 권한 상태: {
            permissionStatus === 'granted' ? '허용됨' :
            permissionStatus === 'denied' ? '거부됨' : '미결정'
          }
        </Typography>
        
        {permissionStatus !== 'granted' && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={requestLocationPermission}
            sx={{ mt: 1 }}
          >
            위치 정보 접근 허용하기
          </Button>
        )}
        
        {permissionStatus === 'denied' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            위치 정보 접근이 거부되었습니다. 브라우저 설정에서 권한을 허용하거나, 주소창의 자물쇠 아이콘을 클릭하여 권한을 변경해주세요.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default DriverApp; 