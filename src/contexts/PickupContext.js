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
  
  // 처리된 학생 데이터
  const [processedStudents, setProcessedStudents] = useState([]);
  
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
      if (student.classes) {
        student.classes.forEach(classTime => {
          allClassTimes.add(classTime);
        });
      }
    });
    
    console.log('모든 수업 시간 목록:', Array.from(allClassTimes));
    console.log(`${getDayName(dayIndex)}요일 수업 진행 중: 총 ${studentList.length}명의 학생`);
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
    
    // 기본적으로 모든 학생 선택
    let filteredStudents = [...allStudents];
    
    // 특정 수업 시간이 선택된 경우만 필터링 적용
    if (selectedClassTime !== 'all') {
      filteredStudents = allStudents.filter(student => {
        // classes 배열이 있고, 선택된 시간이 포함되어 있는지 확인
        return student.classes && 
               student.classes.some(classTime => classTime === selectedClassTime);
      });
      
      console.log(`${selectedClassTime} 시간대 학생 필터링 결과: ${filteredStudents.length}명`);
    } else {
      console.log("모든 시간대 학생 표시");
    }
    
    // 필터링 결과가 없으면 전체 학생 표시
    if (filteredStudents.length === 0) {
      console.log("필터링 결과가 없어 전체 학생을 표시합니다.");
      setStudents(allStudents);
    } else {
      setStudents(filteredStudents);
    }
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

      // 학생 데이터 정보를 처리하여 필요한 정보만 추출
      const processedStudents = data.results.map(student => {
        // properties 확인
        if (!student.properties) {
          console.warn("학생 데이터에 properties가 없습니다:", student);
          return null;
        }
        
        const properties = student.properties;
        
        // 필요한 속성들이 있는지 확인
        const hasName = properties.Name && properties.Name.title && properties.Name.title.length > 0;
        const hasClassTime = properties.ClassTime && properties.ClassTime.rich_text && properties.ClassTime.rich_text.length > 0;
        const shortId = properties.ShortId?.number || Math.floor(Math.random() * 100); // ShortId가 없으면 임의의 번호 생성
        
        if (!hasName) {
          console.warn("학생 이름이 없습니다:", student);
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
          classTimes = ["10:00", "14:00", "16:00", "18:00"];
        }
        
        // 처리된 학생 데이터 객체 생성
        return {
          id: student.id,
          name: name,
          shortId: shortId,
          classes: classTimes,
          isActive: true // 모든 학생을 활성 상태로 설정
        };
      }).filter(student => student !== null); // null 값 제거
      
      console.log("처리된 학생 데이터:", processedStudents);
      
      // 학생 위치 초기화
      const initialLocations = {};
      processedStudents.forEach(student => {
        initialLocations[student.id] = {
          arrival: 1,  // 기본값: 위치 1
          departure: 1 // 기본값: 위치 1
        };
      });
      setStudentLocations(initialLocations);
      
      // 도착/출발 상태 초기화
      const initialArrival = {};
      const initialDeparture = {};
      processedStudents.forEach(student => {
        initialArrival[student.id] = false;
        initialDeparture[student.id] = false;
      });
      setArrivalStatus(initialArrival);
      setDepartureStatus(initialDeparture);
      
      // 상태 업데이트
      setAllStudents(processedStudents);
      setStudents(processedStudents);
      
      setUseNotion(true);
      setLoading(false);
    } catch (error) {
      console.error("학생 데이터 가져오기 오류:", error);
      setError("학생 데이터를 가져오는 중에 오류가 발생했습니다.");
      
      // 오류 발생 시 테스트 데이터로 대체
      console.log("오류로 인해 테스트 데이터를 사용합니다.");
      const testStudents = [];
      const classTimeOptions = ["10:00", "14:00", "16:00", "18:00"];
      
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
      const initialLocations = {};
      testStudents.forEach(student => {
        initialLocations[student.id] = {
          arrival: 1,
          departure: 1
        };
      });
      setStudentLocations(initialLocations);
      
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
  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Notion API를 사용하여 수업 정보 가져오기
      console.log("Notion API에서 수업 정보를 불러오는 중...");
      const notionClassInfo = await fetchClassInfoFromNotion();
      setClassInfo(notionClassInfo);
      setUseNotion(true);
      
      setLoading(false);
    } catch (error) {
      console.error('수업 정보를 가져오는 중 오류가 발생했습니다:', error);
      setError('노션에서 수업 정보를 가져오는 중 오류가 발생했습니다. 모의 데이터를 사용합니다.');
      
      // 오류 발생 시 테스트 데이터로 폴백
      console.log("오류로 인해 테스트 수업 정보를 사용합니다.");
      const testClassInfo = {
        "10:00": {
          startTime: "10:00",
          endTime: "11:00",
          locations: {
            1: "학원 앞",
            2: "공원 입구",
            3: "중앙역"
          }
        },
        "14:00": {
          startTime: "14:00",
          endTime: "15:00",
          locations: {
            1: "학원 앞",
            2: "공원 입구",
            3: "중앙역"
          }
        },
        "16:00": {
          startTime: "16:00",
          endTime: "17:00",
          locations: {
            1: "학원 앞",
            2: "공원 입구",
            3: "중앙역"
          }
        },
        "18:00": {
          startTime: "18:00",
          endTime: "19:00",
          locations: {
            1: "학원 앞",
            2: "공원 입구",
            3: "중앙역"
          }
        }
      };
      
      setClassInfo(testClassInfo);
      setUseNotion(false);
      setLoading(false);
    }
  };
  
  // 학생 데이터 가져오기
  const fetchStudents = async () => {
    setLoading(true);
    try {
      // 서버 API 호출
      const response = await fetch('/api/students');
      
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API 응답 데이터:', data);
      
      setAllStudents(data);
      setStudents(data);
      
      // 초기 학생 등하원 상태 설정
      const initialArrivalStatus = {};
      const initialDepartureStatus = {};
      
      data.forEach(student => {
        initialArrivalStatus[student.id] = student.arrivalStatus || false;
        initialDepartureStatus[student.id] = student.departureStatus || false;
      });
      
      setArrivalStatus(initialArrivalStatus);
      setDepartureStatus(initialDepartureStatus);
      
    } catch (error) {
      console.error('학생 데이터 가져오기 오류:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 학생 추가 함수
  const addStudent = async (studentData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '학생 등록에 실패했습니다.');
      }

      const newStudent = await response.json();
      
      // 상태 업데이트
      setAllStudents(prev => [...prev, newStudent]);
      setStudents(prev => [...prev, newStudent]);
      
      // 등하원 상태 업데이트
      setArrivalStatus(prev => ({
        ...prev,
        [newStudent.id]: false
      }));
      
      setDepartureStatus(prev => ({
        ...prev,
        [newStudent.id]: false
      }));
      
      return newStudent;
    } catch (error) {
      console.error('학생 등록 오류:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 학생 정보 수정 함수
  const updateStudent = async (studentId, studentData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '학생 정보 수정에 실패했습니다.');
      }

      const updatedStudent = await response.json();
      
      // 상태 업데이트
      setAllStudents(prev => 
        prev.map(student => student.id === studentId ? updatedStudent : student)
      );
      
      setStudents(prev => 
        prev.map(student => student.id === studentId ? updatedStudent : student)
      );
      
      return updatedStudent;
    } catch (error) {
      console.error('학생 정보 수정 오류:', error);
      setError(error.message);
      throw error;
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
    toggleArrivalStatus,
    toggleDepartureStatus,
    updateStudentLocation,
    useNotion,
    fetchStudents,
    addStudent,
    updateStudent
  };
  
  return (
    <PickupContext.Provider value={value}>
      {children}
    </PickupContext.Provider>
  );
}; 