const fs = require('fs');
const path = require('path');

// Firebase 서비스 계정 키 경로
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
// Firebase Admin SDK를 위한 서버 초기화 코드 예시 경로
const serverInitCodePath = path.join(__dirname, 'firebase-server-init.js');
// 환경 변수 파일 경로
const envFilePath = path.join(__dirname, '.env');

// 개발용 Firebase 서비스 계정 키 생성
function generateDevelopmentServiceAccount() {
  // 랜덤 ID 생성
  const randomId = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  
  return {
    "type": "service_account",
    "project_id": "ballet-pickup-dev",
    "private_key_id": "dev-key-" + randomId,
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-dev@ballet-pickup-dev.iam.gserviceaccount.com",
    "client_id": "dev-client-id-" + timestamp,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dev%40ballet-pickup-dev.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };
}

// 개발용 Firebase 에뮬레이터 설정 구성
function setupFirebaseEmulator() {
  console.log('Firebase 에뮬레이터 설정을 구성합니다...');
  
  // 개발용 Firebase 서비스 계정 키 생성
  const devServiceAccount = generateDevelopmentServiceAccount();
  
  try {
    // 서비스 계정 키 파일의 존재 여부 확인
    const fileExists = fs.existsSync(serviceAccountPath);
    
    // 파일이 존재하면 내용 확인
    if (fileExists) {
      try {
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        const existingAccount = JSON.parse(fileContent);
        
        // 이미 유효한 내용이 있고, 개발 계정이 아닌 경우 백업 생성
        if (existingAccount && existingAccount.project_id && !existingAccount.project_id.includes('dev')) {
          console.log('기존 서비스 계정 키 파일이 실제 프로젝트를 위한 것으로 보입니다.');
          const backupPath = `${serviceAccountPath}.backup-${Date.now()}`;
          fs.copyFileSync(serviceAccountPath, backupPath);
          console.log(`기존 서비스 계정 키 파일을 백업했습니다: ${backupPath}`);
          console.log('⚠️ 개발이 끝난 후 백업 파일을 복원하세요.');
        }
      } catch (parseError) {
        console.log('기존 서비스 계정 키 파일이 유효한 JSON 형식이 아닙니다. 덮어씁니다.');
      }
    }
    
    // 서비스 계정 키 파일 쓰기
    fs.writeFileSync(serviceAccountPath, JSON.stringify(devServiceAccount, null, 2), 'utf8');
    console.log(`✅ 개발용 Firebase 서비스 계정 키가 생성되었습니다: ${serviceAccountPath}`);
  } catch (error) {
    console.error('서비스 계정 키 파일 생성 중 오류:', error);
  }
  
  try {
    // server.js를 위한 Firebase 초기화 코드 예시 생성
    const serverInitCode = `// Firebase Admin SDK 개발 모드 초기화 방법
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
    "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\\n-----END PRIVATE KEY-----\\n",
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
`;

    fs.writeFileSync(serverInitCodePath, serverInitCode, 'utf8');
    console.log(`✅ Firebase 서버 초기화 코드 예시를 생성했습니다: ${serverInitCodePath}`);
  } catch (error) {
    console.error('서버 초기화 코드 예시 생성 중 오류:', error);
  }
  
  // 환경 변수 파일 설정
  try {
    setupEnvironmentVariables();
  } catch (error) {
    console.error('환경 변수 설정 중 오류:', error);
  }
}

// 환경 변수 파일 설정
function setupEnvironmentVariables() {
  console.log('\n환경 변수 파일 설정 중...');
  
  // 기존 .env 파일이 있는지 확인
  let envContent = '';
  if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, 'utf8');
  }
  
  // 환경 변수 목록 정의
  const envVars = {
    'FIREBASE_EMULATOR': 'false',
    'NODE_ENV': 'development'
  };
  
  // 환경 변수 추가 또는 업데이트
  Object.entries(envVars).forEach(([key, value]) => {
    // 이미 변수가 존재하는지 확인
    const regex = new RegExp(`^${key}=.*`, 'm');
    
    if (regex.test(envContent)) {
      // 변수가 이미 존재하면 값 업데이트
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // 변수가 없으면 추가
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `${key}=${value}\n`;
    }
  });
  
  // 파일에 쓰기
  fs.writeFileSync(envFilePath, envContent, 'utf8');
  console.log(`✅ 환경 변수가 .env 파일에 설정되었습니다: ${envFilePath}`);
  console.log('  설정된 변수:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`  - ${key}=${value}`);
  });
}

// 에뮬레이터 실행 방법 안내
function showEmulatorInstructions() {
  console.log('\n🚀 Firebase 에뮬레이터 시작 방법:');
  console.log('1. Firebase CLI 설치 (아직 설치하지 않았다면):');
  console.log('   npm install -g firebase-tools');
  console.log('\n2. Firebase에 로그인:');
  console.log('   firebase login');
  console.log('\n3. 프로젝트 초기화 (아직 하지 않았다면):');
  console.log('   firebase init emulators');
  console.log('\n4. 에뮬레이터 시작:');
  console.log('   firebase emulators:start');
  console.log('\n🔍 에뮬레이터 사용 시 주의 사항:');
  console.log('- 에뮬레이터는 로컬 개발 환경에서만 사용하세요.');
  console.log('- 에뮬레이터 데이터는 영구적이지 않으며, 종료 시 초기화됩니다.');
  console.log('- 데이터 백업이 필요한 경우 firebase emulators:export 명령을 사용하세요.');
  console.log('\n🔧 에뮬레이터 사용 설정:');
  console.log('  .env 파일에서 FIREBASE_EMULATOR=true로 설정하면 에뮬레이터를 사용합니다.');
}

// 실제 Firebase 프로젝트 설정 방법 안내
function showRealFirebaseSetupInstructions() {
  console.log('\n🔥 실제 Firebase 프로젝트 설정 방법:');
  console.log('1. Firebase 콘솔(https://console.firebase.google.com/)에 접속하세요.');
  console.log('2. 프로젝트를 선택하고 "⚙️ 설정" > "프로젝트 설정" > "서비스 계정" 탭으로 이동하세요.');
  console.log('3. "새 비공개 키 생성" 버튼을 클릭하여 서비스 계정 키를 다운로드 받으세요.');
  console.log('4. 다운로드한 파일의 내용을 `firebase-service-account.json` 파일에 복사하세요.');
  console.log('5. .env 파일에서 NODE_ENV=production으로 설정하세요.');
  console.log('6. 서버를 재시작하면 실제 Firebase 데이터베이스를 사용하게 됩니다.');
}

// server.js 변경 가이드
function showServerModificationGuide() {
  console.log('\n📝 server.js 수정 가이드:');
  console.log('1. firebase-server-init.js 파일의 코드를 참고하여 server.js를 수정하세요.');
  console.log('2. 기존 Firebase 초기화 코드를 새로운 패턴으로 대체하세요.');
  console.log('3. firebase-service-account.json 파일이 .gitignore에 있는지 확인하세요.');
}

// Firebase 모듈 설치 확인 및 안내
function checkFirebaseModules() {
  console.log('\n📦 Firebase 모듈 설치 확인:');
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredModules = [
      { name: 'firebase-admin', version: '^11.0.0' },
      { name: 'firebase', version: '^9.0.0' }
    ];
    
    const missingModules = [];
    requiredModules.forEach(module => {
      if (!dependencies[module.name]) {
        missingModules.push(module);
      }
    });
    
    if (missingModules.length > 0) {
      console.log('⚠️ 다음 Firebase 모듈이 설치되지 않았습니다:');
      const installCommand = 'npm install ' + missingModules.map(m => `${m.name}@${m.version}`).join(' ');
      console.log(`  ${installCommand}`);
      console.log('  위 명령어를 실행하여 필요한 모듈을 설치하세요.');
    } else {
      console.log('✅ 필요한 Firebase 모듈이 모두 설치되어 있습니다.');
    }
  } catch (error) {
    console.error('package.json 파일 확인 중 오류:', error);
    console.log('⚠️ package.json 파일을 확인할 수 없습니다. 필요한 Firebase 모듈을 수동으로 설치하세요.');
    console.log('  npm install firebase-admin@^11.0.0 firebase@^9.0.0');
  }
}

// 실행 옵션 표시 및 자동 실행
function showOptionsAndRun() {
  console.log('\n🔧 Firebase 개발 환경 설정 도구');
  console.log('다음 작업을 수행합니다:');
  console.log('1. 개발용 Firebase 서비스 계정 키 생성');
  console.log('2. Firebase 에뮬레이터 설정 안내');
  console.log('3. server.js 수정 가이드 확인');
  console.log('4. 환경 변수 설정');
  console.log('5. Firebase 모듈 설치 확인');
  
  // 모든 설정 실행
  setupFirebaseEmulator();
  checkFirebaseModules();
  showEmulatorInstructions();
  showRealFirebaseSetupInstructions();
  showServerModificationGuide();
  
  console.log('\n✨ 설정이 완료되었습니다!');
  console.log('이제 개발 서버를 다시 시작하여 변경사항을 적용하세요: npm run dev');
}

// 도구 실행
showOptionsAndRun(); 