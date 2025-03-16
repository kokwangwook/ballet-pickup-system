/**
 * 학생 폼 유효성 검사 함수
 * @param {Object} formData 폼 데이터
 * @returns {Object} 에러 메시지 객체
 */
export const validateStudentForm = (formData) => {
  const errors = {};
  
  // 필수 필드 검사
  if (!formData.name || !formData.name.trim()) {
    errors.name = '이름은 필수입니다';
  }
  
  if (!formData.shortId) {
    errors.shortId = '단축번호는 필수입니다';
  }
  
  if (!formData.classDays || formData.classDays.length === 0) {
    errors.classDays = '수업요일을 선택해주세요';
  }
  
  // 전화번호 형식 검사
  const phoneRegex = /^(\d{2,3}-\d{3,4}-\d{4})?$/;
  
  if (formData.motherPhone && !phoneRegex.test(formData.motherPhone)) {
    errors.motherPhone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
  }
  
  if (formData.fatherPhone && !phoneRegex.test(formData.fatherPhone)) {
    errors.fatherPhone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
  }
  
  if (formData.studentPhone && !phoneRegex.test(formData.studentPhone)) {
    errors.studentPhone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
  }
  
  if (formData.otherPhone && !phoneRegex.test(formData.otherPhone)) {
    errors.otherPhone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
  }
  
  // 시간 형식 검사
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  // 요일별 등원 시간 검사
  if (formData.arrivalTimes) {
    Object.entries(formData.arrivalTimes).forEach(([day, time]) => {
      if (time && !timeRegex.test(time)) {
        if (!errors.arrivalTimes) errors.arrivalTimes = {};
        errors.arrivalTimes[day] = '올바른 시간 형식이 아닙니다 (예: 15:30)';
      }
    });
  }
  
  // 요일별 하원 시간 검사
  if (formData.departureTimes) {
    Object.entries(formData.departureTimes).forEach(([day, time]) => {
      if (time && !timeRegex.test(time)) {
        if (!errors.departureTimes) errors.departureTimes = {};
        errors.departureTimes[day] = '올바른 시간 형식이 아닙니다 (예: 16:30)';
      }
    });
  }
  
  return errors;
};

/**
 * 시간 문자열 형식 검사 함수
 * @param {string} timeString 시간 문자열
 * @returns {boolean} 유효한 형식인지 여부
 */
export const isValidTimeFormat = (timeString) => {
  if (!timeString) return true; // 빈 값은 유효하다고 간주
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

/**
 * 전화번호 형식 검사 함수
 * @param {string} phoneString 전화번호 문자열
 * @returns {boolean} 유효한 형식인지 여부
 */
export const isValidPhoneFormat = (phoneString) => {
  if (!phoneString) return true; // 빈 값은 유효하다고 간주
  
  const phoneRegex = /^(\d{2,3}-\d{3,4}-\d{4})$/;
  return phoneRegex.test(phoneString);
};

/**
 * 전화번호 형식 변환 함수
 * @param {string} phoneString 전화번호 문자열
 * @returns {string} 형식이 변환된 전화번호
 */
export const formatPhoneNumber = (phoneString) => {
  if (!phoneString) return '';
  
  // 숫자만 추출
  const numbers = phoneString.replace(/\D/g, '');
  
  // 숫자가 10자리 또는 11자리인 경우에만 형식 변환
  if (numbers.length === 10) {
    return `${numbers.substring(0, 3)}-${numbers.substring(3, 6)}-${numbers.substring(6)}`;
  } else if (numbers.length === 11) {
    return `${numbers.substring(0, 3)}-${numbers.substring(3, 7)}-${numbers.substring(7)}`;
  }
  
  // 그 외의 경우 원래 값 반환
  return phoneString;
}; 