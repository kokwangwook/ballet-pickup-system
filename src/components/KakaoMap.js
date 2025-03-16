import React, { useEffect, useRef } from 'react';

const KakaoMap = ({ vehicles, stations }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // 나주역신도시 좌표 (기본값)
  const defaultCenter = { 
    lat: 35.0175, 
    lng: 126.7873 
  };

  useEffect(() => {
    const loadMap = () => {
      if (window.kakao && window.kakao.maps) {
        initializeMap();
      } else {
        console.error('Kakao Maps API가 로드되지 않았습니다.');
      }
    };

    loadMap();
    
    return () => {
      // 컴포넌트 언마운트 시 마커 정리
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  }, [vehicles, stations]);

  const initializeMap = () => {
    const mapContainer = mapRef.current;
    const mapOption = {
      center: new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
      level: 5
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOption);
    mapInstanceRef.current = map;

    // 지도 컨트롤 추가
    const zoomControl = new window.kakao.maps.ZoomControl();
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

    // 초기 마커 생성
    updateMarkers();
  };

  const updateMarkers = () => {
    // 기존 마커 제거
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }

    // 차량 마커 추가
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach(vehicle => {
        if (vehicle.latitude && vehicle.longitude) {
          const markerPosition = new window.kakao.maps.LatLng(vehicle.latitude, vehicle.longitude);
          
          const markerImage = new window.kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
            new window.kakao.maps.Size(35, 35)
          );
          
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            map: mapInstanceRef.current,
            title: vehicle.name || '차량',
            image: markerImage
          });

          // 정보창 생성
          const infoContent = `
            <div style="padding:10px;width:200px;">
              <h4 style="margin-top:0;">${vehicle.name || '차량'}</h4>
              <p>상태: ${vehicle.status || '운행 중'}</p>
              <p>최근 업데이트: ${new Date(vehicle.timestamp).toLocaleString()}</p>
            </div>
          `;
          
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: infoContent
          });
          
          // 마커 클릭 시 정보창 표시
          window.kakao.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(mapInstanceRef.current, marker);
          });
          
          markersRef.current.push(marker);
        }
      });
    }

    // 정류장 마커 추가
    if (stations && stations.length > 0) {
      stations.forEach(station => {
        if (station.latitude && station.longitude) {
          const markerPosition = new window.kakao.maps.LatLng(station.latitude, station.longitude);
          
          const markerImage = new window.kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
            new window.kakao.maps.Size(35, 35)
          );
          
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            map: mapInstanceRef.current,
            title: station.name || '정류장',
            image: markerImage
          });
          
          // 정보창 생성
          const infoContent = `
            <div style="padding:10px;width:200px;">
              <h4 style="margin-top:0;">${station.name || '정류장'}</h4>
              <p>주소: ${station.address || '정보 없음'}</p>
            </div>
          `;
          
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: infoContent
          });
          
          // 마커 클릭 시 정보창 표시
          window.kakao.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(mapInstanceRef.current, marker);
          });
          
          markersRef.current.push(marker);
        }
      });
    }

    // 마커가 없는 경우 기본 위치로 지도 중심 설정
    if (markersRef.current.length === 0) {
      mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng));
    }
    // 마커가 있는 경우 모든 마커가 보이도록 지도 범위 조정
    else if (markersRef.current.length > 1) {
      const bounds = new window.kakao.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      mapInstanceRef.current.setBounds(bounds);
    }
    // 마커가 하나만 있는 경우 해당 마커 위치로 중심 이동
    else if (markersRef.current.length === 1) {
      mapInstanceRef.current.setCenter(markersRef.current[0].getPosition());
    }
  };

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '500px', 
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
      }}
    ></div>
  );
};

export default KakaoMap; 