import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { students as mockStudents, classInfo as mockClassInfo, studentLocations as initialStudentLocations } from '../data/mockData';
import { format, parse } from 'date-fns';
import { fetchStudentsFromNotion, updateStudentStatusInNotion, fetchClassInfoFromNotion } from '../api/notionService';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, setDoc } from "firebase/firestore";
import { db } from '../config/firebase';

// 컨텍스트 생성
export const PickupContext = createContext();

// 컨텍스트 훅
export const usePickup = () => useContext(PickupContext);

// location ID를 숫자로 변환하는 유틸리티 함수
function parseLocationId(locationId) {
  if (locationId === '' || locationId === null || locationId === undefined) {
    return null;
  }
  
  // 위치 ID를 항상 문자열로 처리 (숫자로 변환하지 않음)
  return String(locationId).trim();
}

// 컨텍스트 제공자 컴포넌트
export const PickupProvider = ({ children }) => {
  // 요일 매핑 변수를 상단에 정의
  const dayMap = {
    0: '일',
    1: '월',
    2: '화', 
    3: '수',
    4: '목',
    5: '금',
    6: '토'
  };
  
  // 선택된 날짜 상태
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 선택된 요일 상태 (1: 월요일, 2: 화요일, ..., 5: 금요일)
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(() => {
    const today = new Date();
    const jsDay = today.getDay(); // 0(일) - 6(토)
    // 평일(1-5)인 경우 해당 값 반환, 주말인 경우 월요일(1) 반환
    return jsDay >= 1 && jsDay <= 5 ? jsDay : 1;
  });
  
  // 선택된 수업 시간 (기본값은 모든 시간)
  const [selectedClassTime, setSelectedClassTime] = useState('all');
  
  // 학생 데이터 상태
  const [students, setStudents] = useState([]);
  
  // 모든 학생 데이터 (필터링 전)
  const [allStudents, setAllStudents] = useState([]);
  
  // 처리된 학생 데이터
  const [processedStudents, setProcessedStudents] = useState([]);
  
  // 수업 정보 상태
  const [classInfo, setClassInfo] = useState({
    "15:30": {
      startTime: "15:30",
      endTime: "16:30",
      locations: {
        1: "학원 앞",
        2: "공원 입구",
        3: "중앙역"
      }
    },
    "16:30": {
      startTime: "16:30",
      endTime: "17:30",
      locations: {
        1: "학원 앞",
        2: "공원 입구",
        3: "중앙역"
      }
    },
    "17:30": {
      startTime: "17:30",
      endTime: "18:30",
      locations: {
        1: "학원 앞",
        2: "공원 입구",
        3: "중앙역"
      }
    },
    "18:30": {
      startTime: "18:30",
      endTime: "19:30",
      locations: {
        1: "학원 앞",
        2: "공원 입구",
        3: "중앙역"
      }
    }
  });
  
  // 학생 위치 상태
  const [studentLocations, setStudentLocations] = useState({
    arrival: {},
    departure: {}
  });
  
  // 요일별 학생 위치 상태 추가
  const [dailyStudentLocations, setDailyStudentLocations] = useState({
    '일': { arrival: {}, departure: {} },
    '월': { arrival: {}, departure: {} },
    '화': { arrival: {}, departure: {} },
    '수': { arrival: {}, departure: {} },
    '목': { arrival: {}, departure: {} },
    '금': { arrival: {}, departure: {} },
    '토': { arrival: {}, departure: {} }
  });
  
  // 등하원 상태
  const [arrivalStatus, setArrivalStatus] = useState({});
  const [departureStatus, setDepartureStatus] = useState({});
  
  // 로딩, 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 노션 사용 여부 (노션 API가 실패하면 모의 데이터로 폴백)
  const [useNotion, setUseNotion] = useState(true);
  const [stations, setStations] = useState([]); // 정류장 정보 상태 추가

  // 처리 중인 학생 ID를 추적하는 ref 추가
  const processingStatus = useRef([]);

  // 날짜 포맷 변환 함수
  const formatDate = (date) => format(date, 'yyyy.MM.dd');
  
  // 요일 이름 가져오기
  const getDayName = (dayIndex) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    // 범위 체크
    if (dayIndex < 0 || dayIndex > 6) {
      return '유효하지 않은 요일';
    }
    return days[dayIndex];
  };
  
  // 날짜 변경 시 요일도 함께 업데이트
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // JavaScript의 getDay()는 0(일요일)부터 시작하므로 월요일은 1
    const jsDay = date.getDay();
    // 1(월요일)부터 5(금요일)까지만 유효하게 처리
    const workday = jsDay >= 1 && jsDay <= 5 ? jsDay : 1;
    setSelectedDayOfWeek(workday);
    filterStudentsByDay(workday, allStudents);
  };
  
  // 요일에 따라 학생 필터링
  const filterStudentsByDay = (dayIndex, studentList) => {
    console.log(`요일별 필터링: ${getDayName(dayIndex)}요일, 전체 학생 수: ${studentList.length}`);
    
    // 활성 상태인 학생만 필터링 - isActive가 명시적으로 false인 학생 제외
    const activeStudents = studentList.filter(student => {
      // 퇴원 처리된 학생(isActive가 false)은 제외
      if (student.isActive === false) {
        console.log(`퇴원 처리된 학생 제외 (filterStudentsByDay): ${student.name}`);
        return false;
      }
      return true;
    });
    
    console.log(`활성 상태인 학생 수: ${activeStudents.length}명`);
    
    // 모든 요일에 동일한 수업 시간이 적용되므로 모든 학생을 표시
    // 단, UI에는 현재 선택된 요일을 표시함
    setStudents(activeStudents);
    
    // 로그로 수업 시간 확인
    const allClassTimes = new Set();
    activeStudents.forEach(student => {
      if (student.classes) {
        student.classes.forEach(classTime => {
          allClassTimes.add(classTime);
        });
      }
    });
    
    console.log('모든 수업 시간 목록:', Array.from(allClassTimes));
    console.log(`${getDayName(dayIndex)}요일 수업 진행 중: 총 ${activeStudents.length}명의 학생`);
  };
  
  // 요일 및 수업 시간에 따라 학생 필터링
  const filterStudents = () => {
    console.log(`필터링 시작: ${getDayName(selectedDayOfWeek)}요일, 수업 시간: ${selectedClassTime}, 전체 학생 수: ${allStudents.length}`);
    
    // 데이터가 없으면 빈 배열 반환
    if (!allStudents || allStudents.length === 0) {
      console.warn("필터링할 학생 데이터가 없습니다.");
      setStudents([]);
      return;
    }
    
    // 활성 상태인 학생만 필터링 - isActive가 명시적으로 false인 학생 제외
    let filteredStudents = allStudents.filter(student => {
      // 퇴원 처리된 학생(isActive가 false)은 제외
      if (student.isActive === false) {
        console.log(`퇴원 처리된 학생 제외 (filterStudents): ${student.name}`);
        return false;
      }
      return true;
    });
    
    console.log(`활성 상태인 학생 수: ${filteredStudents.length}명`);
    
    // 현재 요일에 맞는 학생 필터링
    filteredStudents = filteredStudents.filter(student => {
      // classDays 속성이 없거나 비어있는 경우에는 모든 요일에 표시
      if (!student.classDays || student.classDays.length === 0) return true;
      
      // 현재 선택된 요일이 학생의 수업 요일에 포함되는지 확인
      return student.classDays.includes(dayMap[selectedDayOfWeek]);
    });
    
    console.log(`${getDayName(selectedDayOfWeek)}요일 학생 필터링 결과: ${filteredStudents.length}명`);
    
    // 특정 수업 시간이 선택된 경우만 추가 필터링 적용
    if (selectedClassTime !== 'all' && filteredStudents.length > 0) {
      filteredStudents = filteredStudents.filter(student => {
        // 시간 일치 여부를 확인하는 변수
        let matchesTime = false;
        
        // 1. classTime 속성 확인 (단일 문자열)
        if (student.classTime === selectedClassTime) {
          matchesTime = true;
        }
        
        // 2. classes 배열 확인 (배열에 시간이 포함되어 있는지)
        if (!matchesTime && student.classes && Array.isArray(student.classes)) {
          if (student.classes.includes(selectedClassTime)) {
            matchesTime = true;
          }
        }
        
        // 디버깅을 위한 로그
        if (matchesTime) {
          console.log(`학생 ${student.name}(${student.id})의 수업 시간이 ${selectedClassTime}와 일치합니다.`);
        }
        
        return matchesTime;
      });
      
      console.log(`${selectedClassTime} 시간대 학생 필터링 결과: ${filteredStudents.length}명`);
    } else {
      console.log("모든 시간대 학생 표시");
    }
    
    setStudents(filteredStudents);
  };
  
  // 요일 변경 처리
  const handleDayChange = (dayIndex) => {
    // 0-6 범위의 dayIndex만 허용
    if (dayIndex < 0 || dayIndex > 6) {
      console.warn(`유효하지 않은 요일 인덱스: ${dayIndex}`);
      return;
    }
    
    console.log(`요일 변경: ${getDayName(dayIndex)}요일`);
    
    // 오늘 날짜 기준으로 해당 요일의 날짜 계산
    const today = new Date();
    const currentJsDay = today.getDay(); // 0(일) - 6(토)
    const dayDiff = dayIndex - currentJsDay;
    const newDate = new Date(today);
    newDate.setDate(today.getDate() + dayDiff);
    
    setSelectedDate(newDate);
    setSelectedDayOfWeek(dayIndex);
    
    // 상태 업데이트 후 필터링 실행을 위해 setTimeout 사용
    setTimeout(() => {
      console.log(`변경된 요일로 필터링 실행: ${getDayName(dayIndex)}요일`);
      
      // 활성 상태인 학생만 필터링 - isActive가 명시적으로 false인 학생 제외
      let activeStudents = allStudents.filter(student => {
        // 퇴원 처리된 학생(isActive가 false)은 제외
        if (student.isActive === false) {
          console.log(`퇴원 처리된 학생 제외 (handleDayChange): ${student.name}`);
          return false;
        }
        return true;
      });
      
      console.log(`활성 상태인 학생 수: ${activeStudents.length}명`);
      
      // 현재 요일에 맞는 학생만 필터링
      let filteredByDay = activeStudents.filter(student => {
        if (!student.classDays || student.classDays.length === 0) return true;
        return student.classDays.includes(dayMap[dayIndex]);
      });
      
      // 선택된 수업 시간에 맞는 학생만 추가 필터링
      if (selectedClassTime !== 'all') {
        filteredByDay = filteredByDay.filter(student => {
          // 1. classTime 속성 확인
          if (student.classTime === selectedClassTime) return true;
          
          // 2. classes 배열 확인
          if (student.classes && Array.isArray(student.classes)) {
            return student.classes.includes(selectedClassTime);
          }
          
          return false;
        });
      }
      
      console.log(`${getDayName(dayIndex)}요일 최종 필터링 결과: ${filteredByDay.length}명의 학생`);
      setStudents(filteredByDay);
    }, 0);
  };
  
  // 수업 시간 변경 처리
  const handleClassTimeChange = (classTime) => {
    console.log(`수업 시간 변경: ${classTime}`);
    setSelectedClassTime(classTime);
    
    // 상태 업데이트 후 필터링 실행을 위해 setTimeout 사용
    setTimeout(() => {
      console.log(`변경된 수업 시간으로 필터링 실행: ${classTime}`);
      
      // 활성 상태인 학생만 필터링
      let activeStudents = allStudents.filter(student => {
        // 퇴원 처리된 학생(isActive가 false)은 제외
        if (student.isActive === false) {
          console.log(`퇴원 처리된 학생 제외 (handleClassTimeChange): ${student.name}`);
          return false;
        }
        return true;
      });
      
      console.log(`활성 상태인 학생 수: ${activeStudents.length}명`);
      
      // 현재 요일에 맞는 학생만 필터링
      let dayFilteredStudents = activeStudents.filter(student => {
        if (!student.classDays || student.classDays.length === 0) return true;
        return student.classDays.includes(dayMap[selectedDayOfWeek]);
      });
      
      // 선택된 수업 시간에 맞는 학생만 필터링
      if (classTime !== 'all') {
        dayFilteredStudents = dayFilteredStudents.filter(student => {
          // 1. classTime 속성 확인
          if (student.classTime === classTime) return true;
          
          // 2. classes 배열 확인
          if (student.classes && Array.isArray(student.classes)) {
            return student.classes.includes(classTime);
          }
          
          return false;
        });
      }
      
      console.log(`시간 필터링 결과: ${dayFilteredStudents.length}명의 학생`);
      setStudents(dayFilteredStudents);
    }, 0);
  };
  
  // 시간 계산 함수
  const calculateTimes = (classTime) => {
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
  
  // 등원 시간 계산 (수업 시작 40분 전)
  const calculateArrivalTime = (startTime) => {
    try {
      const time = parse(startTime, 'HH:mm', new Date());
      time.setMinutes(time.getMinutes() - 40);
      return format(time, 'HH:mm');
    } catch (error) {
      console.error('시간 계산 중 오류가 발생했습니다:', error);
      return startTime;
    }
  };
  
  // 하원 시간 계산 (수업 종료 50분 후)
  const calculateDepartureTime = (endTime) => {
    try {
      const time = parse(endTime, 'HH:mm', new Date());
      time.setMinutes(time.getMinutes() + 50);
      return format(time, 'HH:mm');
    } catch (error) {
      console.error('시간 계산 중 오류가 발생했습니다:', error);
      return endTime;
    }
  };
  
  // 등원 상태 변경 함수
  const toggleArrivalStatus = async (studentId) => {
    console.log(`등원 상태 변경 시도 - 학생 ID: ${studentId}`);
    
    // 이미 처리 중인지 확인하는 플래그 추가
    if (processingStatus.current.includes(studentId)) {
      console.log(`이미 처리 중인 학생입니다: ${studentId}`);
      return;
    }
    
    // 처리 중인 학생 ID 추가
    processingStatus.current.push(studentId);
    
    try {
      // 변경 전 상태 확인
      console.log(`현재 등원 상태: ${arrivalStatus[studentId] ? '완료' : '대기중'}`);
      
      const student = allStudents.find(s => s.id === studentId);
      if (!student) {
        console.error(`학생 ID ${studentId}에 해당하는 학생을 찾을 수 없습니다.`);
        // 처리 완료 후 플래그 제거
        processingStatus.current = processingStatus.current.filter(id => id !== studentId);
        return;
      }

      console.log(`학생 찾음: ${student.name} (ID: ${studentId})`);
      const newStatus = !arrivalStatus[studentId];
      console.log(`새 등원 상태: ${newStatus ? '완료' : '대기중'}`);
      
      // 노션 API 사용 시
      if (useNotion) {
        try {
          await updateStudentStatusInNotion(student.id, '등원 상태', newStatus);
          console.log('Notion API 업데이트 성공');
        } catch (notionError) {
          console.error('Notion API 업데이트 오류:', notionError);
        }
      }
      
      // Firebase에 학생 상태 업데이트
      try {
        const studentRef = doc(db, "students", studentId);
        await updateDoc(studentRef, { arrivalStatus: newStatus });
        console.log(`Firebase 업데이트 성공: 학생 ${student.name}(${studentId})의 등원 상태가 ${newStatus ? '완료' : '대기중'}으로 변경되었습니다.`);
      } catch (firestoreError) {
        console.error('Firebase 업데이트 오류:', firestoreError);
        // Firebase 업데이트 실패 시에도 UI는 업데이트
      }
      
      // 상태 업데이트
      console.log('React 상태 업데이트 시작: arrivalStatus');
      setArrivalStatus(prev => {
        const newState = {
          ...prev,
          [studentId]: newStatus
        };
        console.log('새 arrivalStatus 상태:', newState);
        return newState;
      });
      
      // 학생 데이터 업데이트
      console.log('React 상태 업데이트 시작: allStudents');
      setAllStudents(prev => {
        const newAllStudents = prev.map(s => 
          s.id === studentId ? { ...s, arrivalStatus: newStatus } : s
        );
        return newAllStudents;
      });
      
      // 현재 화면에 표시된 students 상태도 업데이트
      console.log('React 상태 업데이트 시작: students');
      setStudents(prev => {
        const newStudents = prev.map(s =>
          s.id === studentId ? { ...s, arrivalStatus: newStatus } : s
        );
        return newStudents;
      });
      
      console.log('등원 상태 변경 완료');
      return newStatus;
    } catch (error) {
      console.error('등원 상태 변경 중 오류가 발생했습니다:', error);
      setError('등원 상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return null;
    } finally {
      // 처리 완료 후 플래그 제거
      processingStatus.current = processingStatus.current.filter(id => id !== studentId);
    }
  };
  
  // 하원 상태 변경 함수
  const toggleDepartureStatus = async (studentId) => {
    console.log(`하차 상태 변경 시도 - 학생 ID: ${studentId}`);
    
    // 이미 처리 중인지 확인하는 플래그 추가
    if (processingStatus.current.includes(studentId)) {
      console.log(`이미 처리 중인 학생입니다: ${studentId}`);
      return;
    }
    
    // 처리 중인 학생 ID 추가
    processingStatus.current.push(studentId);
    
    try {
      // 변경 전 상태 확인
      console.log(`현재 하차 상태: ${departureStatus[studentId] ? '완료' : '대기중'}`);
      
      const student = allStudents.find(s => s.id === studentId);
      if (!student) {
        console.error(`학생 ID ${studentId}에 해당하는 학생을 찾을 수 없습니다.`);
        // 처리 완료 후 플래그 제거
        processingStatus.current = processingStatus.current.filter(id => id !== studentId);
        return;
      }

      console.log(`학생 찾음: ${student.name} (ID: ${studentId})`);
      const newStatus = !departureStatus[studentId];
      console.log(`새 하차 상태: ${newStatus ? '완료' : '대기중'}`);
      
      // 노션 API 사용 시
      if (useNotion) {
        try {
          await updateStudentStatusInNotion(student.id, '하차 상태', newStatus);
          console.log('Notion API 업데이트 성공');
        } catch (notionError) {
          console.error('Notion API 업데이트 오류:', notionError);
        }
      }
      
      // Firebase에 학생 상태 업데이트
      try {
        const studentRef = doc(db, "students", studentId);
        await updateDoc(studentRef, { departureStatus: newStatus });
        console.log(`Firebase 업데이트 성공: 학생 ${student.name}(${studentId})의 하차 상태가 ${newStatus ? '완료' : '대기중'}으로 변경되었습니다.`);
      } catch (firestoreError) {
        console.error('Firebase 업데이트 오류:', firestoreError);
        // Firebase 업데이트 실패 시에도 UI는 업데이트
      }
      
      // 상태 업데이트
      console.log('React 상태 업데이트 시작: departureStatus');
      setDepartureStatus(prev => {
        const newState = {
          ...prev,
          [studentId]: newStatus
        };
        console.log('새 departureStatus 상태:', newState);
        return newState;
      });
      
      // 학생 데이터 업데이트
      console.log('React 상태 업데이트 시작: allStudents');
      setAllStudents(prev => {
        const newAllStudents = prev.map(s => 
          s.id === studentId ? { ...s, departureStatus: newStatus } : s
        );
        return newAllStudents;
      });
      
      // 현재 화면에 표시된 students 상태도 업데이트
      console.log('React 상태 업데이트 시작: students');
      setStudents(prev => {
        const newStudents = prev.map(s =>
          s.id === studentId ? { ...s, departureStatus: newStatus } : s
        );
        return newStudents;
      });
      
      console.log('하차 상태 변경 완료');
      return newStatus;
    } catch (error) {
      console.error('하차 상태 변경 중 오류가 발생했습니다:', error);
      setError('하차 상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return null;
    } finally {
      // 처리 완료 후 플래그 제거
      processingStatus.current = processingStatus.current.filter(id => id !== studentId);
    }
  };
  
  // 학생별 위치 정보 변경 함수 개선
  const updateStudentLocation = (studentId, locationType, locationId) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) {
      console.error(`학생 ID ${studentId}에 해당하는 학생을 찾을 수 없습니다.`);
      return;
    }
    
    // 위치 ID를 문자열로 표준화
    const locationIdStr = locationId ? String(locationId).trim() : null;
    
    setStudentLocations(prev => {
      const newLocations = { ...prev };
      
      // 해당 위치 타입 객체가 없으면 초기화
      if (!newLocations[locationType]) {
        newLocations[locationType] = {};
      }
      
      // 모든 위치에서 해당 학생 제거
      Object.keys(newLocations[locationType]).forEach(locId => {
        if (newLocations[locationType][locId]) {
          newLocations[locationType][locId] = newLocations[locationType][locId].filter(
            s => s.id !== studentId
          );
        }
      });
      
      // 새 위치가 유효하면 해당 위치에 학생 추가
      if (locationIdStr) {
        if (!newLocations[locationType][locationIdStr]) {
          newLocations[locationType][locationIdStr] = [];
        }
        newLocations[locationType][locationIdStr].push(student);
      }
      
      return newLocations;
    });
    
    // 학생 객체 업데이트 (Firebase와 동기화를 위해)
    if (locationType === 'arrival') {
      updateStudent(studentId, { arrivalLocation: locationIdStr });
    } else if (locationType === 'departure') {
      updateStudent(studentId, { departureLocation: locationIdStr });
    }
  };
  
  // 필드명 변환 함수 (스네이크 케이스 -> 카멜 케이스)
  const transformStudentData = (student) => {
    // Supabase 응답이 스네이크 케이스인 경우 카멜 케이스로 변환
    if (student.short_id !== undefined) {
      return {
        id: student.id,
        name: student.name,
        shortId: student.short_id,
        classTime: student.class_time,
        classes: [student.class_time], // classes 배열 생성
        arrivalLocation: student.arrival_location || '',
        departureLocation: student.departure_location || '',
        arrivalStatus: student.arrival_status || false,
        departureStatus: student.departure_status || false,
        isActive: student.is_active !== undefined ? student.is_active : true,
        motherPhone: student.mother_phone || '',
        fatherPhone: student.father_phone || '',
        studentPhone: student.student_phone || '',
        otherPhone: student.other_phone || '',
        classDays: student.class_days || [],
        registrationDate: student.registration_date || null
      };
    }
    
    // 이미 카멜 케이스인 경우 그대로 반환
    return student;
  };
  
  // 시간 형식 표준화 함수
  const normalizeClassTime = (time) => {
    if (!time) return time;
    
    // 시간 형식 표준화
    if (time === '16:40') return '16:30';
    if (time === '17:40') return '17:30';
    if (time === '18:40') return '18:30';
    
    return time;
  };
  
  // 학생 데이터의 시간 형식 표준화
  const normalizeStudentTimes = (student) => {
    if (!student) return student;
    
    const normalizedStudent = { ...student };
    
    // classTime 필드 표준화
    if (normalizedStudent.classTime) {
      normalizedStudent.classTime = normalizeClassTime(normalizedStudent.classTime);
    }
    
    // classTimes 객체 표준화
    if (normalizedStudent.classTimes && typeof normalizedStudent.classTimes === 'object') {
      const normalizedClassTimes = { ...normalizedStudent.classTimes };
      Object.keys(normalizedClassTimes).forEach(day => {
        normalizedClassTimes[day] = normalizeClassTime(normalizedClassTimes[day]);
      });
      normalizedStudent.classTimes = normalizedClassTimes;
    }
    
    // classes 배열 표준화
    if (normalizedStudent.classes && Array.isArray(normalizedStudent.classes)) {
      normalizedStudent.classes = normalizedStudent.classes.map(time => normalizeClassTime(time));
    }
    
    return normalizedStudent;
  };
  
  // Notion API에서 학생 데이터 가져오기
  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Notion API 호출
      console.log("Notion API에서 학생 데이터를 불러오는 중...");
      const response = await fetch("/api/notion");
      
      // 응답 상태 확인 및 로깅
      console.log(`API 응답 상태: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log("Notion에서 받은 원본 데이터:", data);
      
      // 데이터가 비어있는지 확인
      if (!data || !Array.isArray(data.results) || data.results.length === 0) {
        console.warn("Notion에서 받은 학생 데이터가 없습니다.");
        setAllStudents([]);
        setStudents([]);
        setLoading(false);
        return;
      }

      console.log(`Notion에서 ${data.results.length}명의 학생 데이터를 받았습니다.`);

      // 학생 데이터 변환
      const studentsData = data.results.map(item => {
        // properties 확인
        if (!item.properties) {
          console.warn("학생 데이터에 properties가 없습니다:", item);
          return null;
        }
        
        const properties = item.properties;
        
        // 필요한 속성들이 있는지 확인
        const hasName = properties.Name && properties.Name.title && properties.Name.title.length > 0;
        const hasClassTime = properties.ClassTime && properties.ClassTime.rich_text && properties.ClassTime.rich_text.length > 0;
        const shortId = properties.ShortId?.number || Math.floor(Math.random() * 100); // ShortId가 없으면 임의의 번호 생성
        
        if (!hasName) {
          console.warn("학생 이름이 없습니다:", item);
          return null;
        }
        
        const name = hasName ? properties.Name.title[0].plain_text : "이름 없음";
        
        // 클래스 시간 추출 (여러 형식 지원)
        let classTimes = [];
        
        if (hasClassTime) {
          const classTimeText = properties.ClassTime.rich_text[0].plain_text;
          console.log(`학생 ${name}의 원본 수업 시간:`, classTimeText);
          
          // 쉼표, 공백, 그리고 기타 구분자로 나눔
          classTimes = classTimeText.split(/[,;/\s]+/).filter(time => time.trim() !== '');
          
          // 정규표현식을 사용하여 시간 형식 (예: "10:00", "14:30") 추출
          const timePattern = /\d{1,2}:\d{2}/g;
          const extractedTimes = classTimeText.match(timePattern);
          
          if (extractedTimes) {
            // 추출된 시간이 있으면 기존 배열에 추가 (중복 제거)
            extractedTimes.forEach(time => {
              if (!classTimes.includes(time)) {
                classTimes.push(time);
              }
            });
          }
          
          console.log(`학생 ${name}의 처리된 수업 시간:`, classTimes);
        } else {
          console.warn(`학생 ${name}의 수업 시간 정보가 없습니다.`);
          // 임시 조치: 기본 수업 시간 할당
          classTimes = ["15:30", "16:30", "17:30", "18:30", "19:30"];
        }
        
        // 처리된 학생 데이터 객체 생성
        return {
          id: item.id,
          name: name,
          shortId: shortId,
          classes: classTimes,
          isActive: true // 모든 학생을 활성 상태로 설정
        };
      }).filter(student => student !== null); // null 값 제거
      
      console.log("변환된 학생 데이터:", studentsData);
      
      // 모든 학생 데이터 저장
      setAllStudents(studentsData);
      
      // 활성 상태인 학생만 필터링하여 저장
      const activeStudents = studentsData.filter(student => student.isActive !== false);
      setStudents(activeStudents);
      
      console.log(`${activeStudents.length}명의 활성 학생 데이터가 로드되었습니다.`);
      
      // 위치 정보 초기화
      const initialLocations = {
        arrival: {},
        departure: {}
      };
      
      studentsData.forEach(student => {
        // 기존에 있던 위치 정보 활용
        const arrivalLocation = student.arrivalLocation ? parseLocationId(student.arrivalLocation) : null;
        const departureLocation = student.departureLocation ? parseLocationId(student.departureLocation) : null;
        
        // 등원 위치가 있으면 해당 위치에 학생 추가
        if (arrivalLocation !== null) {
          if (!initialLocations.arrival[arrivalLocation]) {
            initialLocations.arrival[arrivalLocation] = [];
          }
          initialLocations.arrival[arrivalLocation].push(student);
        }
        
        // 하원 위치가 있으면 해당 위치에 학생 추가
        if (departureLocation !== null) {
          if (!initialLocations.departure[departureLocation]) {
            initialLocations.departure[departureLocation] = [];
          }
          initialLocations.departure[departureLocation].push(student);
        }
        
        console.log(`학생 ${student.name}의 위치 정보 초기화: 등원(${arrivalLocation}), 하원(${departureLocation})`);
      });
      
      setStudentLocations(initialLocations);
      
      // 도착/출발 상태 초기화
      const initialArrival = {};
      const initialDeparture = {};
      studentsData.forEach(student => {
        initialArrival[student.id] = student.arrivalStatus || false;
        initialDeparture[student.id] = student.departureStatus || false;
      });
      setArrivalStatus(initialArrival);
      setDepartureStatus(initialDeparture);
      
      // 상태 업데이트
      setAllStudents(studentsData);
      setStudents(studentsData);
      
      setUseNotion(true);
      setLoading(false);
    } catch (error) {
      console.error("학생 데이터 가져오기 오류:", error);
      setError("학생 데이터를 가져오는 중에 오류가 발생했습니다.");
      
      // 오류 발생 시 테스트 데이터로 대체
      console.log("오류로 인해 테스트 데이터를 사용합니다.");
      const testStudents = [];
      const classTimeOptions = ["15:30", "16:30", "17:30", "18:30", "19:30"];
      
      for (let i = 1; i <= 15; i++) {
        testStudents.push({
          id: `test-student-${i}`,
          name: `테스트 학생 ${i}`,
          shortId: i,
          classes: classTimeOptions,
          isActive: true
        });
      }
      
      setAllStudents(testStudents);
      setStudents(testStudents);
      
      // 학생 위치 초기화
      setStudentLocations(initialStudentLocations);
      
      // 도착/출발 상태 초기화
      const initialArrival = {};
      const initialDeparture = {};
      testStudents.forEach(student => {
        initialArrival[student.id] = false;
        initialDeparture[student.id] = false;
      });
      setArrivalStatus(initialArrival);
      setDepartureStatus(initialDeparture);
      
      setUseNotion(false);
      setLoading(false);
    }
  };
  
  // Notion에서 수업 정보 가져오기
  const fetchClassInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Notion API를 사용하여 수업 정보 가져오기
      console.log("Notion API에서 수업 정보를 불러오는 중...");
      const notionClassInfo = await fetchClassInfoFromNotion();
      console.log("수업 정보 데이터 받음:", notionClassInfo);
      
      // 데이터 검증
      if (!notionClassInfo || typeof notionClassInfo !== 'object' || Object.keys(notionClassInfo).length === 0) {
        console.warn("서버에서 받은 수업 정보가 유효하지 않습니다. 기본 데이터를 사용합니다.");
        // 기존 classInfo 상태를 유지 (초기값을 사용)
        setLoading(false);
        return;
      }
      
      // notionClassInfo가 유효할 때만 상태 업데이트
      setClassInfo(notionClassInfo);
      setUseNotion(true);
      
      setLoading(false);
    } catch (error) {
      console.error('수업 정보를 가져오는 중 오류가 발생했습니다:', error);
      setError('서버에서 수업 정보를 가져오는 중 오류가 발생했습니다. 기본 데이터를 사용합니다.');
      
      // 오류 발생 시에도 초기값을 유지하고 기본 데이터 사용 메시지만 로그
      console.log("오류로 인해 기본 수업 정보를 계속 사용합니다.");
      // classInfo는 이미 기본값으로 초기화되어 있으므로 여기서 다시 설정하지 않음
      setUseNotion(false);
      setLoading(false);
    }
  };
  
  // 학생 데이터 가져오기
  const fetchStudents = async () => {
    setLoading(true);
    try {
      // 서버 API를 통해 학생 데이터 가져오기
      const response = await fetch('/api/students');
      
      if (!response.ok) {
        throw new Error(`학생 데이터 가져오기 실패: ${response.status}`);
      }
      
      const studentsData = await response.json();
      console.log(`서버에서 ${studentsData.length}명의 학생 데이터를 가져왔습니다.`);
      
      // 시간 형식 표준화 적용
      const normalizedStudentsData = studentsData.map(student => normalizeStudentTimes(student));
      
      // 모든 학생 데이터 저장
      setAllStudents(normalizedStudentsData);
      
      // 퇴원 처리된 학생 목록 확인 (디버깅용)
      const inactiveStudents = normalizedStudentsData.filter(student => student.isActive === false);
      console.log(`퇴원 처리된 학생 수: ${inactiveStudents.length}명`);
      if (inactiveStudents.length > 0) {
        console.log('퇴원 처리된 학생 목록:');
        inactiveStudents.forEach(student => {
          console.log(`- ${student.name} (ID: ${student.id}, isActive: ${student.isActive})`);
        });
      }
      
      // 활성 상태인 학생만 필터링하여 저장 - isActive가 명시적으로 false인 학생 제외
      const activeStudents = normalizedStudentsData.filter(student => {
        if (student.isActive === false) {
          console.log(`퇴원 처리된 학생 제외 (fetchStudents): ${student.name}`);
          return false;
        }
        return true;
      });
      
      setStudents(activeStudents);
      
      console.log(`${activeStudents.length}명의 활성 학생 데이터가 로드되었습니다.`);
      
      // 현재 선택된 요일과 수업 시간에 맞게 필터링 적용
      setTimeout(() => {
        filterStudents();
      }, 0);
      
      setError(null);
    } catch (error) {
      console.error('학생 데이터 로딩 오류:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 학생 추가
  const addStudent = async (studentData) => {
    console.log('학생 추가 시작');
    console.log('학생 데이터:', studentData);
    
    try {
      // 기본 필드 확인 및 초기화
      const newStudent = {
        name: studentData.name,
        shortId: studentData.shortId,
        classDays: studentData.classDays || [],
        classTimes: studentData.classTimes || {},
        arrivalLocations: studentData.arrivalLocations || {},
        departureLocations: studentData.departureLocations || {},
        motherPhone: studentData.motherPhone || '',
        fatherPhone: studentData.fatherPhone || '',
        studentPhone: studentData.studentPhone || '',
        otherPhone: studentData.otherPhone || '',
        registrationDate: studentData.registrationDate || new Date().toISOString(),
        isActive: studentData.isActive === undefined ? true : studentData.isActive,
        school: studentData.school || '',
        birthDate: studentData.birthDate || null,
        grade: studentData.grade || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Firestore에 추가
      const docRef = await addDoc(collection(db, 'students'), newStudent);
      const newStudentWithId = { ...newStudent, id: docRef.id };
      
      // 상태 업데이트
      setAllStudents(prev => [...prev, newStudentWithId]);
      
      // 필터링된 상태에도 추가 (모든 새 학생은 일단 표시)
      setStudents(prev => [...prev, newStudentWithId]);
      
      console.log('학생 추가 성공:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('학생 추가 실패:', error);
      throw new Error('학생 추가에 실패했습니다.');
    }
  };

  // 학생 정보 업데이트
  const updateStudent = async (studentId, updatedData) => {
    console.log(`학생 정보 업데이트 시작: ${studentId}`);
    console.log('업데이트 데이터:', updatedData);
    
    try {
      // 학생 ID 처리 - 다양한 ID 형식 처리
      let actualStudentId = studentId;
      
      // 1. 이미 'student-'로 시작하는 경우 그대로 사용
      if (studentId.startsWith('student-')) {
        actualStudentId = studentId;
      } 
      // 2. docId 필드가 있는 경우 해당 값 사용
      else if (studentId.docId) {
        actualStudentId = studentId.docId;
      }
      // 3. 그 외의 경우 'student-' 접두사 추가
      else {
        // 먼저 allStudents에서 해당 ID를 가진 학생을 찾아봄
        const foundStudent = allStudents.find(s => s.id === studentId);
        if (foundStudent && foundStudent.docId) {
          actualStudentId = foundStudent.docId;
        } else {
          actualStudentId = `student-${studentId}`;
        }
      }
      
      console.log(`실제 사용할 문서 ID: ${actualStudentId}`);
      
      // 학생 참조 가져오기
      const studentRef = doc(db, 'students', actualStudentId);
      
      // 현재 학생 데이터 가져오기
      const studentDoc = await getDoc(studentRef);
      if (!studentDoc.exists()) {
        console.error(`학생 정보를 찾을 수 없습니다. ID: ${actualStudentId}`);
        
        // 다른 방식으로 ID 시도 (접두사 없이)
        if (actualStudentId.startsWith('student-')) {
          const alternativeId = actualStudentId.replace('student-', '');
          const alternativeRef = doc(db, 'students', alternativeId);
          const alternativeDoc = await getDoc(alternativeRef);
          
          if (alternativeDoc.exists()) {
            console.log(`대체 ID로 학생 정보를 찾았습니다: ${alternativeId}`);
            const currentData = alternativeDoc.data();
            
            // 업데이트할 데이터 준비
            const dataToUpdate = {
              ...updatedData,
              updatedAt: updatedData.updatedAt || new Date().toISOString()
            };
      
      // Firestore에 업데이트
            await updateDoc(alternativeRef, dataToUpdate);
      
      // 학생 목록 갱신
            console.log(`학생 정보 업데이트 성공: ${alternativeId}`);
            const updatedAllStudents = allStudents.map(student => 
              student.id === studentId ? { ...student, ...updatedData, id: studentId } : student
            );
            setAllStudents(updatedAllStudents);
            
            const updatedFilteredStudents = students.map(student => 
              student.id === studentId ? { ...student, ...updatedData, id: studentId } : student
            );
            setStudents(updatedFilteredStudents);
            
            return true;
          }
        }
        
        throw new Error(`학생 정보를 찾을 수 없습니다. ID: ${actualStudentId}`);
      }
      
      const currentData = studentDoc.data();
      console.log('현재 학생 데이터:', currentData);
      
      // 업데이트할 데이터 준비 (기존 데이터와 새 데이터 병합)
      const dataToUpdate = {
        ...updatedData,
        updatedAt: updatedData.updatedAt || new Date().toISOString()
      };
      
      console.log('업데이트할 데이터:', dataToUpdate);
      
      // Firestore에 업데이트
      await updateDoc(studentRef, dataToUpdate);
      
      // 학생 목록 갱신
      console.log(`학생 정보 업데이트 성공: ${actualStudentId}`);
      const updatedAllStudents = allStudents.map(student => 
        student.id === studentId ? { ...student, ...updatedData, id: studentId } : student
      );
      setAllStudents(updatedAllStudents);
      
      const updatedFilteredStudents = students.map(student => 
        student.id === studentId ? { ...student, ...updatedData, id: studentId } : student
      );
      setStudents(updatedFilteredStudents);
      
      return true;
    } catch (error) {
      console.error('학생 정보 업데이트 실패:', error);
      console.error('오류 메시지:', error.message);
      console.error('오류 코드:', error.code);
      console.error('오류 스택:', error.stack);
      throw error; // 원래 오류를 그대로 전달하여 더 자세한 오류 정보를 제공
    }
  };
  
  // 학생 삭제 함수 개선
  const deleteStudent = async (studentId) => {
    setLoading(true);
    try {
      // 삭제할 학생 찾기
      const studentToDelete = allStudents.find(student => student.id === studentId);
      
      if (!studentToDelete) {
        throw new Error('삭제할 학생을 찾을 수 없습니다.');
      }
      
      // Firebase에서 학생 문서 삭제
      await deleteDoc(doc(db, "students", studentId));
      
      // allStudents 상태 업데이트
      setAllStudents(prev => prev.filter(student => student.id !== studentId));
      
      // students 상태도 업데이트
      setStudents(prev => prev.filter(student => student.id !== studentId));
      
      // studentLocations 상태 업데이트
      setStudentLocations(prev => {
        const newLocations = { ...prev };
        
        // arrival 객체가 없으면 초기화
        if (!newLocations.arrival) {
          newLocations.arrival = {};
        }
        
        // departure 객체가 없으면 초기화
        if (!newLocations.departure) {
          newLocations.departure = {};
        }
        
        // 도착 위치에서 학생 제거
        if (studentToDelete.arrivalLocation) {
          const arrivalLocId = String(studentToDelete.arrivalLocation).trim();
            
          if (newLocations.arrival[arrivalLocId]) {
            newLocations.arrival[arrivalLocId] = newLocations.arrival[arrivalLocId]
              .filter(student => student.id !== studentId);
          }
        }
        
        // 출발 위치에서 학생 제거
        if (studentToDelete.departureLocation) {
          const departureLocId = String(studentToDelete.departureLocation).trim();
            
          if (newLocations.departure[departureLocId]) {
            newLocations.departure[departureLocId] = newLocations.departure[departureLocId]
              .filter(student => student.id !== studentId);
          }
        }
        
        return newLocations;
      });
      
      // 등하원 상태에서도 학생 제거
      setArrivalStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[studentId];
        return newStatus;
      });
      
      setDepartureStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[studentId];
        return newStatus;
      });
      
      setLoading(false);
      return studentToDelete;
    } catch (error) {
      console.error('학생 삭제 오류:', error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };
  
  // 수업 정보 업데이트 함수
  const updateClassInfo = async (newClassInfo) => {
    setLoading(true);
    try {
      // Firestore에 수업 정보 업데이트
      const classInfoRef = doc(db, "system", "classInfo");
      await setDoc(classInfoRef, newClassInfo);
      
      // 상태 업데이트
      setClassInfo(newClassInfo);
      
      console.log('수업 정보가 성공적으로 업데이트되었습니다:', newClassInfo);
      return true;
    } catch (error) {
      console.error('수업 정보 업데이트 오류:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 시스템 설정 저장 함수
  const updateSystemSettings = async (settings) => {
    setLoading(true);
    try {
      // Firestore에 시스템 설정 저장
      const settingsRef = doc(db, "system", "settings");
      await setDoc(settingsRef, settings);
      
      // 필요한 상태 업데이트
      if (settings.timeOptions) {
        // 시간대 옵션에 맞게 classInfo 업데이트 필요 시 처리
        console.log('시간대 옵션 업데이트됨:', settings.timeOptions);
      }
      
      console.log('시스템 설정이 성공적으로 저장되었습니다:', settings);
      return true;
    } catch (error) {
      console.error('시스템 설정 저장 오류:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 정류장 정보 가져오기
  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      if (!response.ok) throw new Error('정류장 정보를 가져오는데 실패했습니다.');
      const data = await response.json();
      setStations(data); // 정류장 정보 상태 업데이트
    } catch (err) {
      console.error('정류장 정보 로드 중 오류:', err);
      setError('정류장 정보를 불러오는데 실패했습니다.');
    }
  };

  // 정류장 추가
  const addStation = async (stationData) => {
    try {
      const response = await fetch('/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationData),
      });
      
      if (!response.ok) {
        throw new Error('정류장 추가에 실패했습니다.');
      }
      
      const newStation = await response.json();
      setStations(prev => [...prev, newStation]);
      return newStation;
    } catch (error) {
      console.error('정류장 추가 중 오류:', error);
      throw error;
    }
  };

  // 정류장 수정
  const updateStation = async (stationId, stationData) => {
    try {
      const response = await fetch(`/api/stations/${stationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationData),
      });
      
      if (!response.ok) {
        throw new Error('정류장 수정에 실패했습니다.');
      }
      
      const updatedStation = await response.json();
      setStations(prev => prev.map(station => 
        station.id === stationId ? updatedStation : station
      ));
      return updatedStation;
    } catch (error) {
      console.error('정류장 수정 중 오류:', error);
      throw error;
    }
  };

  // 정류장 삭제
  const deleteStation = async (stationId) => {
    try {
      const response = await fetch(`/api/stations/${stationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('정류장 삭제에 실패했습니다.');
      }
      
      setStations(prev => prev.filter(station => station.id !== stationId));
      } catch (error) {
      console.error('정류장 삭제 중 오류:', error);
      throw error;
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchStudents();
    fetchClassInfo();
    fetchStations(); // 정류장 정보 로드 추가
  }, []);
  
  // 컨텍스트 값
  const value = {
    students,
    allStudents,
    processedStudents,
    selectedDate,
    selectedDayOfWeek,
    selectedClassTime,
    handleDateChange,
    handleDayChange,
    handleClassTimeChange,
    formatDate,
    getDayName,
    calculateTimes,
    classInfo,
    loading,
    error,
    arrivalStatus,
    departureStatus,
    studentLocations,
    dailyStudentLocations,  // 요일별 학생 위치 정보 추가
    toggleArrivalStatus,
    toggleDepartureStatus,
    updateStudentLocation,
    useNotion,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    locations: classInfo,
    dayMap,  // 요일 매핑 객체 추가
    updateClassInfo,
    updateSystemSettings,
    stations, // 정류장 정보 추가
    fetchStations,
    addStation,
    updateStation,
    deleteStation,
  };
  
  return (
    <PickupContext.Provider value={value}>
      {children}
    </PickupContext.Provider>
  );
}; 