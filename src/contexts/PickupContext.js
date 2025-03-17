import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { fetchStudents, fetchLocations, fetchClassInfo, updateStudent } from '../api/firebaseService';
// import { fetchStudentsFromNotion, updateStudentStatusInNotion } from '../api/notionService';
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
  
  // 시간별 위치 정보 추가
  const [locations, setLocations] = useState({
    '15:30': { 
      locations: {
        1: "기본 위치 1",
        2: "기본 위치 2",
        3: "기본 위치 3"
      }, 
      startTime: '15:30', 
      endTime: '16:30' 
    },
    '16:30': { 
      locations: {
        1: "기본 위치 1",
        2: "기본 위치 2",
        3: "기본 위치 3"
      }, 
      startTime: '16:30', 
      endTime: '17:30' 
    },
    '17:30': { 
      locations: {
        1: "기본 위치 1",
        2: "기본 위치 2",
        3: "기본 위치 3"
      }, 
      startTime: '17:30', 
      endTime: '18:30' 
    },
    '18:30': { 
      locations: {
        1: "기본 위치 1",
        2: "기본 위치 2",
        3: "기본 위치 3"
      }, 
      startTime: '18:30', 
      endTime: '19:30' 
    }
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
      console.log("학생 데이터 가져오기 시작");
      // 서버 API를 통해 학생 데이터 가져오기
      const studentsData = await fetchStudents();
      
      console.log("학생 데이터 로드 성공:", studentsData.length, "명");
      
      // 비활성 학생 필터링
      const activeStudents = studentsData.filter(student => {
        if (!student.isActive) {
          console.log(`퇴원 처리된 학생 제외 (fetchStudents): ${student.name}`);
          return false;
        }
        return true;
      });
      
      // 모든 학생 데이터와 활성 학생 데이터 모두 설정
      setAllStudents(studentsData);
      setStudents(activeStudents);
      
      // 학생 위치 초기화
      const initialLocations = {
        arrival: {},
        departure: {}
      };
      
      // 도착/출발 상태 초기화
      const initialArrival = {};
      const initialDeparture = {};
      
      activeStudents.forEach(student => {
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
      
      console.log(`${activeStudents.length}명의 활성 학생 데이터가 로드되었습니다.`);
    } catch (err) {
      console.error("학생 데이터 로드 오류:", err);
      setError("학생 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 수업 정보 로드
  const loadClassInfo = useCallback(async () => {
    try {
      console.log("수업 정보 가져오기 시작");
      
      // 수업 정보 API 호출
      const classInfoData = await fetchClassInfo();
      
      console.log("수업 정보 로드 결과:", classInfoData);
      
      if (classInfoData && classInfoData.classTimes) {
        // classTimes 배열이 있는 경우 처리
        setClassInfo(classInfoData);
        console.log("수업 시간 목록이 설정되었습니다:", classInfoData.classTimes);
      } else {
        console.warn("API에서 받은 수업 시간 목록이 없어 기본값을 사용합니다.");
        setClassInfo({ classTimes: ["15:30", "16:30", "17:30", "18:30"] });
      }
      
      return true;
    } catch (error) {
      console.error("수업 정보를 가져오는 중 오류가 발생했습니다:", error);
      console.warn("오류로 인해 기본 수업 정보를 계속 사용합니다.");
      
      // 기본 수업 시간 설정
      setClassInfo({ classTimes: ["15:30", "16:30", "17:30", "18:30"] });
      return false;
    }
  }, []);
  
  // 등원 상태 변경 함수
  const handleToggleArrivalStatus = async (studentId) => {
    try {
      console.log(`등원 상태 변경 요청: 학생 ID ${studentId}`);
      
      // 상태 업데이트 함수 호출
      const updatedStatus = await toggleArrivalStatus(
        studentId,
        arrivalStatus,
        false, // 노션 API 사용하지 않음
        students
      );
      
      // 상태 업데이트
      setArrivalStatus(updatedStatus);
    } catch (error) {
      console.error('등원 상태 변경 오류:', error);
      setError('등원 상태를 변경하는 중 오류가 발생했습니다.');
    }
  };
  
  // 하원 상태 변경 함수
  const handleToggleDepartureStatus = async (studentId) => {
    try {
      console.log(`하원 상태 변경 요청: 학생 ID ${studentId}`);
      
      // 상태 업데이트 함수 호출
      const updatedStatus = await toggleDepartureStatus(
        studentId,
        departureStatus,
        false, // 노션 API 사용하지 않음
        students
      );
      
      // 상태 업데이트
      setDepartureStatus(updatedStatus);
    } catch (error) {
      console.error('하원 상태 변경 오류:', error);
      setError('하원 상태를 변경하는 중 오류가 발생했습니다.');
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
    calculateTimes: (classTime) => calculateTimes(classTime, classInfo),
    locations
  };
  
  return (
    <PickupContext.Provider value={contextValue}>
      {children}
    </PickupContext.Provider>
  );
}; 