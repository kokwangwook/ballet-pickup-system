// 로컬 JSON 파일을 사용하는 서버

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors());
app.use(express.json());

// 정적 파일 제공 (빌드된 React 앱)
app.use(express.static(path.join(__dirname, 'build')));

// 파일 경로 설정
const STUDENTS_FILE_PATH = path.join(__dirname, 'src/data/students.json');
const CLASS_INFO_FILE_PATH = path.join(__dirname, 'src/data/class-info.json');

// 로그 헬퍼 함수
function logServerInfo() {
  console.log('파일 시스템 기반 API 서버 시작');
  console.log(`학생 데이터 파일 경로: ${STUDENTS_FILE_PATH}`);
  console.log(`수업 정보 파일 경로: ${CLASS_INFO_FILE_PATH}`);
}

// 서버 시작 시 유효하지 않은 학생 데이터 정리
function cleanupInvalidStudentData() {
  try {
    // 학생 데이터 파일 읽기
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    
    // 필수 항목(name, classTime)이 있는 학생만 필터링
    const validStudents = studentsData.filter(student => {
      const hasName = student.name && student.name.trim() !== '';
      const hasClassTime = student.classTime && student.classTime.trim() !== '';
      
      if (!hasName || !hasClassTime) {
        console.log(`유효하지 않은 학생 데이터 삭제: ${JSON.stringify(student)}`);
        return false;
      }
      return true;
    });
    
    // 변경된 학생 수가 있으면 파일에 저장
    if (validStudents.length !== studentsData.length) {
      console.log(`총 ${studentsData.length - validStudents.length}개의 유효하지 않은 학생 데이터가 삭제되었습니다.`);
      fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(validStudents, null, 2), 'utf8');
    } else {
      console.log('모든 학생 데이터가 유효합니다.');
    }
  } catch (error) {
    console.error('학생 데이터 정리 중 오류가 발생했습니다:', error);
  }
}

// 서버 시작 시 초기화 함수 호출
logServerInfo();
cleanupInvalidStudentData();

// 학생 목록 가져오기
app.get('/api/students', (req, res) => {
  try {
    console.log('학생 데이터 요청 수신됨');
    
    // JSON 파일에서 학생 데이터 읽기
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    
    console.log('JSON A 응답 결과:', {
      총_결과_수: studentsData.length,
      첫_학생_이름: studentsData.length > 0 ? studentsData[0].name : '결과 없음'
    });
    
    // 활성화된 학생만 필터링
    const activeStudents = studentsData.filter(student => student.isActive);
    
    console.log('전체 학생 수:', studentsData.length);
    console.log('활성화된 학생 수:', activeStudents.length);
    
    res.json(studentsData);
  } catch (error) {
    console.error('JSON 파일 읽기 오류:', error);
    res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 수업 정보 가져오기
app.get('/api/class-info', (req, res) => {
  try {
    // JSON 파일에서 수업 정보 읽기
    const classInfo = JSON.parse(fs.readFileSync(CLASS_INFO_FILE_PATH, 'utf8'));
    
    console.log('수업 정보 응답 결과:', {
      총_수업_시간_수: Object.keys(classInfo).length,
      수업_시간_목록: Object.keys(classInfo)
    });
    
    res.json(classInfo);
  } catch (error) {
    console.error('JSON 파일 읽기 오류:', error);
    res.status(500).json({ error: '수업 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 상태 업데이트
app.post('/api/update-status', (req, res) => {
  const { pageId, property, status } = req.body;
  
  try {
    // 기존 학생 데이터 읽기
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    
    // 해당 학생 찾기
    const studentIndex = studentsData.findIndex(student => student.id === pageId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }
    
    // 상태 업데이트
    if (property === '등원 상태') {
      studentsData[studentIndex].arrivalStatus = status;
    } else if (property === '하원 상태') {
      studentsData[studentIndex].departureStatus = status;
    }
    
    // 파일에 저장
    fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(studentsData, null, 2), 'utf8');
    
    console.log(`학생 ${studentsData[studentIndex].name}의 ${property} 상태가 ${status}로 업데이트되었습니다.`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('상태 업데이트 오류:', error);
    res.status(500).json({ error: '상태를 업데이트하는 중 오류가 발생했습니다.' });
  }
});

// API 통합 라우트
app.get('/api/notion', (req, res) => {
  try {
    console.log('통합 API 요청 수신됨');
    
    // JSON 파일에서 학생 데이터 읽기
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    
    // Notion API 응답 형식으로 변환
    const response = {
      object: "list",
      results: studentsData.map(student => ({
        id: student.id,
        properties: {
          Name: {
            title: [{ plain_text: student.name }]
          },
          ClassTime: {
            rich_text: [{ plain_text: student.classTime || student.classes[0] }]
          },
          ShortId: {
            number: student.shortId
          }
        }
      })),
      has_more: false
    };
    
    res.json(response);
  } catch (error) {
    console.error('API 응답 생성 오류:', error);
    res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 학생 등록
app.post('/api/students', (req, res) => {
  try {
    const newStudent = req.body;
    
    // 필수 필드 검증
    if (!newStudent.name || !newStudent.classTime) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다. (이름, 수업시간)' });
    }
    
    // 기존 학생 데이터 읽기
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    
    // 새 ID 생성 (마지막 ID + 1 또는 랜덤)
    const newId = `student-${studentsData.length + 1}`;
    
    // shortId 생성 (1-99 사이의 랜덤 숫자)
    const existingShortIds = studentsData.map(student => student.shortId);
    let newShortId;
    do {
      newShortId = Math.floor(Math.random() * 99) + 1;
    } while (existingShortIds.includes(newShortId));
    
    // 새 학생 객체 생성
    const studentToAdd = {
      id: newId,
      name: newStudent.name,
      shortId: newStudent.shortId || newShortId,
      classTime: newStudent.classTime,
      classes: [newStudent.classTime],
      arrivalLocation: newStudent.arrivalLocation || '',
      departureLocation: newStudent.departureLocation || '',
      arrivalStatus: false,
      departureStatus: false,
      isActive: newStudent.isActive !== undefined ? newStudent.isActive : true,
      motherPhone: newStudent.motherPhone || '',
      fatherPhone: newStudent.fatherPhone || '',
      studentPhone: newStudent.studentPhone || '',
      otherPhone: newStudent.otherPhone || '',
      classDays: newStudent.classDays || [],
      registrationDate: newStudent.registrationDate || null
    };
    
    // 학생 추가
    studentsData.push(studentToAdd);
    
    // 파일에 저장
    fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(studentsData, null, 2), 'utf8');
    
    console.log(`새 학생 ${studentToAdd.name}이(가) 등록되었습니다.`);
    
    res.status(201).json(studentToAdd);
  } catch (error) {
    console.error('학생 등록 오류:', error);
    res.status(500).json({ error: '학생을 등록하는 중 오류가 발생했습니다.' });
  }
});

// 학생 정보 수정
app.put('/api/students/:id', (req, res) => {
  try {
    const studentId = req.params.id;
    const updatedInfo = req.body;
    
    // 기존 학생 데이터 읽기
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    
    // 해당 학생 찾기
    const studentIndex = studentsData.findIndex(student => student.id === studentId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }
    
    // 수정할 수 없는 필드 제외
    delete updatedInfo.id;
    delete updatedInfo.shortId;
    
    // 정보 업데이트
    const updatedStudent = {
      ...studentsData[studentIndex],
      ...updatedInfo,
      // classTime 변경 시 classes 배열도 업데이트
      classes: updatedInfo.classTime ? [updatedInfo.classTime] : studentsData[studentIndex].classes
    };
    
    studentsData[studentIndex] = updatedStudent;
    
    // 파일에 저장
    fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(studentsData, null, 2), 'utf8');
    
    console.log(`학생 ${updatedStudent.name}의 정보가 업데이트되었습니다.`);
    
    res.json(updatedStudent);
  } catch (error) {
    console.error('학생 정보 수정 오류:', error);
    res.status(500).json({ error: '학생 정보를 수정하는 중 오류가 발생했습니다.' });
  }
});

// React 앱의 모든 요청을 index.html로 라우팅
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
