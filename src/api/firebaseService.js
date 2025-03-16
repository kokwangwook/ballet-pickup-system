/**
 * Firebase 서비스 모듈
 * 학생, 위치, 수업 정보 등의 데이터를 가져오고 관리하는 함수들을 제공합니다.
 */

/**
 * 모든 학생 데이터를 가져오는 함수
 * @returns {Promise<Array>} 학생 목록
 */
export const fetchStudents = async () => {
  try {
    const response = await fetch('/api/students');
    if (!response.ok) {
      throw new Error('학생 데이터를 가져오는데 실패했습니다.');
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
    const response = await fetch('/api/students', {
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
    const response = await fetch(`/api/students/${studentId}`, {
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
    const response = await fetch(`/api/students/${studentId}`, {
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
    const response = await fetch('/api/locations');
    if (!response.ok) {
      throw new Error('위치 데이터를 가져오는데 실패했습니다.');
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
    const response = await fetch('/api/class-info');
    if (!response.ok) {
      throw new Error('수업 정보를 가져오는데 실패했습니다.');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('수업 정보 가져오기 오류:', error);
    throw error;
  }
}; 