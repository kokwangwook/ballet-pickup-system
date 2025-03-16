const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 데이터 파일 경로
const vehicleLocationsFile = path.join(__dirname, '../../data/vehicle-locations.json');
const studentsFile = path.join(__dirname, '../../data/students.json');

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

// 학생 데이터 읽기
const getStudents = () => {
  try {
    if (fs.existsSync(studentsFile)) {
      const data = fs.readFileSync(studentsFile, 'utf8');
      return JSON.parse(data);
    }
    // 기본 학생 데이터 (파일이 없는 경우)
    return {
      students: [
        {
          id: "student1",
          name: "김학생",
          shortNumber: "001",
          isActive: true,
          classTimes: {
            "월": "15:30",
            "수": "16:30",
            "금": "17:30"
          },
          schedule: {
            "1": { classTime: "15:30" },
            "3": { classTime: "16:30" },
            "5": { classTime: "17:30" }
          },
          contactInfo: {
            motherPhone: "010-1234-5678",
            fatherPhone: "010-8765-4321"
          },
          locations: {
            arrival: "location_1",
            departure: "location_2"
          }
        },
        {
          id: "student2",
          name: "이발레",
          shortNumber: "002",
          isActive: true,
          classTimes: {
            "화": "15:30",
            "목": "16:30"
          },
          schedule: {
            "2": { classTime: "15:30" },
            "4": { classTime: "16:30" }
          },
          contactInfo: {
            motherPhone: "010-2345-6789"
          },
          locations: {
            arrival: "location_3",
            departure: "location_3"
          }
        }
      ]
    };
  } catch (error) {
    console.error('학생 데이터 읽기 오류:', error);
    return { students: [] };
  }
};

// 학생 데이터 저장
const saveStudents = (studentsData) => {
  try {
    // data 디렉토리가 없으면 생성
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(studentsFile, JSON.stringify(studentsData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('학생 데이터 저장 오류:', error);
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

// 학생 목록 조회 API
app.get('/api/students', (req, res) => {
  try {
    const studentsData = getStudents();
    return res.status(200).json(studentsData.students);
  } catch (error) {
    console.error('학생 목록 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 학생 추가 API
app.post('/api/students', (req, res) => {
  try {
    const newStudent = req.body;
    
    if (!newStudent.name || !newStudent.shortNumber) {
      return res.status(400).json({ error: '이름과 단축번호는 필수입니다.' });
    }
    
    const studentsData = getStudents();
    
    // ID 생성 (현재 시간 기반)
    newStudent.id = `student_${Date.now()}`;
    
    // 학생 추가
    studentsData.students.push(newStudent);
    
    if (saveStudents(studentsData)) {
      return res.status(201).json(newStudent);
    } else {
      return res.status(500).json({ error: '학생 데이터 저장 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('학생 추가 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 학생 수정 API
app.put('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudent = req.body;
    
    const studentsData = getStudents();
    const studentIndex = studentsData.students.findIndex(student => student.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }
    
    // ID는 변경하지 않음
    updatedStudent.id = id;
    
    // 학생 정보 업데이트
    studentsData.students[studentIndex] = updatedStudent;
    
    if (saveStudents(studentsData)) {
      return res.status(200).json(updatedStudent);
    } else {
      return res.status(500).json({ error: '학생 데이터 저장 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('학생 수정 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 학생 삭제 API
app.delete('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const studentsData = getStudents();
    const studentIndex = studentsData.students.findIndex(student => student.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }
    
    // 학생 삭제
    studentsData.students.splice(studentIndex, 1);
    
    if (saveStudents(studentsData)) {
      return res.status(200).json({ success: true, message: '학생이 삭제되었습니다.' });
    } else {
      return res.status(500).json({ error: '학생 데이터 저장 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('학생 삭제 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 수업 정보 API
app.get('/api/class-info', (req, res) => {
  try {
    // 수업 시간 정보
    const classInfo = {
      "15:30": {
        startTime: "15:30",
        endTime: "16:20"
      },
      "16:30": {
        startTime: "16:30",
        endTime: "17:20"
      },
      "17:30": {
        startTime: "17:30",
        endTime: "18:20"
      },
      "18:30": {
        startTime: "18:30",
        endTime: "19:20"
      }
    };
    
    // 수업 시간 목록
    const classTimes = ["15:30", "16:30", "17:30", "18:30"];
    
    return res.status(200).json({
      classInfo,
      classTimes,
      totalClassHours: classTimes.length
    });
  } catch (error) {
    console.error('수업 정보 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 기본 경로
app.get('/api', (req, res) => {
  res.json({ message: 'API 서버가 실행 중입니다.' });
});

// 서버리스 함수로 Express 앱 래핑
module.exports.handler = serverless(app); 