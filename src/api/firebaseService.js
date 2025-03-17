/**
 * Firebase 서비스 모듈
 * 학생, 위치, 수업 정보 등의 데이터를 가져오고 관리하는 함수들을 제공합니다.
 */

import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';

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
    console.log('DB 인스턴스:', db ? '초기화됨' : '초기화되지 않음');
    
    // 로컬 API 엔드포인트 경로 구성
    const apiUrl = getApiUrl('/api/students');
    console.log('학생 데이터 API URL:', apiUrl);
    
    try {
      // API 먼저 시도
      console.log('API에서 학생 데이터 가져오기 시도');
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API에서 학생 데이터 가져오기 성공:', data.length || 0);
        return data;
      } else {
        console.warn(`API 응답 오류 (${response.status}): ${response.statusText}`);
        // API가 실패하면 Firebase로 폴백
      }
    } catch (apiError) {
      console.error('API 호출 오류:', apiError);
      // API가 실패하면 Firebase로 폴백
    }
    
    // Firebase에서 시도
    try {
      // 먼저 Firestore 연결 테스트
      const testDoc = await getDoc(doc(db, 'test', 'test-connection'));
      console.log('Firestore 연결 테스트:', testDoc.exists() ? '성공' : '문서 없음');
    } catch (connError) {
      console.error('Firestore 연결 테스트 실패:', connError);
    }
    
    const studentsCollection = collection(db, 'students');
    console.log('students 컬렉션 참조 생성됨');
    
    const studentsSnapshot = await getDocs(studentsCollection);
    console.log('students 컬렉션 쿼리 완료, 문서 수:', studentsSnapshot.size);
    
    if (studentsSnapshot.empty) {
      console.warn('학생 데이터가 없습니다! 컬렉션이 비어 있거나 권한이 없을 수 있습니다.');
      
      // 기본 더미 데이터 반환
      console.log('기본 학생 데이터 사용');
      return [
        {
          id: "student_1",
          name: "김민준",
          grade: "초등 3학년",
          contact: "010-1234-5678",
          parentName: "김부모",
          homeLocation: "강남구 대치동",
          classTime: "15:00",
          status: "등원"
        },
        {
          id: "student_2",
          name: "이서연",
          grade: "초등 2학년",
          contact: "010-2345-6789",
          parentName: "이부모",
          homeLocation: "서초구 반포동",
          classTime: "16:00",
          status: "하원"
        },
        {
          id: "student_3",
          name: "박지민",
          grade: "초등 4학년",
          contact: "010-3456-7890",
          parentName: "박부모",
          homeLocation: "강남구 역삼동",
          classTime: "17:00",
          status: "대기"
        }
      ];
    }
    
    const studentsList = studentsSnapshot.docs.map(doc => {
      console.log('학생 문서 ID:', doc.id);
      return {
        id: doc.id,
        ...doc.data()
      };
    });
    
    console.log('Firebase Firestore에서 학생 데이터 가져오기 성공:', studentsList.length);
    return studentsList;
  } catch (error) {
    console.error('Firebase Firestore 학생 데이터 접근 오류:', error);
    console.error('오류 세부 정보:', error.code, error.message);
    console.error('오류 스택:', error.stack);
    
    // 오류 발생 시 기본 데이터 반환
    console.log('오류 발생으로 기본 학생 데이터 사용');
    return [
      {
        id: "student_1",
        name: "김민준",
        grade: "초등 3학년",
        contact: "010-1234-5678",
        parentName: "김부모",
        homeLocation: "강남구 대치동",
        classTime: "15:00",
        status: "등원"
      },
      {
        id: "student_2",
        name: "이서연",
        grade: "초등 2학년",
        contact: "010-2345-6789",
        parentName: "이부모",
        homeLocation: "서초구 반포동",
        classTime: "16:00",
        status: "하원"
      },
      {
        id: "student_3",
        name: "박지민",
        grade: "초등 4학년",
        contact: "010-3456-7890",
        parentName: "박부모",
        homeLocation: "강남구 역삼동",
        classTime: "17:00",
        status: "대기"
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
    
    const locationsCollection = collection(db, 'locations');
    const locationsSnapshot = await getDocs(locationsCollection);
    const locationsList = locationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Firebase Firestore에서 위치 데이터 가져오기 성공:', locationsList.length);
    return { locations: locationsList };
  } catch (error) {
    console.error('Firebase Firestore 위치 데이터 접근 오류:', error);
    throw error; // 오류 전파 - 더미 데이터를 사용하지 않음
  }
};

/**
 * 수업 정보를 가져오는 함수
 * @returns {Promise<Object>} 수업 정보
 */
export const fetchClassInfo = async () => {
  try {
    console.log('Firebase Firestore에서 수업 정보 가져오기 시도');
    
    const classesCollection = collection(db, 'classes');
    const classesSnapshot = await getDocs(classesCollection);
    const classesList = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Firebase Firestore에서 수업 정보 가져오기 성공:', classesList.length);
    
    // 시간별 정렬
    classesList.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    // classTimes 배열 추출
    const classTimes = classesList.map(cls => cls.startTime).filter(time => time);
    
    return { 
      classes: classesList,
      classTimes: classTimes.length > 0 ? classTimes : ["15:00", "16:00", "17:00", "18:00"]
    };
  } catch (error) {
    console.error('Firebase Firestore 수업 정보 접근 오류:', error);
    
    // 기본 데이터 반환
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
      ],
      classTimes: ["15:00", "16:00", "17:00"]
    };
  }
}; 