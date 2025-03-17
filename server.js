// 로컬 JSON 파일을 사용하는 서버

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Client } = require('@notionhq/client');
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Firebase Admin SDK 추가
const admin = require('firebase-admin');

// Firebase 초기화 여부 추적
let firebaseInitialized = false;
// Firestore 데이터베이스 참조
let db;

// 서비스 계정 키 파일 경로 설정
let serviceAccount = {};
try {
  // 환경 변수에 JSON 문자열로 설정된 경우
  if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Firebase 서비스 계정을 환경 변수에서 로드했습니다.');
  } else {
    try {
      // 파일에서 로드 시도
      const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        // 파일 내용 읽기
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        
        // 내용이 비어있지 않은지 확인
        if (fileContent && fileContent.trim() !== '') {
          serviceAccount = JSON.parse(fileContent);
          console.log('Firebase 서비스 계정을 파일에서 로드했습니다.');
        } else {
          console.log('Firebase 서비스 계정 키 파일이 비어 있습니다.');
          // 빈 파일이면 개발용 서비스 계정 생성
          serviceAccount = createDevelopmentServiceAccount();
        }
      } else {
        console.log('Firebase 서비스 계정 키 파일이 존재하지 않습니다.');
        // 파일이 없으면 개발용 서비스 계정 생성
        serviceAccount = createDevelopmentServiceAccount();
      }
    } catch (fileError) {
      console.error('Firebase 서비스 계정 파일 읽기 오류:', fileError);
      serviceAccount = createDevelopmentServiceAccount();
    }
  }
  
  // Firebase 초기화 시도
  try {
    // 개발 환경 감지
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (isDevelopment && process.env.FIREBASE_EMULATOR === 'true') {
      // 에뮬레이터 설정 (선택적)
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      console.log('Firebase 에뮬레이터 모드로 실행 중입니다.');
    }
    
    // serviceAccount가 유효한지 검사
    if (serviceAccount && serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      console.log('Firebase Admin이 성공적으로 초기화되었습니다.');
    } else {
      console.log('유효한 서비스 계정 객체가 없습니다. Firebase 초기화를 건너뜁니다.');
    }
  } catch (initError) {
    console.error('Firebase 초기화 오류:', initError);
    console.log('Firebase Admin이 초기화되지 않았습니다. 로컬 JSON 파일을 사용합니다.');
  }
} catch (error) {
  console.error('Firebase 서비스 계정 로드 오류:', error);
  console.log('Firebase 서비스 계정 키 파일이 없거나 형식이 잘못되었습니다. 로컬 JSON 파일을 사용합니다.');
}

// 개발용 서비스 계정 생성 함수
function createDevelopmentServiceAccount() {
  console.log('개발용 Firebase 서비스 계정을 생성합니다.');
  return {
    "type": "service_account",
    "project_id": "ballet-pickup-dev",
    "private_key_id": "dev-key-" + Math.random().toString(36).substring(2, 15),
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-dev@ballet-pickup-dev.iam.gserviceaccount.com",
    "client_id": "dev-client-id-" + Date.now(),
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dev%40ballet-pickup-dev.iam.gserviceaccount.com"
  };
}

// Firestore 참조 생성 (초기화 성공 시에만)
db = firebaseInitialized ? admin.firestore() : null;

const app = express();
const PORT = process.env.PORT || 5000;

// Notion API 설정
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Notion 클라이언트 초기화
let notion = null;
if (NOTION_API_KEY) {
  notion = new Client({ auth: NOTION_API_KEY });
  console.log('Notion API 클라이언트가 초기화되었습니다.');
} else {
  console.warn('Notion API 키가 설정되지 않았습니다. Notion 기능은 사용할 수 없습니다.');
}

// Twilio 설정
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio 클라이언트가 초기화되었습니다.');
  } catch (error) {
    console.error('Twilio 클라이언트 초기화 오류:', error);
    console.log('SMS 기능은 사용할 수 없습니다.');
  }
} else {
  console.warn('Twilio 계정 정보가 설정되지 않았습니다. SMS 기능은 사용할 수 없습니다.');
}

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'https://ballet-pickup-system.netlify.app', 'https://ballet-pickup-system-zgdt.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Vercel 환경 감지
const isVercel = process.env.VERCEL === '1';

// 정적 파일 제공 (빌드된 React 앱)
app.use(express.static(path.join(__dirname, 'build')));

// 파일 경로 설정
const STUDENTS_FILE_PATH = path.join(__dirname, 'src/data/students.json');
const CLASS_INFO_FILE_PATH = path.join(__dirname, 'src/data/class-info.json');

// 정류장 정보 파일 경로
const STATIONS_FILE = './data/stations.json';

// 차량 정보 파일 경로
const VEHICLES_FILE = './data/vehicles.json';

// 메시지 템플릿 파일 경로
const MESSAGE_TEMPLATES_FILE = './data/message-templates.json';

// 알림 발송 이력 파일 경로
const NOTIFICATION_HISTORY_FILE = './data/notification-history.json';

// 알림 설정 파일 경로
const NOTIFICATION_SETTINGS_FILE = './data/notification-settings.json';

// 로그 헬퍼 함수
function logServerInfo() {
  console.log('서버 시작');
  console.log(`Notion API 사용 가능: ${!!notion}`);
  console.log(`Notion 데이터베이스 ID 설정됨: ${!!NOTION_DATABASE_ID}`);
  
  // 로컬 개발 환경에서만 파일 경로 표시
  if (process.env.NODE_ENV !== 'production') {
    console.log(`학생 데이터 파일 경로: ${STUDENTS_FILE_PATH}`);
    console.log(`수업 정보 파일 경로: ${CLASS_INFO_FILE_PATH}`);
  }
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

// 로컬 파일에서 학생 데이터 읽기
function readStudentsFromFile() {
  console.log("로컬 파일에서 학생 데이터를 읽습니다.");
  
  try {
    const studentsData = fs.readFileSync(STUDENTS_FILE_PATH, 'utf8');
    return JSON.parse(studentsData);
  } catch (fileError) {
    console.error("학생 데이터 파일 읽기 오류:", fileError);
    return [];
  }
}

// 서버 시작 시 초기화 함수 호출
logServerInfo();
cleanupInvalidStudentData();

// 시간 형식 표준화 함수 추가
function normalizeClassTime(time) {
  if (!time) return time;
  
  // 시간 형식 표준화
  if (time === '16:40') return '16:30';
  if (time === '17:40') return '17:30';
  if (time === '18:40') return '18:30';
  
  return time;
}

// 학생 데이터의 시간 형식 표준화
function normalizeStudentTimes(student) {
  if (!student) return student;
  
  // classTime 필드 표준화
  if (student.classTime) {
    student.classTime = normalizeClassTime(student.classTime);
  }
  
  // classTimes 객체 표준화
  if (student.classTimes && typeof student.classTimes === 'object') {
    Object.keys(student.classTimes).forEach(day => {
      student.classTimes[day] = normalizeClassTime(student.classTimes[day]);
    });
  }
  
  // classes 배열 표준화
  if (student.classes && Array.isArray(student.classes)) {
    student.classes = student.classes.map(time => normalizeClassTime(time));
  }
  
  return student;
}

// API 경로 설정
const setupApiRoutes = () => {
  console.log('API 경로 설정 중...');
  
  // 기본 API 경로
  const apiRouter = express.Router();
  
  // 학생 데이터 가져오기 (GET /api/students)
  apiRouter.get('/students', async (req, res) => {
    try {
      console.log('학생 데이터 요청 받음');
      
      let studentsData;
      
      // Firebase에서 데이터 가져오기 시도
      if (firebaseInitialized && db) {
        console.log('Firebase에서 학생 데이터 가져오기 시도');
        
        try {
          const studentsCollection = db.collection('students');
          const studentsSnapshot = await studentsCollection.get();
          studentsData = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log(`Firebase에서 ${studentsData.length}명의 학생 데이터를 가져왔습니다.`);
        } catch (firebaseError) {
          console.error('Firebase 학생 데이터 접근 오류:', firebaseError);
          console.log('로컬 JSON 파일로 폴백합니다.');
          studentsData = null;
        }
      }
      
      // Firebase에서 가져오기 실패하면 로컬 JSON 파일 사용
      if (!studentsData) {
        console.log('로컬 JSON 파일에서 학생 데이터 읽기 시도');
        
        try {
          // 로컬 파일에서 학생 데이터 읽기
          studentsData = readStudentsFromFile();
          console.log(`로컬 파일에서 ${studentsData.length}명의 학생 데이터를 읽었습니다.`);
        } catch (fileError) {
          console.error('학생 데이터 파일 읽기 실패:', fileError);
          // 파일 읽기 실패 시 빈 배열 반환
          studentsData = [];
        }
      }
      
      res.json(studentsData);
    } catch (error) {
      console.error('학생 데이터 처리 중 오류:', error);
      res.status(500).json({ error: '학생 데이터를 가져오는 중 오류가 발생했습니다.' });
    }
  });
  
  // ... 다른 API 라우트 ...
  
  // API 경로 등록
  if (isVercel) {
    // Vercel 환경에서는 /api 경로로 직접 라우팅
    app.use('/api', apiRouter);
    console.log('Vercel 환경에서 /api 경로 설정됨');
  } else {
    // 그 외 환경에서는 /.netlify/functions/api 경로와 /api 경로 모두 지원
    app.use('/.netlify/functions/api', apiRouter);
    app.use('/api', apiRouter);
    console.log('일반 환경에서 API 경로 설정됨');
  }
};

// API 경로 설정 실행
setupApiRoutes();

// 수업 정보 가져오기
app.get('/api/class-info', (req, res) => {
  try {
    // JSON 파일에서 수업 정보 읽기
    const classInfo = JSON.parse(fs.readFileSync(CLASS_INFO_FILE_PATH, 'utf8'));
    
    // 허용된 시간대만 필터링
    const allowedTimes = ['15:30', '16:30', '17:30', '18:30'];
    const filteredClassInfo = {};
    
    // 허용된 시간대만 포함
    Object.keys(classInfo).forEach(time => {
      if (allowedTimes.includes(time)) {
        filteredClassInfo[time] = classInfo[time];
      }
    });
    
    console.log('수업 정보 응답 결과:', {
      총_수업_시간_수: Object.keys(filteredClassInfo).length,
      수업_시간_목록: Object.keys(filteredClassInfo)
    });
    
    res.json(filteredClassInfo);
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
app.get('/api/notion', async (req, res) => {
  try {
    console.log('Notion API 요청 수신됨');
    
    // Notion API 사용 가능 여부 확인
    if (notion && NOTION_DATABASE_ID) {
      try {
        console.log(`Notion 데이터베이스(${NOTION_DATABASE_ID}) 쿼리 시작`);
        const response = await notion.databases.query({
          database_id: NOTION_DATABASE_ID
        });
        console.log(`Notion API에서 ${response.results.length}개의 결과를 받았습니다.`);
        return res.json(response);
      } catch (notionError) {
        console.error('Notion API 오류:', notionError);
        // Notion API 오류 시 로컬 파일로 폴백
        throw new Error('Notion API 오류로 인해 로컬 데이터로 폴백합니다.');
      }
    }
    
    // Notion API를 사용할 수 없는 경우 로컬 파일 사용 (개발 환경용)
    console.log('로컬 JSON 파일에서 학생 데이터 읽기');
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
    res.status(500).json({ 
      error: '데이터를 가져오는 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// 학생 등록
app.post('/api/students', async (req, res) => {
  try {
    const studentData = req.body;
    
    // Firestore 사용 가능 여부 확인
    if (firebaseInitialized && db) {
      console.log('Firestore에 학생 데이터 추가 시도 중...');
      try {
        const docRef = await db.collection('students').add(studentData);
        const newStudent = await docRef.get();
        
        console.log('Firestore에 학생 데이터가 추가되었습니다:', docRef.id);
        return res.status(201).json({
          id: docRef.id,
          ...newStudent.data()
        });
      } catch (firestoreError) {
        console.error('Firestore 추가 오류:', firestoreError);
        console.log('로컬 JSON 파일로 폴백합니다.');
      }
    }
    
    // Firebase가 초기화되지 않았거나 오류 발생 시 로컬 파일 사용
    console.log('로컬 JSON 파일에 학생 데이터 추가');
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    const newId = Date.now().toString();
    
    const studentToAdd = {
      id: newId,
      ...studentData
    };
    
    studentsData.push(studentToAdd);
    fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(studentsData, null, 2), 'utf8');
    
    console.log(`로컬 파일에 학생 "${studentData.name}" 추가됨`);
    res.status(201).json(studentToAdd);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: error.message });
  }
});

// 학생 정보 수정
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInfo = req.body;
    
    // Firestore 사용 가능 여부 확인
    if (firebaseInitialized && db) {
      console.log('Firestore에서 학생 정보 수정 시도 중...');
      try {
        // 문서 존재 확인
        const studentDoc = await db.collection('students').doc(id).get();
        if (!studentDoc.exists) {
          return res.status(404).json({ error: 'Student not found' });
        }
        
        // 문서 업데이트
        await db.collection('students').doc(id).update(updatedInfo);
        
        // 업데이트된 문서 정보 가져오기
        const updatedStudent = await db.collection('students').doc(id).get();
        
        console.log('Firestore에서 학생 정보가 수정되었습니다:', id);
        return res.json({
          id: updatedStudent.id,
          ...updatedStudent.data()
        });
      } catch (firestoreError) {
        console.error('Firestore 수정 오류:', firestoreError);
        console.log('로컬 JSON 파일로 폴백합니다.');
      }
    }
    
    // Firebase가 초기화되지 않았거나 오류 발생 시 로컬 파일 사용
    console.log('로컬 JSON 파일에서 학생 정보 수정');
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    
    // 해당 학생 찾기
    const studentIndex = studentsData.findIndex(student => student.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }
    
    // 학생 정보 업데이트
    studentsData[studentIndex] = {
      ...studentsData[studentIndex],
      ...updatedInfo
    };
    
    // 파일에 저장
    fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(studentsData, null, 2), 'utf8');
    
    console.log(`로컬 파일에서 학생 "${studentsData[studentIndex].name}" 정보가 수정되었습니다.`);
    res.json(studentsData[studentIndex]);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message });
  }
});

// 학생 삭제 API
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Firestore 사용 가능 여부 확인
    if (firebaseInitialized && db) {
      console.log('Firestore에서 학생 삭제 시도 중...');
      try {
        // 문서 존재 확인
        const studentDoc = await db.collection('students').doc(id).get();
        if (!studentDoc.exists) {
          return res.status(404).json({ error: 'Student not found' });
        }
        
        // 문서 삭제
        await db.collection('students').doc(id).delete();
        
        console.log('Firestore에서 학생이 삭제되었습니다:', id);
        return res.json({ message: 'Student deleted successfully', id });
      } catch (firestoreError) {
        console.error('Firestore 삭제 오류:', firestoreError);
        console.log('로컬 JSON 파일로 폴백합니다.');
      }
    }
    
    // Firebase가 초기화되지 않았거나 오류 발생 시 로컬 파일 사용
    console.log('로컬 JSON 파일에서 학생 삭제');
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    
    // 해당 학생 찾기
    const studentIndex = studentsData.findIndex(student => student.id === id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }
    
    // 학생 정보 삭제
    const deletedStudent = studentsData.splice(studentIndex, 1)[0];
    
    // 파일에 저장
    fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(studentsData, null, 2), 'utf8');
    
    console.log(`로컬 파일에서 학생 "${deletedStudent.name}" 정보가 삭제되었습니다.`);
    res.json({ message: '학생이 성공적으로 삭제되었습니다.', id });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
});

// 정류장 정보 읽기
app.get('/api/stations', (req, res) => {
  try {
    const stationsData = JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
    res.json(stationsData.stations);
  } catch (error) {
    console.error('정류장 정보 읽기 오류:', error);
    res.status(500).json({ error: '정류장 정보를 불러오는데 실패했습니다.' });
  }
});

// 정류장 추가
app.post('/api/stations', (req, res) => {
  try {
    const stationsData = JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
    const newStation = {
      id: `station${stationsData.stations.length + 1}`,
      ...req.body
    };
    stationsData.stations.push(newStation);
    fs.writeFileSync(STATIONS_FILE, JSON.stringify(stationsData, null, 2));
    res.json(newStation);
  } catch (error) {
    console.error('정류장 추가 오류:', error);
    res.status(500).json({ error: '정류장 추가에 실패했습니다.' });
  }
});

// 정류장 수정
app.put('/api/stations/:id', (req, res) => {
  try {
    const stationsData = JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
    const stationIndex = stationsData.stations.findIndex(s => s.id === req.params.id);
    
    if (stationIndex === -1) {
      return res.status(404).json({ error: '정류장을 찾을 수 없습니다.' });
    }
    
    stationsData.stations[stationIndex] = {
      ...stationsData.stations[stationIndex],
      ...req.body
    };
    
    fs.writeFileSync(STATIONS_FILE, JSON.stringify(stationsData, null, 2));
    res.json(stationsData.stations[stationIndex]);
  } catch (error) {
    console.error('정류장 수정 오류:', error);
    res.status(500).json({ error: '정류장 수정에 실패했습니다.' });
  }
});

// 정류장 삭제
app.delete('/api/stations/:id', (req, res) => {
  try {
    const stationsData = JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
    stationsData.stations = stationsData.stations.filter(s => s.id !== req.params.id);
    fs.writeFileSync(STATIONS_FILE, JSON.stringify(stationsData, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('정류장 삭제 오류:', error);
    res.status(500).json({ error: '정류장 삭제에 실패했습니다.' });
  }
});

// 차량 위치 정보 저장 객체
const vehicleLocations = {};

// 차량 위치 정보 업데이트 API
app.post('/api/vehicles/update-location', (req, res) => {
  try {
    const { vehicleId, location } = req.body;
    
    if (!vehicleId || !location) {
      return res.status(400).json({ error: '차량 ID와 위치 정보가 필요합니다.' });
    }
    
    // 위치 정보 저장
    vehicleLocations[vehicleId] = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp || new Date().toISOString()
    };
    
    console.log(`차량 위치 업데이트: ${vehicleId}`, vehicleLocations[vehicleId]);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('차량 위치 업데이트 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 모든 차량 위치 정보 조회 API
app.get('/api/vehicles/locations', (req, res) => {
  return res.status(200).json(vehicleLocations);
});

// 특정 차량 위치 정보 조회 API
app.get('/api/vehicles/:vehicleId/location', (req, res) => {
  const { vehicleId } = req.params;
  
  if (!vehicleLocations[vehicleId]) {
    return res.status(404).json({ error: '해당 차량의 위치 정보가 없습니다.' });
  }
  
  return res.status(200).json(vehicleLocations[vehicleId]);
});

// SMS 발송 API
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: '전화번호와 메시지가 필요합니다.' });
    }
    
    if (!twilioClient) {
      return res.status(503).json({ error: 'SMS 서비스를 사용할 수 없습니다. Twilio 계정 정보를 확인하세요.' });
    }
    
    const result = await twilioClient.messages.create({
      body: message,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    console.log('SMS 발송 성공:', result.sid);
    res.json({ success: true, messageId: result.sid });
  } catch (error) {
    console.error('SMS 발송 오류:', error);
    res.status(500).json({ error: 'SMS 발송에 실패했습니다.' });
  }
});

// 정류장 도착 시 SMS 발송
app.post('/api/stations/:stationId/arrival', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { vehicleId } = req.body;
    
    // 정류장 정보 조회
    const stationsData = JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
    const station = stationsData.stations.find(s => s.id === stationId);
    
    if (!station) {
      return res.status(404).json({ error: '정류장을 찾을 수 없습니다.' });
    }
    
    // 차량 정보 조회
    const vehiclesData = JSON.parse(fs.readFileSync(VEHICLES_FILE, 'utf8'));
    const vehicle = vehiclesData.vehicles.find(v => v.id === vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ error: '차량을 찾을 수 없습니다.' });
    }
    
    // 해당 정류장의 학생 정보 조회
    const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE_PATH, 'utf8'));
    const studentsAtStation = studentsData.filter(student => 
      student.arrivalLocation === stationId || student.departureLocation === stationId
    );
    
    // SMS 발송 및 이력 저장
    const messages = [];
    
    // Twilio 클라이언트가 없는 경우 SMS 발송 없이 이력만 저장
    if (!twilioClient) {
      console.warn('Twilio 클라이언트가 초기화되지 않았습니다. SMS 발송을 건너뜁니다.');
      
      for (const student of studentsAtStation) {
        const phoneNumber = student.motherPhone || student.fatherPhone || student.studentPhone;
        if (!phoneNumber) continue;
        
        const message = `[발레픽업] ${station.name}에 차량이 도착했습니다. 
학생: ${student.name}
정류장: ${station.name}
예상 대기 시간: 3분`;
        
        // 발송 이력 저장 (SMS 발송 없이)
        const historyData = JSON.parse(fs.readFileSync(NOTIFICATION_HISTORY_FILE, 'utf8'));
        const newNotification = {
          id: `notification${historyData.notifications.length + 1}`,
          timestamp: new Date().toISOString(),
          studentId: student.id,
          studentName: student.name,
          phoneNumber: phoneNumber,
          message: message,
          messageId: null,
          stationId: stationId,
          stationName: station.name,
          type: 'arrival',
          status: 'skipped',
          reason: 'Twilio 서비스 사용 불가'
        };
        
        historyData.notifications.push(newNotification);
        fs.writeFileSync(NOTIFICATION_HISTORY_FILE, JSON.stringify(historyData, null, 2));
        
        messages.push({ student: student.name, success: false, skipped: true });
      }
      
      return res.json({
        success: true,
        station: station.name,
        messages: messages,
        warning: 'SMS 발송이 건너뛰어졌습니다. Twilio 계정 정보를 확인하세요.'
      });
    }
    
    // Twilio 클라이언트가 있는 경우 SMS 발송
    for (const student of studentsAtStation) {
      const phoneNumber = student.motherPhone || student.fatherPhone || student.studentPhone;
      if (!phoneNumber) continue;
      
      const message = `[발레픽업] ${station.name}에 차량이 도착했습니다. 
학생: ${student.name}
정류장: ${station.name}
예상 대기 시간: 3분`;
      
      try {
        const result = await twilioClient.messages.create({
          body: message,
          to: phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        
        // 발송 이력 저장
        const historyData = JSON.parse(fs.readFileSync(NOTIFICATION_HISTORY_FILE, 'utf8'));
        const newNotification = {
          id: `notification${historyData.notifications.length + 1}`,
          timestamp: new Date().toISOString(),
          studentId: student.id,
          studentName: student.name,
          phoneNumber: phoneNumber,
          message: message,
          messageId: result.sid,
          stationId: stationId,
          stationName: station.name,
          type: 'arrival',
          status: 'success'
        };
        
        historyData.notifications.push(newNotification);
        fs.writeFileSync(NOTIFICATION_HISTORY_FILE, JSON.stringify(historyData, null, 2));
        
        messages.push({ student: student.name, success: true });
      } catch (smsError) {
        console.error(`SMS 발송 실패 (${student.name}):`, smsError);
        messages.push({ student: student.name, success: false, error: smsError.message });
      }
    }
    
    res.json({
      success: true,
      station: station.name,
      messages: messages
    });
  } catch (error) {
    console.error('정류장 도착 알림 처리 오류:', error);
    res.status(500).json({ error: '정류장 도착 알림 처리에 실패했습니다.' });
  }
});

// 메시지 템플릿 조회
app.get('/api/message-templates', (req, res) => {
  try {
    const templatesData = JSON.parse(fs.readFileSync(MESSAGE_TEMPLATES_FILE, 'utf8'));
    res.json(templatesData.templates);
  } catch (error) {
    console.error('메시지 템플릿 조회 오류:', error);
    res.status(500).json({ error: '메시지 템플릿을 불러오는데 실패했습니다.' });
  }
});

// 메시지 템플릿 수정
app.put('/api/message-templates/:id', (req, res) => {
  try {
    const templatesData = JSON.parse(fs.readFileSync(MESSAGE_TEMPLATES_FILE, 'utf8'));
    const templateIndex = templatesData.templates.findIndex(t => t.id === req.params.id);
    
    if (templateIndex === -1) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }
    
    templatesData.templates[templateIndex] = {
      ...templatesData.templates[templateIndex],
      ...req.body
    };
    
    fs.writeFileSync(MESSAGE_TEMPLATES_FILE, JSON.stringify(templatesData, null, 2));
    res.json(templatesData.templates[templateIndex]);
  } catch (error) {
    console.error('메시지 템플릿 수정 오류:', error);
    res.status(500).json({ error: '메시지 템플릿 수정에 실패했습니다.' });
  }
});

// 메시지 템플릿 추가
app.post('/api/message-templates', (req, res) => {
  try {
    const templatesData = JSON.parse(fs.readFileSync(MESSAGE_TEMPLATES_FILE, 'utf8'));
    const newTemplate = {
      id: `template${templatesData.templates.length + 1}`,
      ...req.body
    };
    
    templatesData.templates.push(newTemplate);
    fs.writeFileSync(MESSAGE_TEMPLATES_FILE, JSON.stringify(templatesData, null, 2));
    res.json(newTemplate);
  } catch (error) {
    console.error('메시지 템플릿 추가 오류:', error);
    res.status(500).json({ error: '메시지 템플릿 추가에 실패했습니다.' });
  }
});

// 메시지 템플릿 삭제
app.delete('/api/message-templates/:id', (req, res) => {
  try {
    const templatesData = JSON.parse(fs.readFileSync(MESSAGE_TEMPLATES_FILE, 'utf8'));
    templatesData.templates = templatesData.templates.filter(t => t.id !== req.params.id);
    fs.writeFileSync(MESSAGE_TEMPLATES_FILE, JSON.stringify(templatesData, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('메시지 템플릿 삭제 오류:', error);
    res.status(500).json({ error: '메시지 템플릿 삭제에 실패했습니다.' });
  }
});

// 메시지 템플릿 미리보기
app.post('/api/message-templates/:id/preview', (req, res) => {
  try {
    const templatesData = JSON.parse(fs.readFileSync(MESSAGE_TEMPLATES_FILE, 'utf8'));
    const template = templatesData.templates.find(t => t.id === req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
    }
    
    let message = template.template;
    const variables = req.body;
    
    // 변수 치환
    Object.keys(variables).forEach(key => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
    });
    
    res.json({ message });
  } catch (error) {
    console.error('메시지 템플릿 미리보기 오류:', error);
    res.status(500).json({ error: '메시지 템플릿 미리보기에 실패했습니다.' });
  }
});

// 알림 발송 이력 조회
app.get('/api/notification-history', (req, res) => {
  try {
    const historyData = JSON.parse(fs.readFileSync(NOTIFICATION_HISTORY_FILE, 'utf8'));
    res.json(historyData.notifications);
  } catch (error) {
    console.error('알림 발송 이력 조회 오류:', error);
    res.status(500).json({ error: '알림 발송 이력을 불러오는데 실패했습니다.' });
  }
});

// 알림 발송 이력 추가
app.post('/api/notification-history', (req, res) => {
  try {
    const historyData = JSON.parse(fs.readFileSync(NOTIFICATION_HISTORY_FILE, 'utf8'));
    const newNotification = {
      id: `notification${historyData.notifications.length + 1}`,
      timestamp: new Date().toISOString(),
      ...req.body
    };
    
    historyData.notifications.push(newNotification);
    fs.writeFileSync(NOTIFICATION_HISTORY_FILE, JSON.stringify(historyData, null, 2));
    res.json(newNotification);
  } catch (error) {
    console.error('알림 발송 이력 추가 오류:', error);
    res.status(500).json({ error: '알림 발송 이력 추가에 실패했습니다.' });
  }
});

// 알림 재발송
app.post('/api/notification-history/:id/resend', async (req, res) => {
  try {
    const historyData = JSON.parse(fs.readFileSync(NOTIFICATION_HISTORY_FILE, 'utf8'));
    const notification = historyData.notifications.find(n => n.id === req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }
    
    // Twilio 클라이언트 확인
    if (!twilioClient) {
      // 재발송 이력 추가 (SMS 발송 없이)
      const newNotification = {
        id: `notification${historyData.notifications.length + 1}`,
        timestamp: new Date().toISOString(),
        ...notification,
        isResend: true,
        originalNotificationId: notification.id,
        status: 'skipped',
        reason: 'Twilio 서비스 사용 불가'
      };
      
      historyData.notifications.push(newNotification);
      fs.writeFileSync(NOTIFICATION_HISTORY_FILE, JSON.stringify(historyData, null, 2));
      
      return res.status(503).json({ 
        warning: 'SMS 서비스를 사용할 수 없습니다. Twilio 계정 정보를 확인하세요.',
        notification: newNotification
      });
    }
    
    // SMS 재발송
    await twilioClient.messages.create({
      body: notification.message,
      to: notification.phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    // 재발송 이력 추가
    const newNotification = {
      id: `notification${historyData.notifications.length + 1}`,
      timestamp: new Date().toISOString(),
      ...notification,
      isResend: true,
      originalNotificationId: notification.id
    };
    
    historyData.notifications.push(newNotification);
    fs.writeFileSync(NOTIFICATION_HISTORY_FILE, JSON.stringify(historyData, null, 2));
    
    res.json(newNotification);
  } catch (error) {
    console.error('알림 재발송 오류:', error);
    res.status(500).json({ error: '알림 재발송에 실패했습니다.' });
  }
});

// 알림 설정 조회
app.get('/api/notification-settings', (req, res) => {
  try {
    const settingsData = JSON.parse(fs.readFileSync(NOTIFICATION_SETTINGS_FILE, 'utf8'));
    res.json(settingsData.settings);
  } catch (error) {
    console.error('알림 설정 조회 오류:', error);
    res.status(500).json({ error: '알림 설정을 불러오는데 실패했습니다.' });
  }
});

// 알림 설정 업데이트
app.put('/api/notification-settings', (req, res) => {
  try {
    const settingsData = JSON.parse(fs.readFileSync(NOTIFICATION_SETTINGS_FILE, 'utf8'));
    const { type, settings } = req.body;
    
    if (!type || !settings) {
      return res.status(400).json({ error: '알림 유형과 설정이 필요합니다.' });
    }
    
    if (!settingsData.settings[type]) {
      return res.status(400).json({ error: '유효하지 않은 알림 유형입니다.' });
    }
    
    settingsData.settings[type] = {
      ...settingsData.settings[type],
      ...settings
    };
    
    fs.writeFileSync(NOTIFICATION_SETTINGS_FILE, JSON.stringify(settingsData, null, 2));
    res.json(settingsData.settings[type]);
  } catch (error) {
    console.error('알림 설정 업데이트 오류:', error);
    res.status(500).json({ error: '알림 설정 업데이트에 실패했습니다.' });
  }
});

// 알림 설정 초기화
app.post('/api/notification-settings/reset', (req, res) => {
  try {
    const defaultSettings = {
      settings: {
        arrival: {
          enabled: true,
          advanceMinutes: 3,
          maxRetries: 2,
          retryIntervalMinutes: 1,
          excludeStudents: [],
          excludeStations: [],
          excludeTimes: []
        },
        departure: {
          enabled: true,
          advanceMinutes: 3,
          maxRetries: 2,
          retryIntervalMinutes: 1,
          excludeStudents: [],
          excludeStations: [],
          excludeTimes: []
        }
      }
    };
    
    fs.writeFileSync(NOTIFICATION_SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    res.json(defaultSettings.settings);
  } catch (error) {
    console.error('알림 설정 초기화 오류:', error);
    res.status(500).json({ error: '알림 설정 초기화에 실패했습니다.' });
  }
});

// IP 주소 확인 API
app.get('/api/ip', (req, res) => {
  try {
    res.json({
      ip: req.ip,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('IP 주소 확인 오류:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 테스트 페이지 API 엔드포인트
app.get('/api/test-page', (req, res) => {
  try {
    // 캐시 방지를 위한 헤더 설정
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const testData = {
      title: '테스트 페이지',
      description: '이 페이지는 테스트를 위한 페이지입니다.',
      sections: [
        {
          id: 1,
          title: '섹션 1',
          content: '이것은 첫 번째 섹션입니다.'
        },
        {
          id: 2,
          title: '섹션 2',
          content: '이것은 두 번째 섹션입니다.'
        },
        {
          id: 3,
          title: '섹션 3',
          content: '이것은 세 번째 섹션입니다.'
        }
      ],
      timestamp: new Date().toISOString()
    };
    
    console.log('테스트 페이지 데이터 전송:', testData);
    res.json(testData);
  } catch (err) {
    console.error('테스트 페이지 데이터 오류:', err);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.', 
      message: err.message || '알 수 없는 오류',
      timestamp: new Date().toISOString()
    });
  }
});

// React 앱의 모든 요청을 index.html로 라우팅
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`
서버가 시작되었습니다.
포트: ${PORT}
Notion API 사용 가능: ${!!notion}
Notion 데이터베이스 ID 설정됨: ${!!NOTION_DATABASE_ID}
  `);
});