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
  
  // 학생 데이터 상태
  const [students, setStudents] = useState([]);
  
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
      const processedStudents = activeStudents.map(student => ({
        id: student.id,
        name: student.name,
        shortId: student.shortId,
        classes: [student.classTime],
        registrationType: student.registrationType,
        waitingNumber: student.waitingNumber
      }));
      
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
      
      setStudents(processedStudents);
      setArrivalStatus(initialArrivalStatus);
      setDepartureStatus(initialDepartureStatus);
      setStudentLocations(initialLocations);
      setUseNotion(true);
      
    } catch (error) {
      console.error('학생 데이터를 가져오는 중 오류가 발생했습니다:', error);
      setError('노션에서 데이터를 가져오는 중 오류가 발생했습니다. 모의 데이터를 사용합니다.');
      
      // 오류 발생 시 모의 데이터로 폴백
      setStudents(mockStudents);
      
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
    classInfo,
    studentLocations,
    selectedDate,
    setSelectedDate,
    formatDate,
    calculateTimes,
    arrivalStatus,
    departureStatus,
    toggleArrivalStatus,
    toggleDepartureStatus,
    updateStudentLocation,
    loading,
    error,
    useNotion
  };
  
  return (
    <PickupContext.Provider value={value}>
      {children}
    </PickupContext.Provider>
  );
}; 