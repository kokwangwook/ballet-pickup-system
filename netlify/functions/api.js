const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 차량 위치 데이터 파일 경로
const vehicleLocationsFile = path.join(__dirname, '../../data/vehicle-locations.json');

// 차량 위치 데이터 읽기
const getVehicleLocations = () => {
  try {
    if (fs.existsSync(vehicleLocationsFile)) {
      const data = fs.readFileSync(vehicleLocationsFile, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('차량 위치 데이터 읽기 오류:', error);
    return {};
  }
};

// 차량 위치 데이터 저장
const saveVehicleLocations = (locations) => {
  try {
    // data 디렉토리가 없으면 생성
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(vehicleLocationsFile, JSON.stringify(locations, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('차량 위치 데이터 저장 오류:', error);
    return false;
  }
};

// 차량 위치 업데이트 API
app.post('/api/vehicles/:vehicleId/location', (req, res) => {
  const { vehicleId } = req.params;
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: '위도와 경도가 필요합니다.' });
  }

  try {
    const locations = getVehicleLocations();
    
    locations[vehicleId] = {
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    };

    if (saveVehicleLocations(locations)) {
      return res.status(200).json({ success: true, message: '위치가 업데이트되었습니다.' });
    } else {
      return res.status(500).json({ error: '위치 데이터 저장 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('위치 업데이트 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 차량 위치 조회 API
app.get('/api/vehicles/:vehicleId/location', (req, res) => {
  const { vehicleId } = req.params;
  
  try {
    const locations = getVehicleLocations();
    
    if (locations[vehicleId]) {
      return res.status(200).json(locations[vehicleId]);
    } else {
      return res.status(404).json({ error: '차량 위치 정보를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('위치 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 모든 차량 위치 조회 API
app.get('/api/vehicles/locations', (req, res) => {
  try {
    const locations = getVehicleLocations();
    return res.status(200).json(locations);
  } catch (error) {
    console.error('모든 위치 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 기본 경로
app.get('/api', (req, res) => {
  res.json({ message: 'API 서버가 실행 중입니다.' });
});

// 서버리스 함수로 Express 앱 래핑
module.exports.handler = serverless(app); 