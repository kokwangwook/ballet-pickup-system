/**
 * Firebase 서비스 모듈
 * 학생, 위치, 수업 정보 등의 데이터를 가져오고 관리하는 함수들을 제공합니다.
 */

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
 * 모든 학생 데이터를 가져오는 함수
 * @returns {Promise<Array>} 학생 목록
 */
export const fetchStudents = async () => {
  try {
    const apiUrl = getApiUrl('/api/students');
    console.log('학생 데이터 API 호출:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`학생 데이터 가져오기 실패: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('학생 데이터 가져오기 오류:', error);
    throw error;
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
    const apiUrl = getApiUrl('/api/locations');
    console.log('위치 데이터 API 호출:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`위치 데이터 가져오기 실패: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('위치 데이터 가져오기 오류:', error);
    throw error;
  }
};

/**
 * 수업 정보를 가져오는 함수
 * @returns {Promise<Object>} 수업 정보
 */
export const fetchClassInfo = async () => {
  try {
    const apiUrl = getApiUrl('/api/class-info');
    console.log('수업 정보 API 호출:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`수업 정보 가져오기 실패: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('수업 정보 가져오기 오류:', error);
    throw error;
  }
}; 