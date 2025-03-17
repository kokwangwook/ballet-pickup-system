/**
 * Firebase 서비스 모듈
 * 학생, 위치, 수업 정보 등의 데이터를 가져오고 관리하는 함수들을 제공합니다.
 */

import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

/**
 * API 경로를 현재 환경에 맞게 구성하는 함수
 * @param {string} endpoint API 엔드포인트 경로
 * @returns {string} 완전한 API URL
 */
const getApiUrl = (endpoint) => {
  // 현재 URL과 호스트명 로깅
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  
  console.log('현재 URL:', currentUrl);
  console.log('호스트명:', hostname);
  
  // 로컬 환경인지 확인 (확실한 방법으로)
  const isLocalhost = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') ||
    hostname.includes('.local');
  
  // 로컬 개발 환경이면 /api/* 형태로, 그 외에는 모두 /.netlify/functions/api 형태로 구성
  const baseUrl = isLocalhost ? '' : '/.netlify/functions';
  
  const fullUrl = `${baseUrl}${endpoint}`;
  console.log(`API 요청 URL 구성: ${fullUrl} (로컬 환경: ${isLocalhost})`);
  
  return fullUrl;
};

/**
 * API 기본 URL 설정
 * @returns {string} 기본 API URL
 */
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // 개발 환경인 경우
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api';
  }
  
  // Netlify 배포 환경인 경우
  if (hostname.includes('netlify.app')) {
    return '/.netlify/functions/api';
  }
  
  // 기타 프로덕션 환경의 경우
  return '/api';
};

/**
 * 모든 학생 데이터를 가져오는 함수
 * @returns {Promise<Array>} 학생 목록
 */
export const fetchStudents = async () => {
  try {
    console.log('Firebase Firestore에서 학생 데이터 가져오기 시도');
    
    // 먼저 Firestore에서 직접 데이터 가져오기 시도
    try {
      const studentsCollection = collection(db, 'students');
      const studentsSnapshot = await getDocs(studentsCollection);
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Firebase Firestore에서 학생 데이터 가져오기 성공:', studentsList.length);
      return studentsList;
    } catch (firestoreError) {
      console.error('Firebase Firestore 접근 오류:', firestoreError);
      
      // Firestore 접근 실패 시 API 호출 시도
      const baseUrl = getApiBaseUrl();
      console.log(`API 호출 URL: ${baseUrl}/students`);
      
      const response = await fetch(`${baseUrl}/students`);
      if (!response.ok) {
        throw new Error(`학생 데이터 가져오기 실패: ${response.status}`);
      }
      
      const data = await response.json();
      return data.students || [];
    }
  } catch (error) {
    console.error('학생 데이터 가져오기 오류:', error);
    
    // 모든 방법 실패 시 기본 데이터 반환
    console.log('기본 학생 데이터 사용');
    return [
      {
        id: 'default_student_1',
        name: '김철수',
        grade: '3',
        class: 'A',
        status: 'waiting',
        contactInfo: {
          motherPhone: '010-1234-5678'
        },
        locations: {
          arrival: 'location_1',
          departure: 'location_2'
        }
      },
      {
        id: 'default_student_2',
        name: '이영희',
        grade: '2',
        class: 'B',
        status: 'picked_up',
        contactInfo: {
          motherPhone: '010-2345-6789'
        },
        locations: {
          arrival: 'location_3',
          departure: 'location_3'
        }
      }
    ];
  }
};

/**
 * 학생 데이터를 추가하는 함수
 * @param {Object} student 학생 데이터
 * @returns {Promise<Object>} 추가된 학생 데이터
 */
export const addStudent = async (student) => {
  try {
    const apiUrl = getApiUrl('/api/students');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    });
    
    if (!response.ok) {
      throw new Error('학생 추가에 실패했습니다.');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('학생 추가 오류:', error);
    throw error;
  }
};

/**
 * 학생 데이터를 업데이트하는 함수
 * @param {string} studentId 학생 ID
 * @param {Object} studentData 업데이트할 학생 데이터
 * @returns {Promise<Object>} 업데이트된 학생 데이터
 */
export const updateStudent = async (studentId, studentData) => {
  try {
    const apiUrl = getApiUrl(`/api/students/${studentId}`);
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    
    if (!response.ok) {
      throw new Error('학생 업데이트에 실패했습니다.');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('학생 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 학생 데이터를 삭제하는 함수
 * @param {string} studentId 학생 ID
 * @returns {Promise<void>}
 */
export const deleteStudent = async (studentId) => {
  try {
    const apiUrl = getApiUrl(`/api/students/${studentId}`);
    const response = await fetch(apiUrl, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('학생 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('학생 삭제 오류:', error);
    throw error;
  }
};

/**
 * 위치 데이터를 가져오는 함수
 * @returns {Promise<Array>} 위치 목록
 */
export const fetchLocations = async () => {
  try {
    console.log('Firebase Firestore에서 위치 데이터 가져오기 시도');
    
    // 먼저 Firestore에서 직접 데이터 가져오기 시도
    try {
      const locationsCollection = collection(db, 'locations');
      const locationsSnapshot = await getDocs(locationsCollection);
      const locationsList = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Firebase Firestore에서 위치 데이터 가져오기 성공:', locationsList.length);
      return { locations: locationsList };
    } catch (firestoreError) {
      console.error('Firebase Firestore 위치 데이터 접근 오류:', firestoreError);
      
      // Firestore 접근 실패 시 API 호출 시도
      const baseUrl = getApiBaseUrl();
      console.log(`위치 데이터 API 호출 URL: ${baseUrl}/locations`);
      
      const response = await fetch(`${baseUrl}/locations`);
      if (!response.ok) {
        throw new Error(`위치 데이터 가져오기 실패: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('위치 데이터 가져오기 오류:', error);
    
    // 모든 방법 실패 시 기본 데이터 반환
    console.log('기본 위치 데이터 사용');
    return {
      locations: [
        {
          id: "location_1",
          name: "빛누리초등학교",
          address: "나주시 빛가람동 빛누리로 25",
          type: "school",
          coordinates: {
            lat: 35.0175,
            lng: 126.7873
          }
        },
        {
          id: "location_2",
          name: "에시앙 아파트",
          address: "나주시 빛가람동 에시앙로 123",
          type: "apartment",
          coordinates: {
            lat: 35.0159,
            lng: 126.7892
          }
        },
        {
          id: "location_3",
          name: "중흥아파트",
          address: "나주시 빛가람동 중흥로 456",
          type: "apartment",
          coordinates: {
            lat: 35.0195,
            lng: 126.7845
          }
        },
        {
          id: "location_4",
          name: "빛가람초등학교",
          address: "나주시 빛가람동 빛가람로 78",
          type: "school",
          coordinates: {
            lat: 35.0210,
            lng: 126.7830
          }
        },
        {
          id: "location_5",
          name: "한빛유치원",
          address: "나주시 빛가람동 한빛로 90",
          type: "kindergarten",
          coordinates: {
            lat: 35.0185,
            lng: 126.7860
          }
        }
      ]
    };
  }
};

/**
 * 수업 정보를 가져오는 함수
 * @returns {Promise<Object>} 수업 정보
 */
export const fetchClassInfo = async () => {
  try {
    console.log('Firebase Firestore에서 수업 정보 가져오기 시도');
    
    // 먼저 Firestore에서 직접 데이터 가져오기 시도
    try {
      const classesCollection = collection(db, 'classes');
      const classesSnapshot = await getDocs(classesCollection);
      const classesList = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Firebase Firestore에서 수업 정보 가져오기 성공:', classesList.length);
      return { classes: classesList };
    } catch (firestoreError) {
      console.error('Firebase Firestore 수업 정보 접근 오류:', firestoreError);
      
      // Firestore 접근 실패 시 API 호출 시도
      const baseUrl = getApiBaseUrl();
      console.log(`수업 정보 API 호출 URL: ${baseUrl}/class-info`);
      
      const response = await fetch(`${baseUrl}/class-info`);
      if (!response.ok) {
        throw new Error(`수업 정보 가져오기 실패: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('수업 정보 가져오기 오류:', error);
    
    // 모든 방법 실패 시 기본 데이터 반환
    console.log('기본 수업 정보 사용');
    return {
      classes: [
        {
          id: "class_1",
          name: "발레 기초",
          dayOfWeek: "월",
          startTime: "15:00",
          endTime: "16:00",
          teacher: "김선생",
          room: "A",
          maxStudents: 10
        },
        {
          id: "class_2",
          name: "발레 중급",
          dayOfWeek: "수",
          startTime: "16:00",
          endTime: "17:30",
          teacher: "이선생",
          room: "B",
          maxStudents: 8
        },
        {
          id: "class_3",
          name: "발레 고급",
          dayOfWeek: "금",
          startTime: "17:00",
          endTime: "19:00",
          teacher: "박선생",
          room: "A",
          maxStudents: 6
        }
      ]
    };
  }
}; 