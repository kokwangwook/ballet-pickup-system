/**
 * 학생 목록을 필터링하는 함수
 * @param {Array} students 학생 목록
 * @param {number} dayOfWeek 요일 번호 (1-5)
 * @param {string} classTime 수업 시간
 * @returns {Array} 필터링된 학생 목록
 */
export const filterStudentsByDayAndTime = (students, dayOfWeek, classTime) => {
  if (!students || !Array.isArray(students)) return [];
  
  return students.filter(student => {
    // 비활성화된 학생 제외
    if (!student.isActive) return false;
    
    // 해당 요일에 수업이 있는지 확인
    const daySchedule = student.schedule?.[dayOfWeek];
    if (!daySchedule) return false;
    
    // 해당 시간에 수업이 있는지 확인
    return daySchedule.classTime === classTime;
  });
};

/**
 * 학생 목록을 정렬하는 함수
 * @param {Array} students 학생 목록
 * @param {string} sortBy 정렬 기준 ('name', 'classTime' 등)
 * @param {boolean} ascending 오름차순 여부
 * @returns {Array} 정렬된 학생 목록
 */
export const sortStudents = (students, sortBy = 'name', ascending = true) => {
  if (!students || !Array.isArray(students)) return [];
  
  const sortedStudents = [...students];
  
  sortedStudents.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'name':
        valueA = a.name || '';
        valueB = b.name || '';
        break;
      case 'classTime':
        valueA = a.classTime || '';
        valueB = b.classTime || '';
        break;
      case 'shortNumber':
        valueA = parseInt(a.shortNumber || '0', 10);
        valueB = parseInt(b.shortNumber || '0', 10);
        break;
      default:
        valueA = a[sortBy] || '';
        valueB = b[sortBy] || '';
    }
    
    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
  
  return sortedStudents;
};

/**
 * 학생 데이터 유효성 검사 함수
 * @param {Object} student 학생 데이터
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateStudent = (student) => {
  const errors = {};
  
  if (!student.name || student.name.trim() === '') {
    errors.name = '이름은 필수 입력 항목입니다.';
  }
  
  if (!student.shortNumber || student.shortNumber.trim() === '') {
    errors.shortNumber = '단축번호는 필수 입력 항목입니다.';
  }
  
  // 최소한 하나의 요일에 수업 일정이 있어야 함
  const hasSchedule = Object.values(student.schedule || {}).some(
    day => day && day.classTime
  );
  
  if (!hasSchedule) {
    errors.schedule = '최소한 하나의 요일에 수업 일정을 설정해야 합니다.';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 