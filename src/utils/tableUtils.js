import { format } from 'date-fns';

/**
 * 요일에 따른 색상을 반환하는 함수
 * @param {number} day 요일 번호 (0-6)
 * @returns {string} 색상 코드
 */
export const getDayColor = (day) => {
  switch (day) {
    case 0: return '#FF5252'; // 일요일 - 빨간색
    case 6: return '#2979FF'; // 토요일 - 파란색
    default: return '#000000'; // 평일 - 검은색
  }
};

/**
 * 요일에 따른 호버 색상을 반환하는 함수
 * @param {number} day 요일 번호 (0-6)
 * @returns {string} 호버 색상 코드
 */
export const getDayHoverColor = (day) => {
  switch (day) {
    case 0: return '#FF8A80'; // 일요일 - 연한 빨간색
    case 6: return '#82B1FF'; // 토요일 - 연한 파란색
    default: return '#757575'; // 평일 - 회색
  }
};

/**
 * 시간 문자열을 분 단위로 변환하는 함수
 * @param {string} timeString 시간 문자열 (예: "15:30")
 * @returns {number} 분 단위 시간
 */
export const parseTimeToMinutes = (timeString) => {
  if (!timeString) return 0;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 수업 시간을 표준화하는 함수
 * @param {string} time 수업 시간
 * @returns {string} 표준화된 수업 시간
 */
export const normalizeClassTime = (time) => {
  if (!time) return '';
  
  // 시간 형식 표준화
  if (time === '16:40') return '16:30';
  if (time === '17:40') return '17:30';
  if (time === '18:40') return '18:30';
  
  return time;
};

/**
 * 학생 목록을 도착 시간 기준으로 정렬하는 함수
 * @param {Array} studentList 학생 목록
 * @param {string} currentDayKorean 현재 선택된 요일 (한글)
 * @returns {Array} 정렬된 학생 목록
 */
export const sortStudentsByArrivalTime = (studentList, currentDayKorean) => {
  if (!studentList || !Array.isArray(studentList)) return [];
  
  return [...studentList].sort((a, b) => {
    // a 학생의 등원 시간 (현재 요일 기준)
    let aArrivalTime = null;
    if (a.arrivalTimes && a.arrivalTimes[currentDayKorean]) {
      aArrivalTime = a.arrivalTimes[currentDayKorean];
    } else if (a.arrivalTime) {
      aArrivalTime = a.arrivalTime;
    }
    
    // b 학생의 등원 시간 (현재 요일 기준)
    let bArrivalTime = null;
    if (b.arrivalTimes && b.arrivalTimes[currentDayKorean]) {
      bArrivalTime = b.arrivalTimes[currentDayKorean];
    } else if (b.arrivalTime) {
      bArrivalTime = b.arrivalTime;
    }
    
    // 등원 시간이 없는 경우 맨 뒤로 정렬
    if (!aArrivalTime && bArrivalTime) return 1;
    if (aArrivalTime && !bArrivalTime) return -1;
    if (!aArrivalTime && !bArrivalTime) {
      // 둘 다 시간이 없는 경우 이름으로 정렬
      return (a.name || '').localeCompare(b.name || '');
    }
    
    // 시간 문자열을 분 단위 숫자로 변환하여 비교
    const aMinutes = parseTimeToMinutes(aArrivalTime);
    const bMinutes = parseTimeToMinutes(bArrivalTime);
    
    if (aMinutes !== bMinutes) {
      return aMinutes - bMinutes; // 오름차순 정렬 (빠른 시간이 먼저)
    }
    
    // 등원 시간이 같은 경우 이름으로 가나다순 정렬
    return (a.name || '').localeCompare(b.name || '');
  });
};

/**
 * 학생 목록을 수업 시간별로 그룹화하는 함수
 * @param {Array} students 학생 목록
 * @param {number} selectedDayOfWeek 선택된 요일 (0-6)
 * @param {Function} getDayName 요일 번호를 요일 이름으로 변환하는 함수
 * @returns {Array} 수업 시간별로 그룹화된 학생 목록
 */
export const groupStudentsByClass = (students, selectedDayOfWeek, getDayName) => {
  if (!students || !Array.isArray(students)) return [];
  
  const groups = {};
  const currentDayKorean = getDayName ? getDayName(selectedDayOfWeek) : '';
  
  students.forEach(student => {
    // 1. 수업 시간 목록 초기화
    let classTimeList = [];
    
    // 2. classes 배열이 있는 경우
    if (student.classes && student.classes.length > 0) {
      classTimeList = [...student.classes];
    } 
    // 3. classTimes 객체가 있는 경우
    else if (student.classTimes && typeof student.classTimes === 'object') {
      // 현재 선택된 요일의 수업 시간이 있으면 그것만 사용
      if (student.classTimes[currentDayKorean] && student.classTimes[currentDayKorean].trim() !== '') {
        classTimeList.push(student.classTimes[currentDayKorean]);
      } 
      // 없으면 다른 요일의 수업 시간들 중에서 중복되지 않는 것들 추가
      else {
        Object.entries(student.classTimes).forEach(([day, time]) => {
          if (time && time.trim() !== '' && !classTimeList.includes(time)) {
            classTimeList.push(time);
          }
        });
      }
    }
    // 4. classTime 문자열이 있는 경우
    else if (student.classTime && student.classTime.trim() !== '') {
      classTimeList.push(student.classTime);
    }
    
    // 수업 시간이 없으면 콘솔에 경고
    if (classTimeList.length === 0) {
      console.warn(`학생 ${student.name}(ID: ${student.id})에 수업 시간 정보가 없습니다.`);
      return;
    }
    
    // 각 수업 시간별로 학생 그룹화
    classTimeList.forEach(classTime => {
      // 시간 형식 표준화
      const normalizedTime = normalizeClassTime(classTime);
      
      if (!groups[normalizedTime]) {
        groups[normalizedTime] = [];
      }
      
      // 학생 정보에 수업 요일 추가
      const studentWithDays = {
        ...student,
        displayClassDays: student.classDays || []
      };
      
      // 이미 추가되지 않은 경우에만 추가
      if (!groups[normalizedTime].some(s => s.id === student.id)) {
        groups[normalizedTime].push(studentWithDays);
      }
    });
  });
  
  // 각 수업 시간 그룹 내에서 학생들을 등원 시간 순으로 정렬
  Object.keys(groups).forEach(classTime => {
    groups[classTime] = sortStudentsByArrivalTime(groups[classTime], currentDayKorean);
  });
  
  // 시간 순서대로 정렬하여 반환
  return Object.keys(groups)
    .sort()
    .map(classTime => ({
      classTime,
      students: groups[classTime]
    }));
};

/**
 * 날짜를 포맷팅하는 함수
 * @param {Date} date 날짜 객체
 * @param {string} formatString 포맷 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDateForDisplay = (date, formatString = 'yyyy.MM.dd') => {
  if (!date) return '';
  
  try {
    return format(date, formatString);
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '';
  }
}; 