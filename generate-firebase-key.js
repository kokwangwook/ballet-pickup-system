const fs = require('fs');
const path = require('path');

// 개발용 Firebase 서비스 계정 키 템플릿
const devServiceAccount = {
  "type": "service_account",
  "project_id": "ballet-pickup-dev",
  "private_key_id": "development-key-id-" + Math.random().toString(36).substring(2, 15),
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-dev@ballet-pickup-dev.iam.gserviceaccount.com",
  "client_id": "dev-client-id-" + Date.now(),
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dev%40ballet-pickup-dev.iam.gserviceaccount.com"
};

// 서비스 계정 키 파일 경로
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

// 파일 쓰기
fs.writeFileSync(serviceAccountPath, JSON.stringify(devServiceAccount, null, 2), 'utf8');

console.log(`개발용 Firebase 서비스 계정 키가 생성되었습니다: ${serviceAccountPath}`);
console.log('주의: 이 키는 개발 환경에서만 사용하세요. 프로덕션 환경에서는 실제 Firebase 콘솔에서 발급한 키를 사용하세요.');
console.log('실제 Firebase 서비스 계정 키를 사용하려면 Firebase 콘솔에서 발급받은 키를 이 파일에 복사하세요.');

// 서버 코드 수정 안내
console.log('\n서버 코드 수정 가이드:');
console.log('1. server.js에서 Firebase 초기화 코드를 확인하세요.');
console.log('2. 개발 환경에서는 Firebase 에뮬레이터를 사용하도록 설정할 수 있습니다:');
console.log(`
if (process.env.NODE_ENV !== 'production') {
  // 개발 환경에서는 Firebase 에뮬레이터 사용 (선택 사항)
  const FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  const FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  
  process.env.FIREBASE_AUTH_EMULATOR_HOST = FIREBASE_AUTH_EMULATOR_HOST;
  process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;
  
  console.log('Firebase 에뮬레이터 모드로 실행 중입니다.');
}
`); 