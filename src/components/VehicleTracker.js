import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import SimpleMapView from './SimpleMapView';
import { Link } from 'react-router-dom';

const VehicleTracker = () => {
  const [vehicleLocations, setVehicleLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 차량 위치 데이터 가져오기
  const fetchVehicleLocations = async () => {
    try {
      setLoading(true);
      
      // 서버에서 모든 차량 위치 데이터 가져오기
      const response = await fetch('/api/vehicles/locations');
      
      if (!response.ok) {
        throw new Error('차량 위치 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setVehicleLocations(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('차량 위치 데이터 가져오기 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchVehicleLocations();
    
    // 30초마다 자동 업데이트
    const interval = setInterval(fetchVehicleLocations, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        차량 위치 추적
      </Typography>
      
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchVehicleLocations}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : '새로고침'}
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          component="a"
          href="/driver"
          target="_blank"
          rel="noopener noreferrer"
        >
          운전자 앱으로 이동
        </Button>
        
        {lastUpdate && (
          <Typography variant="body2" color="textSecondary">
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
          </Typography>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          오류: {error}
        </Alert>
      )}
      
      <SimpleMapView vehicleLocations={vehicleLocations} />
      
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          차량 정보
        </Typography>
        
        {Object.keys(vehicleLocations).length > 0 ? (
          <Paper sx={{ p: 2 }}>
            {Object.entries(vehicleLocations).map(([vehicleId, location]) => (
              <Box key={vehicleId} mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  차량 ID: {vehicleId}
                </Typography>
                <Typography variant="body2">
                  위도: {location.latitude}, 경도: {location.longitude}
                </Typography>
                <Typography variant="body2">
                  마지막 업데이트: {new Date(location.timestamp).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        ) : (
          <Alert severity="info">
            차량 위치 데이터가 없습니다.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default VehicleTracker; 