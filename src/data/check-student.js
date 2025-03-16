// Firebase에서 강한서 학생 데이터를 확인하는 스크립트
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

// 강한서 학생 데이터 확인
async function checkStudentData() {
  try {
    console.log('강한서 학생 데이터를 확인합니다...');
    
    // 이름으로 검색
    const nameSnapshot = await db.collection('students').where('name', '==', '강한서').get();
    
    if (nameSnapshot.empty) {
      console.log('이름으로 검색: 강한서 학생 데이터가 없습니다.');
    } else {
      console.log(`이름으로 검색: ${nameSnapshot.size}개의 강한서 학생 데이터를 찾았습니다.`);
      nameSnapshot.forEach(doc => {
        console.log('문서 ID:', doc.id);
        console.log('데이터:', JSON.stringify(doc.data(), null, 2));
      });
    }
    
    // 모든 학생 데이터 확인
    console.log('\n모든 학생 데이터를 확인합니다...');
    const allStudents = await db.collection('students').get();
    console.log(`총 ${allStudents.size}명의 학생 데이터가 있습니다.`);
    
    // 학생 이름 목록 출력
    const studentNames = [];
    allStudents.forEach(doc => {
      const data = doc.data();
      studentNames.push(`${data.name}${data.shortId ? ` (${data.shortId})` : ''}`);
    });
    
    console.log('학생 이름 목록:');
    console.log(studentNames.sort().join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('데이터 확인 오류:', error);
    process.exit(1);
  }
}

// 실행
checkStudentData(); 