// Firebase Admin SDK 개발 모드 초기화 방법
// 이 코드를 server.js에 통합하거나 참고하세요

// 1. 필요한 모듈 불러오기
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 2. 서비스 계정 키 로드 함수
function loadServiceAccount() {
  try {
    // 환경 변수에서 서비스 계정 정보 확인
    if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    
    // 파일에서 서비스 계정 정보 로드
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const content = fs.readFileSync(serviceAccountPath, 'utf8');
      if (content && content.trim() !== '') {
        return JSON.parse(content);
      }
    }
    
    // 서비스 계정 정보가 없으면 개발용 계정 생성
    return createDevelopmentServiceAccount();
  } catch (error) {
    console.error('서비스 계정 로드 오류:', error);
    return createDevelopmentServiceAccount();
  }
}

// 3. 개발용 서비스 계정 생성 함수
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
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dev%40ballet-pickup-dev.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };
}

// 4. 초기화 함수
function initializeFirebase() {
  // 개발 환경 또는 프로덕션 환경에 따라 다르게 초기화
  const isDevelopment = process.env.NODE_ENV !== 'production';
  let firebaseInitialized = false;
  
  try {
    // 서비스 계정 로드
    const serviceAccount = loadServiceAccount();
    
    // Firebase Admin 초기화
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // 필요한 경우 다른 Firebase 옵션 추가
    });
    
    // 개발 환경에서는 에뮬레이터 사용 (선택 사항)
    if (isDevelopment && process.env.FIREBASE_EMULATOR === 'true') {
      // Firebase 에뮬레이터 설정
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      
      console.log('🔥 Firebase 에뮬레이터 모드로 실행 중입니다.');
    } else {
      console.log('🔥 Firebase ' + (isDevelopment ? '개발' : '프로덕션') + ' 모드로 실행 중입니다.');
    }
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin이 성공적으로 초기화되었습니다.');
    
    // Firebase 서비스 참조 생성
    const db = admin.firestore();
    return { admin, db, firebaseInitialized };
  } catch (error) {
    console.error('Firebase 초기화 오류:', error);
    console.log('❌ Firebase Admin이 초기화되지 않았습니다. 로컬 JSON 파일을 사용합니다.');
    return { admin, db: null, firebaseInitialized: false };
  }
}

// 5. Firebase 초기화 실행
const { admin, db, firebaseInitialized } = initializeFirebase();

// 6. 내보내기
module.exports = {
  admin,
  db,
  firebaseInitialized
};
