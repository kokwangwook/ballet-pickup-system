import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';

const SimpleMapView = ({ vehicleLocations = {} }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // 나주 혁신도시 호수공원 좌표
  const center = { 
    lat: 35.0175, 
    lng: 126.7873 
  };

  // 카카오맵 API 로드 확인
  useEffect(() => {
    const checkKakaoMapLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        console.log('카카오맵 API가 로드되었습니다.');
        setMapReady(true);
        return true;
      }
      return false;
    };

    // 이미 로드되어 있는지 확인
    if (checkKakaoMapLoaded()) return;

    // 아직 로드되지 않았다면 이벤트 리스너 등록
    const handleLoad = () => {
      if (checkKakaoMapLoaded()) {
        // 이벤트 리스너 제거
        window.removeEventListener('load', handleLoad);
      }
    };

    window.addEventListener('load', handleLoad);

    // 일정 시간 후에도 로드되지 않으면 타임아웃 처리
    const timeoutId = setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        console.error('카카오맵 API 로드 타임아웃');
        setError('카카오맵 API를 불러오는데 실패했습니다. 페이지를 새로고침 해보세요.');
        setLoading(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(timeoutId);
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapReady) return;
    
    const initializeMap = () => {
      try {
        console.log('지도 초기화 시작...');
        
        // DOM이 완전히 렌더링되었는지 확인
        if (!mapContainer.current) {
          console.error('지도 컨테이너가 아직 렌더링되지 않았습니다.');
          return false;
        }
        
        // 지도 생성
        const options = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: 3
        };
        
        const mapInstance = new window.kakao.maps.Map(mapContainer.current, options);
        map.current = mapInstance;
        
        // 기본 마커 생성 (중심점)
        const markerPosition = new window.kakao.maps.LatLng(center.lat, center.lng);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          map: mapInstance
        });
        
        console.log('지도 초기화 완료');
        setLoading(false);
        return true;
      } catch (err) {
        console.error('지도 초기화 오류:', err);
        setError(`지도 초기화 중 오류가 발생했습니다: ${err.message}`);
        setLoading(false);
        return false;
      }
    };

    // 여러 번 시도하는 함수
    const attemptInitialization = (attempts = 0, maxAttempts = 3) => {
      if (attempts >= maxAttempts) {
        setError('지도를 초기화하는데 여러 번 실패했습니다. 페이지를 새로고침 해보세요.');
        setLoading(false);
        return;
      }

      // 지연 시간을 점진적으로 늘림
      const delay = 1000 + (attempts * 500);
      
      setTimeout(() => {
        if (!initializeMap()) {
          console.log(`지도 초기화 ${attempts + 1}번째 시도 실패, 재시도 중...`);
          attemptInitialization(attempts + 1, maxAttempts);
        }
      }, delay);
    };

    attemptInitialization();

    return () => {
      // 정리 작업
    };
  }, [mapReady, center.lat, center.lng]);

  // 차량 위치 업데이트
  useEffect(() => {
    if (!map.current || loading || error) return;

    try {
      // 기존 마커 제거
      Object.values(markers.current).forEach(marker => {
        marker.setMap(null);
      });
      markers.current = {};

      // 차량 위치 데이터가 있는 경우 마커 생성
      if (Object.keys(vehicleLocations).length > 0) {
        Object.entries(vehicleLocations).forEach(([vehicleId, location]) => {
          if (location && location.latitude && location.longitude) {
            const position = new window.kakao.maps.LatLng(
              location.latitude,
              location.longitude
            );
            
            // 마커 생성
            const marker = new window.kakao.maps.Marker({
              position: position,
              map: map.current
            });
            
            // 인포윈도우 생성
            const infoContent = `
              <div style="padding:5px;width:150px;text-align:center;">
                <b>차량 ID: ${vehicleId}</b><br>
                ${new Date(location.timestamp).toLocaleTimeString()}
              </div>
            `;
            
            const infoWindow = new window.kakao.maps.InfoWindow({
              content: infoContent
            });
            
            // 마커 클릭 시 인포윈도우 표시
            window.kakao.maps.event.addListener(marker, 'click', function() {
              infoWindow.open(map.current, marker);
            });
            
            // 마커 저장
            markers.current[vehicleId] = marker;
          }
        });
        
        // 모든 마커가 보이도록 지도 범위 재설정
        if (Object.keys(markers.current).length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds();
          Object.values(markers.current).forEach(marker => {
            bounds.extend(marker.getPosition());
          });
          map.current.setBounds(bounds);
        }
      }
    } catch (err) {
      console.error('차량 마커 업데이트 오류:', err);
    }
  }, [vehicleLocations, loading, error]);

  // 페이지 새로고침
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Paper sx={{ p: 2, height: '500px', width: '100%', position: 'relative' }}>
      {loading ? (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            지도를 불러오는 중...
          </Typography>
        </Box>
      ) : error ? (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleRefresh} sx={{ mt: 2 }}>
            페이지 새로고침
          </Button>
        </Box>
      ) : (
        <div 
          ref={mapContainer} 
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </Paper>
  );
};

export default SimpleMapView; 