import { format, parse } from 'date-fns';

/**
 * 요일 매핑 객체
 */
export const dayMap = {
  0: '일',
  1: '월',
  2: '화', 
  3: '수',
  4: '목',
  5: '금',
  6: '토'
};

/**
 * 현재 요일을 가져오는 함수 (주말인 경우 월요일 반환)
 * @returns {number} 요일 번호 (1: 월요일, 2: 화요일, ..., 5: 금요일)
 */
export const getCurrentDayOfWeek = () => {
  const today = new Date();
  const jsDay = today.getDay(); // 0(일) - 6(토)
  // 평일(1-5)인 경우 해당 값 반환, 주말인 경우 월요일(1) 반환
  return jsDay >= 1 && jsDay <= 5 ? jsDay : 1;
};

/**
 * 요일 번호에 해당하는 요일명을 반환하는 함수
 * @param {number} dayOfWeek 요일 번호 (0-6)
 * @returns {string} 요일명 ('일', '월', ...)
 */
export const getDayName = (dayOfWeek) => {
  return dayMap[dayOfWeek] || '월';
};

/**
 * 날짜 문자열을 Date 객체로 변환하는 함수
 * @param {string} dateString 날짜 문자열 (예: '2023-01-01')
 * @param {string} formatString 날짜 형식 (예: 'yyyy-MM-dd')
 * @returns {Date} 변환된 Date 객체
 */
export const parseDate = (dateString, formatString = 'yyyy-MM-dd') => {
  if (!dateString) return null;
  try {
    return parse(dateString, formatString, new Date());
  } catch (error) {
    console.error('날짜 변환 오류:', error);
    return null;
  }
};

/**
 * Date 객체를 문자열로 변환하는 함수
 * @param {Date} date Date 객체
 * @param {string} formatString 날짜 형식 (예: 'yyyy-MM-dd')
 * @returns {string} 변환된 날짜 문자열
 */
export const formatDate = (date, formatString = 'yyyy-MM-dd') => {
  if (!date) return '';
  try {
    return format(date, formatString);
  } catch (error) {
    console.error('날짜 형식 변환 오류:', error);
    return '';
  }
}; 