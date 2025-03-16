import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { fetchStudents, fetchLocations, fetchClassInfo, updateStudent } from '../api/firebaseService';
import { fetchStudentsFromNotion, updateStudentStatusInNotion } from '../api/notionService';
import { getCurrentDayOfWeek, getDayName, formatDate } from '../utils/dateUtils';
import { parseLocationId } from '../utils/locationUtils';
import { filterStudentsByDayAndTime, sortStudents } from '../utils/studentUtils';
import { calculateTimes, toggleArrivalStatus, toggleDepartureStatus, updateStudentLocation } from '../utils/statusUtils';

// 컨텍스트 생성
export const PickupContext = createContext();

// 컨텍스트 훅
export const usePickup = () => useContext(PickupContext);

// 컨텍스트 제공자 컴포넌트
export const PickupProvider = ({ children }) => {
  // 선택된 날짜 상태
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 선택된 요일 상태 (1: 월요일, 2: 화요일, ..., 5: 금요일)
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(getCurrentDayOfWeek());
  
  // 선택된 수업 시간 (기본값은 모든 시간)
  const [selectedClassTime, setSelectedClassTime] = useState('all');
  
  // 학생 데이터 상태
  const [students, setStudents] = useState([]);
  
  // 모든 학생 데이터 (필터링 전)
  const [allStudents, setAllStudents] = useState([]);
  
  // 수업 정보 상태
  const [classInfo, setClassInfo] = useState({});
  
  // 학생 위치 상태
  const [studentLocations, setStudentLocations] = useState({
    arrival: {},
    departure: {}
  });
  
  // 요일별 학생 위치 상태
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
  const [stations, setStations] = useState([]); // 정류장 정보 상태

  // 처리 중인 학생 ID를 추적하는 ref
  const processingStatus = useRef([]);

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
    if (!studentList || !Array.isArray(studentList)) {
      console.warn("필터링할 학생 데이터가 없습니다.");
      setStudents([]);
      return;
    }
    
    // 활성 상태인 학생만 필터링
    const activeStudents = studentList.filter(student => student.isActive !== false);
    
    // 현재 요일에 맞는 학생 필터링
    const dayName = getDayName(dayIndex);
    const filteredStudents = activeStudents.filter(student => {
      // classDays 속성이 없거나 비어있는 경우에는 모든 요일에 표시
      if (!student.classDays || student.classDays.length === 0) return true;
      
      // 현재 선택된 요일이 학생의 수업 요일에 포함되는지 확인
      return student.classDays.includes(dayName);
    });
    
    setStudents(filteredStudents);
  };
  
  // 요일 및 수업 시간에 따라 학생 필터링
  const filterStudents = useCallback(() => {
    if (!allStudents || allStudents.length === 0) {
      setStudents([]);
      return;
    }
    
    // 활성 상태인 학생만 필터링
    let filteredStudents = allStudents.filter(student => student.isActive !== false);
    
    // 현재 요일에 맞는 학생 필터링
    const dayName = getDayName(selectedDayOfWeek);
    filteredStudents = filteredStudents.filter(student => {
      // classDays 속성이 없거나 비어있는 경우에는 모든 요일에 표시
      if (!student.classDays || student.classDays.length === 0) return true;
      
      // 현재 선택된 요일이 학생의 수업 요일에 포함되는지 확인
      return student.classDays.includes(dayName);
    });
    
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
        
        return matchesTime;
      });
    }
    
    setStudents(filteredStudents);
  }, [allStudents, selectedDayOfWeek, selectedClassTime]);
  
  // 요일 변경 처리
  const handleDayChange = (dayIndex) => {
    // 0-6 범위의 dayIndex만 허용
    if (dayIndex < 0 || dayIndex > 6) {
      console.warn(`유효하지 않은 요일 인덱스: ${dayIndex}`);
      return;
    }
    
    // 오늘 날짜 기준으로 해당 요일의 날짜 계산
    const today = new Date();
    const currentJsDay = today.getDay(); // 0(일) - 6(토)
    const dayDiff = dayIndex - currentJsDay;
    const newDate = new Date(today);
    newDate.setDate(today.getDate() + dayDiff);
    
    setSelectedDate(newDate);
    setSelectedDayOfWeek(dayIndex);
  };
  
  // 수업 시간 변경 처리
  const handleClassTimeChange = (classTime) => {
    setSelectedClassTime(classTime);
  };
  
  // 학생 데이터 로드
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Firebase에서 학생 데이터 가져오기
      const studentsData = await fetchStudents();
      
      if (studentsData && Array.isArray(studentsData)) {
        setAllStudents(studentsData);
        filterStudentsByDay(selectedDayOfWeek, studentsData);
        
        // 학생 위치 초기화
        const initialLocations = {
          arrival: {},
          departure: {}
        };
        
        // 도착/출발 상태 초기화
        const initialArrival = {};
        const initialDeparture = {};
        
        studentsData.forEach(student => {
          if (student.id) {
            initialLocations.arrival[student.id] = student.arrivalLocationId || 'location_1';
            initialLocations.departure[student.id] = student.departureLocationId || 'location_1';
            
            initialArrival[student.id] = student.arrivalStatus || false;
            initialDeparture[student.id] = student.departureStatus || false;
          }
        });
        
        setStudentLocations(initialLocations);
        setArrivalStatus(initialArrival);
        setDepartureStatus(initialDeparture);
      } else {
        console.error("학생 데이터가 유효하지 않습니다:", studentsData);
        setError("학생 데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("학생 데이터 로드 오류:", err);
      setError("학생 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [selectedDayOfWeek]);
  
  // 수업 정보 로드
  const loadClassInfo = useCallback(async () => {
    try {
      const classInfoData = await fetchClassInfo();
      
      if (classInfoData) {
        setClassInfo(classInfoData);
      } else {
        console.error("수업 정보가 유효하지 않습니다.");
      }
    } catch (err) {
      console.error("수업 정보 로드 오류:", err);
    }
  }, []);
  
  // 등원 상태 변경 함수
  const handleToggleArrivalStatus = async (studentId) => {
    try {
      // 이미 처리 중인 학생인지 확인
      if (processingStatus.current.includes(studentId)) {
        console.warn(`학생 ID ${studentId}의 등원 상태 변경이 이미 처리 중입니다.`);
        return;
      }
      
      // 처리 중인 학생 목록에 추가
      processingStatus.current.push(studentId);
      
      const updatedStatus = await toggleArrivalStatus(studentId, arrivalStatus, useNotion, students);
      setArrivalStatus(updatedStatus);
      
      // 처리 완료 후 목록에서 제거
      processingStatus.current = processingStatus.current.filter(id => id !== studentId);
    } catch (err) {
      console.error("등원 상태 변경 오류:", err);
      setError(err.message || "등원 상태 변경 중 오류가 발생했습니다.");
      
      // 오류 발생 시에도 처리 중인 목록에서 제거
      processingStatus.current = processingStatus.current.filter(id => id !== studentId);
    }
  };
  
  // 하원 상태 변경 함수
  const handleToggleDepartureStatus = async (studentId) => {
    try {
      // 이미 처리 중인 학생인지 확인
      if (processingStatus.current.includes(studentId)) {
        console.warn(`학생 ID ${studentId}의 하원 상태 변경이 이미 처리 중입니다.`);
        return;
      }
      
      // 처리 중인 학생 목록에 추가
      processingStatus.current.push(studentId);
      
      const updatedStatus = await toggleDepartureStatus(studentId, departureStatus, useNotion, students);
      setDepartureStatus(updatedStatus);
      
      // 처리 완료 후 목록에서 제거
      processingStatus.current = processingStatus.current.filter(id => id !== studentId);
    } catch (err) {
      console.error("하원 상태 변경 오류:", err);
      setError(err.message || "하원 상태 변경 중 오류가 발생했습니다.");
      
      // 오류 발생 시에도 처리 중인 목록에서 제거
      processingStatus.current = processingStatus.current.filter(id => id !== studentId);
    }
  };
  
  // 학생 위치 변경 함수
  const handleUpdateStudentLocation = (studentId, locationType, locationId) => {
    const updatedLocations = updateStudentLocation(
      studentId, 
      locationType, 
      locationId, 
      locationType === 'arrival' ? studentLocations.arrival : studentLocations.departure
    );
    
    if (locationType === 'arrival') {
      setStudentLocations(prev => ({
        ...prev,
        arrival: updatedLocations
      }));
    } else {
      setStudentLocations(prev => ({
        ...prev,
        departure: updatedLocations
      }));
    }
    
    // 요일별 위치 정보도 업데이트
    const dayName = getDayName(selectedDayOfWeek);
    setDailyStudentLocations(prev => ({
      ...prev,
      [dayName]: {
        ...prev[dayName],
        [locationType]: updatedLocations
      }
    }));
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadStudents();
    loadClassInfo();
  }, [loadStudents, loadClassInfo]);
  
  // 선택된 요일이나 수업 시간이 변경될 때 학생 필터링
  useEffect(() => {
    filterStudents();
  }, [selectedDayOfWeek, selectedClassTime, allStudents, filterStudents]);
  
  // 컨텍스트 값
  const contextValue = {
    selectedDate,
    selectedDayOfWeek,
    selectedClassTime,
    students,
    allStudents,
    classInfo,
    studentLocations,
    dailyStudentLocations,
    arrivalStatus,
    departureStatus,
    loading,
    error,
    stations,
    useNotion,
    handleDateChange,
    handleDayChange,
    handleClassTimeChange,
    handleToggleArrivalStatus,
    handleToggleDepartureStatus,
    handleUpdateStudentLocation,
    setStudentLocations,
    setDailyStudentLocations,
    setArrivalStatus,
    setDepartureStatus,
    loadStudents,
    loadClassInfo,
    getDayName,
    formatDate,
    calculateTimes: (classTime) => calculateTimes(classTime, classInfo)
  };
  
  return (
    <PickupContext.Provider value={contextValue}>
      {children}
    </PickupContext.Provider>
  );
}; 