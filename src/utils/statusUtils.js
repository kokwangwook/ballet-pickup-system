import { parse, format } from 'date-fns';
import { updateStudentStatusInNotion } from '../api/notionService';

/**
 * 시간 계산 함수
 * @param {string} classTime 수업 시간 (예: "15:30")
 * @param {Object} classInfo 수업 정보 객체
 * @returns {Object} { arrivalTime, departureTime }
 */
export const calculateTimes = (classTime, classInfo) => {
  // 수업 시간 정보 가져오기
  const { startTime, endTime } = classInfo[classTime] || { startTime: '', endTime: '' };
  
  if (!startTime || !endTime) {
    return { arrivalTime: '', departureTime: '' };
  }
  
  // 등원 시간은 수업 시작 40분 전
  const arrivalTime = calculateArrivalTime(startTime);
  
  // 하원 시간은 수업 종료 50분 후
  const departureTime = calculateDepartureTime(endTime);
  
  return { arrivalTime, departureTime };
};

/**
 * 등원 시간 계산 (수업 시작 40분 전)
 * @param {string} startTime 수업 시작 시간
 * @returns {string} 등원 시간
 */
export const calculateArrivalTime = (startTime) => {
  try {
    const time = parse(startTime, 'HH:mm', new Date());
    time.setMinutes(time.getMinutes() - 40);
    return format(time, 'HH:mm');
  } catch (error) {
    console.error('시간 계산 중 오류가 발생했습니다:', error);
    return startTime;
  }
};

/**
 * 하원 시간 계산 (수업 종료 50분 후)
 * @param {string} endTime 수업 종료 시간
 * @returns {string} 하원 시간
 */
export const calculateDepartureTime = (endTime) => {
  try {
    const time = parse(endTime, 'HH:mm', new Date());
    time.setMinutes(time.getMinutes() + 50);
    return format(time, 'HH:mm');
  } catch (error) {
    console.error('시간 계산 중 오류가 발생했습니다:', error);
    return endTime;
  }
};

/**
 * 등원 상태 변경 함수
 * @param {string} studentId 학생 ID
 * @param {Object} arrivalStatus 현재 등원 상태 객체
 * @param {boolean} useNotion 노션 API 사용 여부
 * @param {Array} students 학생 목록
 * @returns {Object} 업데이트된 등원 상태 객체
 */
export const toggleArrivalStatus = async (studentId, arrivalStatus, useNotion, students) => {
  try {
    const newStatus = !arrivalStatus[studentId];
    
    // 노션 API 사용 시
    if (useNotion) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        await updateStudentStatusInNotion(student.id, '등원 상태', newStatus);
      }
    }
    
    // 상태 업데이트
    return {
      ...arrivalStatus,
      [studentId]: newStatus
    };
  } catch (error) {
    console.error('등원 상태 변경 중 오류가 발생했습니다:', error);
    throw new Error('등원 상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};

/**
 * 하원 상태 변경 함수
 * @param {string} studentId 학생 ID
 * @param {Object} departureStatus 현재 하원 상태 객체
 * @param {boolean} useNotion 노션 API 사용 여부
 * @param {Array} students 학생 목록
 * @returns {Object} 업데이트된 하원 상태 객체
 */
export const toggleDepartureStatus = async (studentId, departureStatus, useNotion, students) => {
  try {
    const newStatus = !departureStatus[studentId];
    
    // 노션 API 사용 시
    if (useNotion) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        await updateStudentStatusInNotion(student.id, '하원 상태', newStatus);
      }
    }
    
    // 상태 업데이트
    return {
      ...departureStatus,
      [studentId]: newStatus
    };
  } catch (error) {
    console.error('하원 상태 변경 중 오류가 발생했습니다:', error);
    throw new Error('하원 상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};

/**
 * 학생별 위치 정보 변경 함수
 * @param {string} studentId 학생 ID
 * @param {string} locationType 위치 유형 ('arrival' 또는 'departure')
 * @param {string} locationId 위치 ID
 * @param {Object} studentLocations 현재 학생 위치 객체
 * @returns {Object} 업데이트된 학생 위치 객체
 */
export const updateStudentLocation = (studentId, locationType, locationId, studentLocations) => {
  return {
    ...studentLocations,
    [studentId]: {
      ...studentLocations[studentId],
      [locationType]: locationId
    }
  };
}; 