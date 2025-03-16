// Firebase에 발레블랑 수업 버스 탑승 명단을 업로드하는 스크립트
require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase 초기화
let serviceAccount;
try {
  // 환경 변수에서 서비스 계정 정보 가져오기
  if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Firebase 서비스 계정을 환경 변수에서 로드했습니다.');
  } else {
    // 파일에서 서비스 계정 정보 가져오기
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
      console.log('Firebase 서비스 계정을 파일에서 로드했습니다.');
    } else {
      console.error('Firebase 서비스 계정 키 파일이 존재하지 않습니다.');
      process.exit(1);
    }
  }

  // Firebase 초기화
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin이 성공적으로 초기화되었습니다.');
} catch (error) {
  console.error('Firebase 초기화 오류:', error);
  process.exit(1);
}

// Firestore 인스턴스 가져오기
const db = admin.firestore();

// 데이터 파일 읽기
const pickupDataPath = path.join(__dirname, 'ballet-pickup-data.json');
let pickupData;

try {
  const rawData = fs.readFileSync(pickupDataPath, 'utf8');
  pickupData = JSON.parse(rawData);
  console.log('발레블랑 수업 버스 탑승 명단 데이터를 성공적으로 로드했습니다.');
} catch (error) {
  console.error('데이터 파일 읽기 오류:', error);
  process.exit(1);
}

// 기존 데이터 백업
async function backupExistingData() {
  try {
    console.log('기존 데이터 백업을 시작합니다...');
    
    // 스케줄 데이터 백업
    const pickupRef = db.collection('pickup-schedules');
    const pickupSnapshot = await pickupRef.get();
    const pickupBackup = {};
    
    pickupSnapshot.forEach(doc => {
      pickupBackup[doc.id] = doc.data();
    });
    
    // 학생 데이터 백업
    const studentsRef = db.collection('students');
    const studentsSnapshot = await studentsRef.get();
    const studentsBackup = {};
    
    studentsSnapshot.forEach(doc => {
      studentsBackup[doc.id] = doc.data();
    });
    
    // 백업 데이터 저장
    const backupData = {
      timestamp: new Date().toISOString(),
      pickupSchedules: pickupBackup,
      students: studentsBackup
    };
    
    const backupPath = path.join(__dirname, `backup-${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`기존 데이터가 ${backupPath}에 백업되었습니다.`);
    return { pickupBackup, studentsBackup };
  } catch (error) {
    console.error('데이터 백업 오류:', error);
    return { pickupBackup: {}, studentsBackup: {} };
  }
}

// Firebase에 데이터 업로드
async function uploadData() {
  try {
    // 기존 데이터 백업
    const { pickupBackup, studentsBackup } = await backupExistingData();
    
    // 스케줄 데이터 업로드
    await uploadPickupSchedules();
    
    // 학생 데이터 업로드 (기존 데이터 보존)
    await createStudentData(studentsBackup);
    
    console.log('모든 데이터가 성공적으로 업로드되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('데이터 업로드 오류:', error);
    process.exit(1);
  }
}

// 스케줄 데이터 업로드
async function uploadPickupSchedules() {
  try {
    const pickupRef = db.collection('pickup-schedules');
    const batch = db.batch();
    
    console.log('스케줄 데이터를 업로드합니다...');
    
    // 요일별 데이터 추가
    // 월, 수요일 데이터
    const mondayWednesdayRef = pickupRef.doc('monday_wednesday');
    batch.set(mondayWednesdayRef, pickupData.schedules.monday_wednesday, { merge: true });
    
    // 화, 목요일 데이터
    const tuesdayThursdayRef = pickupRef.doc('tuesday_thursday');
    batch.set(tuesdayThursdayRef, pickupData.schedules.tuesday_thursday, { merge: true });
    
    // 금요일 데이터
    const fridayRef = pickupRef.doc('friday');
    batch.set(fridayRef, pickupData.schedules.friday, { merge: true });
    
    // 배치 커밋
    await batch.commit();
    
    console.log('발레블랑 수업 버스 탑승 명단이 Firebase에 성공적으로 업로드되었습니다.');
  } catch (error) {
    console.error('스케줄 데이터 업로드 오류:', error);
    throw error;
  }
}

// 학생 데이터 생성 및 업로드
async function createStudentData(existingStudents = {}) {
  try {
    const studentsRef = db.collection('students');
    const newStudents = new Map(); // 새로운 학생 데이터 저장
    const processedStudentIds = new Set(); // 처리된 학생 ID 추적
    
    console.log('학생 데이터를 생성하고 업로드합니다...');
    
    // 기존 학생 데이터 로드
    const existingStudentsMap = new Map();
    Object.keys(existingStudents).forEach(docId => {
      const student = existingStudents[docId];
      if (student.shortId) {
        existingStudentsMap.set(student.shortId, { docId, ...student });
      }
      if (student.name) {
        existingStudentsMap.set(student.name, { docId, ...student });
      }
    });
    
    // 모든 스케줄에서 학생 정보 추출
    Object.keys(pickupData.schedules).forEach(dayKey => {
      const dayData = pickupData.schedules[dayKey];
      
      // 등원 데이터 처리
      Object.keys(dayData.arrival || {}).forEach(timeKey => {
        const timeData = dayData.arrival[timeKey];
        timeData.students.forEach(student => {
          processStudent(student);
        });
      });
      
      // 하원 데이터 처리
      Object.keys(dayData.departure || {}).forEach(timeKey => {
        const timeData = dayData.departure[timeKey];
        timeData.students.forEach(student => {
          processStudent(student);
        });
      });
    });
    
    // 학생 데이터 처리 함수
    function processStudent(student) {
      // 학생 식별자 생성 (shortId 또는 이름)
      const studentIdentifier = student.shortId || student.name;
      
      // 이미 처리된 학생인지 확인
      if (processedStudentIds.has(studentIdentifier)) {
        return;
      }
      
      processedStudentIds.add(studentIdentifier);
      
      // 학생 문서 ID 생성
      let studentId;
      let existingStudent = null;
      
      // shortId로 기존 학생 찾기
      if (student.shortId && existingStudentsMap.has(student.shortId)) {
        existingStudent = existingStudentsMap.get(student.shortId);
        studentId = existingStudent.docId;
      } 
      // 이름으로 기존 학생 찾기
      else if (existingStudentsMap.has(student.name)) {
        existingStudent = existingStudentsMap.get(student.name);
        studentId = existingStudent.docId;
      } 
      // 새 학생 ID 생성
      else {
        studentId = student.shortId ? `student-${student.shortId}` : `student-${student.name.replace(/\s+/g, '-')}`;
      }
      
      // 학생 데이터 생성
      const classDays = extractClassDays(student.note);
      
      // 기존 데이터와 새 데이터 병합
      const studentData = {
        id: studentId,
        name: student.name,
        shortId: student.shortId || '',
        contact: student.contact || '',
        isActive: true,
        // 기존 등록일 유지, 없으면 현재 시간
        registrationDate: existingStudent?.registrationDate || new Date().toISOString(),
        // 요일 정보 병합
        classDays: existingStudent?.classDays ? 
          [...new Set([...existingStudent.classDays, ...classDays])] : classDays,
        // 기타 정보
        note: student.note || existingStudent?.note || '',
        // 위치 정보 추가
        location: student.location || existingStudent?.location || '',
        // 기존 데이터 유지
        ...(existingStudent || {})
      };
      
      // 새 학생 데이터에 추가
      newStudents.set(studentId, studentData);
    }
    
    // 배치 업로드 준비
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    const BATCH_LIMIT = 500; // Firestore 배치 작업 제한
    
    // 모든 학생 데이터 배치에 추가
    for (const [studentId, studentData] of newStudents.entries()) {
      currentBatch.set(studentsRef.doc(studentId), studentData, { merge: true });
      operationCount++;
      
      // 배치 제한에 도달하면 새 배치 생성
      if (operationCount >= BATCH_LIMIT) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }
    }
    
    // 마지막 배치 추가
    if (operationCount > 0) {
      batches.push(currentBatch);
    }
    
    // 모든 배치 커밋
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`배치 ${i + 1}/${batches.length} 커밋 완료`);
    }
    
    console.log(`총 ${newStudents.size}명의 학생 데이터가 Firebase에 업로드되었습니다.`);
  } catch (error) {
    console.error('학생 데이터 업로드 오류:', error);
    throw error;
  }
}

// 요일 정보 추출 함수
function extractClassDays(note) {
  if (!note) return [];
  
  const classDays = [];
  if (note.includes('월')) classDays.push('월');
  if (note.includes('화')) classDays.push('화');
  if (note.includes('수')) classDays.push('수');
  if (note.includes('목')) classDays.push('목');
  if (note.includes('금')) classDays.push('금');
  
  return classDays;
}

// 데이터 업로드 실행
uploadData(); 