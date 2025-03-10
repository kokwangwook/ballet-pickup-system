import React, { createContext, useState, useEffect, useContext } from 'react';
import { students as mockStudents, classInfo as mockClassInfo, studentLocations as initialStudentLocations } from '../data/mockData';
import { format, parse } from 'date-fns';
import { fetchStudentsFromNotion, updateStudentStatusInNotion, fetchClassInfoFromNotion } from '../api/notionService';

// 컨텍스트 생성
export const PickupContext = createContext();

// 컨텍스트 훅
export const usePickup = () => useContext(PickupContext);

// 컨텍스트 제공자 컴포넌트
export const PickupProvider = ({ children }) => {
  // 선택된 날짜 상태
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 선택된 요일 상태 (0: 일요일, 1: 월요일, ..., 6: 토요일)
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(new Date().getDay());
  
  // 선택된 수업 시간 (기본값은 모든 시간)
  const [selectedClassTime, setSelectedClassTime] = useState('all');
  
  // 학생 데이터 상태
  const [students, setStudents] = useState([]);
  
  // 모든 학생 데이터 (필터링 전)
  const [allStudents, setAllStudents] = useState([]);
  
  // 수업 정보 상태
  const [classInfo, setClassInfo] = useState({});
  
  // 학생 위치 상태
  const [studentLocations, setStudentLocations] = useState({});
  
  // 등하원 상태
  const [arrivalStatus, setArrivalStatus] = useState({});
  const [departureStatus, setDepartureStatus] = useState({});
  
  // 로딩, 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 노션 사용 여부 (노션 API가 실패하면 모의 데이터로 폴백)
  const [useNotion, setUseNotion] = useState(true);

  // 날짜 포맷 변환 함수
  const formatDate = (date) => format(date, 'yyyy.MM.dd');
  
  // 요일 이름 가져오기
  const getDayName = (dayIndex) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayIndex];
  };
  
  // 날짜 변경 시 요일도 함께 업데이트
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedDayOfWeek(date.getDay());
    filterStudentsByDay(date.getDay(), allStudents);
  };
  
  // 요일에 따라 학생 필터링
  const filterStudentsByDay = (dayIndex, studentList) => {
    console.log(`요일별 필터링: ${getDayName(dayIndex)}요일, 전체 학생 수: ${studentList.length}`);
    
    // 모든 요일에 동일한 수업 시간이 적용되므로 모든 학생을 표시
    // 단, UI에는 현재 선택된 요일을 표시함
    setStudents(studentList);
    
    // 로그로 수업 시간 확인
    const allClassTimes = new Set();
    studentList.forEach(student => {
      student.classes.forEach(classTime => {
        allClassTimes.add(classTime);
      });
    });
    
    console.log('모든 수업 시간 목록:', Array.from(allClassTimes));
    console.log(`${getDayName(dayIndex)}요일 수업 진행 중: 총 ${studentList.length}명의 학생`);
  };
  
  // 요일 및 수업 시간에 따라 학생 필터링
  const filterStudents = () => {
    console.log(`필터링 시작: ${getDayName(selectedDayOfWeek)}요일, 수업 시간: ${selectedClassTime}, 전체 학생 수: ${allStudents.length}`);
    
    // allStudents가 비어있는지 확인
    if (!allStudents || allStudents.length === 0) {
      console.warn("필터링할 학생 데이터가 없습니다.");
      setStudents([]);
      return;
    }
    
    // 학생들의 classes 배열 확인
    console.log("학생 데이터 샘플:", allStudents.slice(0, 3).map(student => ({
      name: student.name,
      classes: student.classes
    })));
    
    // 수업 시간에 따른 필터링
    let filteredStudents = [...allStudents];
    
    // 특정 수업 시간이 선택되었을 경우에만 필터링 적용
    if (selectedClassTime !== 'all') {
      filteredStudents = allStudents.filter(student => {
        // classes 배열이 없으면 필터링에서 제외
        if (!student.classes || student.classes.length === 0) {
          return false;
        }
        
        const hasMatchingClass = student.classes.some(classTime => 
          classTime && classTime.includes(selectedClassTime)
        );
        
        console.log(`학생 ${student.name}의 수업 시간 [${student.classes.join(', ')}] - 매칭 여부: ${hasMatchingClass}`);
        
        return hasMatchingClass;
      });
    }
    
    console.log(`필터링 결과: ${filteredStudents.length}명의 학생`);
    setStudents(filteredStudents);
  };
  
  // 요일 변경 처리
  const handleDayChange = (dayIndex) => {
    // 오늘 날짜 기준으로 해당 요일의 날짜 계산
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const dayDiff = dayIndex - currentDayOfWeek;
    const newDate = new Date(today);
    newDate.setDate(today.getDate() + dayDiff);
    
    setSelectedDate(newDate);
    setSelectedDayOfWeek(dayIndex);
    filterStudents();
  };
  
  // 수업 시간 변경 처리
  const handleClassTimeChange = (classTime) => {
    setSelectedClassTime(classTime);
    filterStudents();
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
      setArrivalStatus(prev => ({
        ...prev,
        [studentId]: newStatus
      }));
    } catch (error) {
      console.error('등원 상태 변경 중 오류가 발생했습니다:', error);
      setError('등원 상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };
  
  // 하원 상태 변경 함수
  const toggleDepartureStatus = async (studentId) => {
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
      setDepartureStatus(prev => ({
        ...prev,
        [studentId]: newStatus
      }));
    } catch (error) {
      console.error('하원 상태 변경 중 오류가 발생했습니다:', error);
      setError('하원 상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };
  
  // 학생별 위치 정보 변경 함수
  const updateStudentLocation = (studentId, locationType, locationId) => {
    setStudentLocations(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [locationType]: locationId
      }
    }));
  };
  
  // 노션에서 학생 데이터 가져오기
  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 노션 API를 사용하여 데이터 가져오기
      const notionStudents = await fetchStudentsFromNotion();
      
      // 활성화된 학생만 필터링 (학생여부가 '여등록'인 경우)
      const activeStudents = notionStudents.filter(student => student.isActive);
      
      // 노션에서 가져온 학생 데이터 처리
      const processedStudents = activeStudents.map(student => {
        // 수업 시간이 있는지 확인하고, 없으면 빈 배열 사용
        const classTime = student.classTime || '';
        
        // 디버깅 로그 추가
        console.log(`학생 ${student.name}의 수업 시간:`, classTime);
        
        return {
          id: student.id,
          name: student.name,
          shortId: student.shortId,
          // 수업 시간이 있으면 배열에 추가, 없으면 빈 배열
          classes: classTime ? [classTime] : [],
          registrationType: student.registrationType,
          waitingNumber: student.waitingNumber
        };
      });
      
      // 상태 초기화
      const initialArrivalStatus = {};
      const initialDepartureStatus = {};
      const initialLocations = {};
      
      activeStudents.forEach(student => {
        // 등하원 상태 설정 (등원여부확인/하원여부확인 속성을 우선적으로 사용)
        initialArrivalStatus[student.id] = student.arrivalCheckStatus === 'O' || student.arrivalStatus;
        initialDepartureStatus[student.id] = student.departureCheckStatus === 'O' || student.departureStatus;
        
        // 학생별 위치 정보 매핑
        const arrivalLocationId = Object.entries(classInfo[student.classTime]?.locations || {})
          .find(([_, value]) => value === student.arrivalLocation)?.[0];
        
        const departureLocationId = Object.entries(classInfo[student.classTime]?.locations || {})
          .find(([_, value]) => value === student.departureLocation)?.[0];
        
        initialLocations[student.id] = {
          arrival: arrivalLocationId ? parseInt(arrivalLocationId) : null,
          departure: departureLocationId ? parseInt(departureLocationId) : null
        };
      });
      
      setAllStudents(processedStudents);
      setArrivalStatus(initialArrivalStatus);
      setDepartureStatus(initialDepartureStatus);
      setStudentLocations(initialLocations);
      setUseNotion(true);
      
      // 디버깅용 로그 추가
      console.log(`처리된 학생 데이터: ${processedStudents.length}명`);
      console.log('첫 번째 학생 데이터 샘플:', processedStudents.length > 0 ? processedStudents[0] : '데이터 없음');
      
      // 현재 필터 설정에 맞게 학생 필터링
      filterStudents();
      
    } catch (error) {
      console.error('학생 데이터를 가져오는 중 오류가 발생했습니다:', error);
      setError('노션에서 데이터를 가져오는 중 오류가 발생했습니다. 모의 데이터를 사용합니다.');
      
      // 오류 발생 시 모의 데이터로 폴백
      setAllStudents(mockStudents);
      
      // 상태 초기화 (모의 데이터)
      const mockArrivalStatus = {};
      const mockDepartureStatus = {};
      
      mockStudents.forEach(student => {
        mockArrivalStatus[student.id] = false;
        mockDepartureStatus[student.id] = false;
      });
      
      setArrivalStatus(mockArrivalStatus);
      setDepartureStatus(mockDepartureStatus);
      setStudentLocations(initialStudentLocations);
      setUseNotion(false);
      
      // 현재 필터 설정에 맞게 학생 필터링
      // 약간의 지연 후 필터링을 적용하여 상태 업데이트가 완료되도록 함
      setTimeout(() => {
        filterStudents();
      }, 100);
    } finally {
      setLoading(false);
    }
  };
  
  // 노션에서 수업 정보 가져오기
  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 노션 API를 사용하여 수업 정보 가져오기
      const notionClassInfo = await fetchClassInfoFromNotion();
      setClassInfo(notionClassInfo);
      setUseNotion(true);
      
    } catch (error) {
      console.error('수업 정보를 가져오는 중 오류가 발생했습니다:', error);
      setError('노션에서 수업 정보를 가져오는 중 오류가 발생했습니다. 모의 데이터를 사용합니다.');
      
      // 오류 발생 시 모의 데이터로 폴백
      setClassInfo(mockClassInfo);
      setUseNotion(false);
    } finally {
      setLoading(false);
    }
  };
  
  // 날짜가 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 학생 데이터 및 수업 정보를 가져오기 전에 클래스 정보를 먼저 가져옴
        await fetchClassData();
        await fetchStudentsData();
        
      } catch (error) {
        console.error('데이터 로딩 중 오류가 발생했습니다:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedDate]);
  
  // 컨텍스트 값
  const value = {
    students,
    allStudents,
    selectedDate,
    selectedDayOfWeek,
    selectedClassTime,
    handleDateChange,
    handleDayChange,
    handleClassTimeChange,
    formatDate,
    getDayName,
    classInfo,
    loading,
    error,
    arrivalStatus,
    departureStatus,
    studentLocations,
    toggleArrivalStatus,
    toggleDepartureStatus,
    updateStudentLocation,
    useNotion
  };
  
  return (
    <PickupContext.Provider value={value}>
      {children}
    </PickupContext.Provider>
  );
}; 