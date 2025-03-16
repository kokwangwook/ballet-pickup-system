import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';

const MapView = ({ vehicleLocations }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [vehicleMarkers, setVehicleMarkers] = useState({});
  const [stationMarkers, setStationMarkers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 나주 혁신도시 호수공원 좌표
  const LAKE_PARK_CENTER = {
    latitude: 35.0175,
    longitude: 126.7873
  };

  // 정류장 데이터 가져오기
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        if (!response.ok) {
          throw new Error('정류장 데이터를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setStations(data);
      } catch (err) {
        console.error('정류장 데이터 가져오기 오류:', err);
        setError(err.message);
      }
    };

    fetchStations();
  }, []);

  // 지도 초기화
  useEffect(() => {
    // 이미 초기화된 경우 중복 실행 방지
    if (map) return;

    // 카카오맵 SDK 로드 확인
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK가 로드되지 않았습니다.');
      setError('카카오맵 SDK를 불러오는데 실패했습니다. 페이지를 새로고침 해보세요.');
      setLoading(false);
      return;
    }

    // 지도 초기화 함수
    const initializeMap = () => {
      try {
        // 지도 옵션 설정
        const options = {
          center: new window.kakao.maps.LatLng(LAKE_PARK_CENTER.latitude, LAKE_PARK_CENTER.longitude),
          level: 3 // 지도 확대 레벨
        };

        // 지도 객체 생성
        const kakaoMap = new window.kakao.maps.Map(mapContainerRef.current, options);
        
        // 지도 확대/축소 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        kakaoMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
        
        // 지도 타입 컨트롤 추가 (일반 지도, 스카이뷰 전환)
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        kakaoMap.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
        
        // 호수공원 표시
        const lakeParkPosition = new window.kakao.maps.LatLng(LAKE_PARK_CENTER.latitude, LAKE_PARK_CENTER.longitude);
        const lakeParkMarker = new window.kakao.maps.Marker({
          map: kakaoMap,
          position: lakeParkPosition,
          title: '나주 혁신도시 호수공원'
        });
        
        // 호수공원 인포윈도우
        const lakeParkInfoContent = `<div style="padding:5px;width:150px;text-align:center;">
          <b>나주 혁신도시 호수공원</b>
        </div>`;
        
        const lakeParkInfoWindow = new window.kakao.maps.InfoWindow({
          content: lakeParkInfoContent
        });
        
        // 마커 클릭 시 인포윈도우 표시
        window.kakao.maps.event.addListener(lakeParkMarker, 'click', function() {
          lakeParkInfoWindow.open(kakaoMap, lakeParkMarker);
        });
        
        // 지도 객체 저장
        setMap(kakaoMap);
        setLoading(false);
        console.log('카카오맵이 성공적으로 초기화되었습니다.');
      } catch (err) {
        console.error('카카오맵 초기화 오류:', err);
        setError(`카카오맵 초기화 중 오류가 발생했습니다: ${err.message}`);
        setLoading(false);
      }
    };

    // 약간의 지연 후 지도 초기화 시작 (DOM이 완전히 렌더링될 시간을 줌)
    const timer = setTimeout(() => {
      if (mapContainerRef.current) {
        initializeMap();
      }
    }, 500);

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearTimeout(timer);
    };
  }, [map]);

  // 정류장 마커 표시
  useEffect(() => {
    if (!map || !stations.length) return;

    // 기존 정류장 마커 제거
    stationMarkers.forEach(marker => marker.setMap(null));
    
    // 새 정류장 마커 생성
    const newStationMarkers = stations.map(station => {
      const position = new window.kakao.maps.LatLng(station.latitude, station.longitude);
      
      // 정류장 마커 이미지 설정
      const imageSize = new window.kakao.maps.Size(24, 35);
      const markerImage = new window.kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
        imageSize
      );
      
      // 정류장 마커 생성
      const marker = new window.kakao.maps.Marker({
        map: map,
        position: position,
        title: station.name,
        image: markerImage
      });
      
      // 정류장 인포윈도우 생성
      const infoContent = `<div style="padding:5px;width:150px;text-align:center;">
        <b>${station.name}</b><br>
        순서: ${station.order}번째 정류장<br>
        반경: ${station.radius}m
      </div>`;
      
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: infoContent
      });
      
      // 마커 클릭 시 인포윈도우 표시
      window.kakao.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(map, marker);
      });
      
      // 정류장 반경 원 표시
      const circle = new window.kakao.maps.Circle({
        map: map,
        center: position,
        radius: station.radius,
        strokeWeight: 2,
        strokeColor: '#FF00FF',
        strokeOpacity: 0.8,
        strokeStyle: 'dashed',
        fillColor: '#FF00FF',
        fillOpacity: 0.2
      });
      
      return marker;
    });
    
    setStationMarkers(newStationMarkers);
  }, [map, stations]);

  // 차량 위치 마커 업데이트
  useEffect(() => {
    if (!map || !vehicleLocations) return;

    // 기존 마커 객체 복사
    const updatedMarkers = { ...vehicleMarkers };

    // 각 차량 위치에 마커 생성 또는 업데이트
    Object.keys(vehicleLocations).forEach(vehicleId => {
      const location = vehicleLocations[vehicleId];
      
      if (location && location.latitude && location.longitude) {
        const position = new window.kakao.maps.LatLng(location.latitude, location.longitude);
        
        if (updatedMarkers[vehicleId]) {
          // 기존 마커 위치 업데이트
          updatedMarkers[vehicleId].setPosition(position);
        } else {
          // 차량 마커 이미지 설정
          const imageSize = new window.kakao.maps.Size(42, 26);
          const markerImage = new window.kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/roadview_minimap_wk_2018.png',
            imageSize
          );
          
          // 새 마커 생성
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: position,
            title: `차량 ${vehicleId}`,
            image: markerImage
          });
          
          // 인포윈도우 생성
          const infoContent = `<div style="padding:5px;width:150px;text-align:center;">
            <b>차량 ${vehicleId}</b><br>
            업데이트: ${new Date(location.timestamp).toLocaleTimeString()}
          </div>`;
          
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: infoContent
          });
          
          // 마커 클릭 시 인포윈도우 표시
          window.kakao.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(map, marker);
          });
          
          updatedMarkers[vehicleId] = marker;
        }
      }
    });
    
    setVehicleMarkers(updatedMarkers);
  }, [map, vehicleLocations]);

  // 페이지 새로고침
  const handleRefresh = () => {
    window.location.reload();
  };

  // 호수공원으로 이동 버튼 핸들러
  const handleMoveToLakePark = () => {
    if (map) {
      const lakeParkPosition = new window.kakao.maps.LatLng(
        LAKE_PARK_CENTER.latitude, 
        LAKE_PARK_CENTER.longitude
      );
      map.setCenter(lakeParkPosition);
      map.setLevel(3); // 적절한 줌 레벨로 설정
    }
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
        <>
          <div 
            id="map-container"
            ref={mapContainerRef} 
            style={{ width: '100%', height: '100%' }}
          ></div>
          <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              onClick={handleMoveToLakePark}
              sx={{ mr: 1 }}
            >
              호수공원으로 이동
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              size="small" 
              onClick={handleRefresh}
            >
              새로고침
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MapView; 