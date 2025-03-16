// Firebase에서 강한서 학생 데이터를 복원하는 스크립트
require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase 초기화
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
  console.log('Firebase 서비스 계정 파일 경로:', serviceAccountPath);
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
    console.log('Firebase 서비스 계정을 파일에서 로드했습니다.');
  } else {
    console.log('서비스 계정 파일이 존재하지 않습니다. 환경 변수를 사용합니다.');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin이 성공적으로 초기화되었습니다.');
} catch (error) {
  console.error('Firebase 초기화 오류:', error);
  process.exit(1);
}

const db = admin.firestore();

// 강한서 학생 데이터 복원
async function restoreStudent() {
  try {
    console.log('강한서 학생 데이터를 복원합니다...');
    
    // 이름으로 검색
    const nameSnapshot = await db.collection('students').where('name', '==', '강한서').get();
    
    if (nameSnapshot.empty) {
      console.log('이름으로 검색: 강한서 학생 데이터가 없습니다.');
      return;
    }
    
    console.log(`이름으로 검색: ${nameSnapshot.size}개의 강한서 학생 데이터를 찾았습니다.`);
    
    // 각 문서 업데이트
    const promises = [];
    nameSnapshot.forEach(doc => {
      console.log('문서 ID:', doc.id);
      console.log('현재 데이터:', JSON.stringify(doc.data(), null, 2));
      
      // isActive 필드를 true로 설정하고 updatedAt 필드 업데이트
      const updateData = {
        isActive: true,
        updatedAt: new Date().toISOString()
      };
      
      console.log('업데이트할 데이터:', updateData);
      promises.push(db.collection('students').doc(doc.id).update(updateData));
    });
    
    await Promise.all(promises);
    console.log('강한서 학생 데이터가 성공적으로 복원되었습니다.');
    
    // 업데이트 후 데이터 확인
    const updatedSnapshot = await db.collection('students').where('name', '==', '강한서').get();
    updatedSnapshot.forEach(doc => {
      console.log('업데이트 후 데이터:', JSON.stringify(doc.data(), null, 2));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('데이터 복원 오류:', error);
    process.exit(1);
  }
}

// 스크립트 실행
restoreStudent(); 