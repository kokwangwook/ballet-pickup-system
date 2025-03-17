import { parse, format } from 'date-fns';
// import { updateStudentStatusInNotion } from '../api/notionService';

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
 * 학생의 등원 상태를 변경하는 함수
 * @param {string} studentId 학생 ID
 * @param {object} arrivalStatus 현재 등원 상태 객체
 * @param {boolean} useNotion Notion API 사용 여부
 * @param {Array} students 학생 목록
 * @returns {object} 변경된 등원 상태 객체
 */
export const toggleArrivalStatus = async (studentId, arrivalStatus, useNotion, students) => {
  const newStatus = { ...arrivalStatus };
  
  // 현재 학생의 상태
  const currentStatus = newStatus[studentId] || 'not_arrived';
  
  // 상태 변경
  let updatedStatus;
  if (currentStatus === 'not_arrived') {
    updatedStatus = 'arrived';
  } else if (currentStatus === 'arrived') {
    updatedStatus = 'in_class';
  } else if (currentStatus === 'in_class') {
    updatedStatus = 'not_arrived';
  } else {
    updatedStatus = 'not_arrived';
  }
  
  // 상태 업데이트
  newStatus[studentId] = updatedStatus;
  
  // 학생 찾기
  const student = students.find(s => s.id === studentId);
  if (student) {
    console.log(`학생 ${student.name}의 등원 상태가 ${updatedStatus}로 변경되었습니다.`);
  }
  
  return newStatus;
};

/**
 * 학생의 하원 상태를 변경하는 함수
 * @param {string} studentId 학생 ID
 * @param {object} departureStatus 현재 하원 상태 객체
 * @param {boolean} useNotion Notion API 사용 여부
 * @param {Array} students 학생 목록
 * @returns {object} 변경된 하원 상태 객체
 */
export const toggleDepartureStatus = async (studentId, departureStatus, useNotion, students) => {
  const newStatus = { ...departureStatus };
  
  // 현재 학생의 상태
  const currentStatus = newStatus[studentId] || 'not_departed';
  
  // 상태 변경
  let updatedStatus;
  if (currentStatus === 'not_departed') {
    updatedStatus = 'ready_to_depart';
  } else if (currentStatus === 'ready_to_depart') {
    updatedStatus = 'departed';
  } else if (currentStatus === 'departed') {
    updatedStatus = 'not_departed';
  } else {
    updatedStatus = 'not_departed';
  }
  
  // 상태 업데이트
  newStatus[studentId] = updatedStatus;
  
  // 학생 찾기
  const student = students.find(s => s.id === studentId);
  if (student) {
    console.log(`학생 ${student.name}의 하원 상태가 ${updatedStatus}로 변경되었습니다.`);
  }
  
  return newStatus;
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