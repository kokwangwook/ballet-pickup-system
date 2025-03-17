// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAskcrnDf1qewhZqiU9D7ZPzpYxRPXlxXs",
  authDomain: "ballet-pickup-system.firebaseapp.com",
  projectId: "ballet-pickup-system",
  storageBucket: "ballet-pickup-system.firebasestorage.app",
  messagingSenderId: "1005218003989",
  appId: "1:1005218003989:web:77146b9362105a9681221c",
  measurementId: "G-H22M8818JB"
};

// 로깅 추가
console.log('Firebase 설정 초기화 중...', firebaseConfig.projectId);

// Initialize Firebase
let app;
let db;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase 앱 초기화 성공');
  
  try {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics 초기화 성공');
  } catch (analyticsError) {
    console.warn('Firebase Analytics 초기화 실패:', analyticsError.message);
    // Analytics 실패는 무시하고 계속 진행
  }
  
  try {
    db = getFirestore(app);
    console.log('Firestore 초기화 성공');
    
    // 로컬 개발 환경에서 에뮬레이터 사용 여부 확인
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    const useEmulator = false; // 에뮬레이터 사용 여부 (필요 시 true로 변경)
    
    if (isLocalhost && useEmulator) {
      console.log('Firestore 에뮬레이터 연결 시도...');
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Firestore 에뮬레이터 연결 성공');
    }
  } catch (firestoreError) {
    console.error('Firestore 초기화 실패:', firestoreError.message);
    throw firestoreError; // 재전파
  }
} catch (firebaseError) {
  console.error('Firebase 앱 초기화 실패:', firebaseError.message);
  throw firebaseError; // 재전파
}

export { db, analytics };
export default app; 