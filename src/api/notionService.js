import { Client } from '@notionhq/client';

// 노션 API 키와 데이터베이스 ID 설정
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 노션 클라이언트 초기화
const notion = new Client({ 
  auth: NOTION_API_KEY,
  fetch: (url, options) => {
    // API 요청 URL에서 '/v1'만 유지 (프록시 사용 시)
    const proxyUrl = url.includes('api.notion.com') 
      ? url.replace('https://api.notion.com', '/v1') 
      : url;
    
    // 헤더 설정
    const headers = {
      ...options.headers,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };

    return fetch(proxyUrl, {
      ...options,
      headers,
    });
  }
});

/**
 * API 경로를 현재 환경에 맞게 구성하는 함수
 * @param {string} endpoint API 엔드포인트 경로
 * @returns {string} 완전한 API URL
 */
const getApiUrl = (endpoint) => {
  // 현재 URL과 호스트명 로깅
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  
  console.log('Notion API - 현재 URL:', currentUrl);
  console.log('Notion API - 호스트명:', hostname);
  
  // 로컬 환경인지 확인 (확실한 방법으로)
  const isLocalhost = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') ||
    hostname.includes('.local');
  
  // 로컬 개발 환경이면 /api/* 형태로, 그 외에는 모두 /.netlify/functions/api 형태로 구성
  const baseUrl = isLocalhost ? '' : '/.netlify/functions';
  
  const fullUrl = `${baseUrl}${endpoint}`;
  console.log(`Notion API 요청 URL 구성: ${fullUrl} (로컬 환경: ${isLocalhost})`);
  
  return fullUrl;
};

/**
 * Notion API 서비스 모듈
 * Notion 데이터베이스에서 학생 및 수업 정보를 가져오고 관리하는 함수들을 제공합니다.
 */

/**
 * Notion API에서 학생 데이터를 가져오는 함수
 * @returns {Promise<Array>} 학생 목록
 */
export const fetchStudentsFromNotion = async () => {
  try {
    console.log("Notion API에서 학생 데이터를 불러오는 중...");
    const apiUrl = getApiUrl('/api/notion');
    console.log("Notion API 호출 URL:", apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    
    // 데이터가 비어있는지 확인
    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn("Notion에서 받은 학생 데이터가 없습니다.");
      return [];
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
      } else {
        console.warn(`학생 ${name}의 수업 시간 정보가 없습니다.`);
        // 임시 조치: 기본 수업 시간 할당
        classTimes = ["15:30", "16:30", "17:30", "18:30"];
      }
      
      // 처리된 학생 데이터 객체 생성
      return {
        id: student.id,
        name: name,
        shortNumber: String(shortId),
        classes: classTimes,
        isActive: true // 모든 학생을 활성 상태로 설정
      };
    }).filter(student => student !== null); // null 값 제거
    
    return processedStudents;
  } catch (error) {
    console.error("Notion에서 학생 데이터 가져오기 오류:", error);
    throw error;
  }
};

/**
 * Notion API에서 수업 정보를 가져오는 함수
 * @returns {Promise<Object>} 수업 정보
 */
export const fetchClassInfoFromNotion = async () => {
  try {
    console.log("Notion API에서 수업 정보를 불러오는 중...");
    const apiUrl = getApiUrl('/api/class-info');
    console.log("수업 정보 API 호출 URL:", apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`서버 응답이 올바르지 않습니다. 상태 코드: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("노션에서 수업 정보를 가져오는 중 오류가 발생했습니다:", error);
    // 오류 발생 시 기본 수업 정보 반환
    return getDefaultClassInfo();
  }
};

/**
 * Notion에서 학생 상태를 업데이트하는 함수
 * @param {string} studentId 학생 ID
 * @param {string} statusType 상태 유형
 * @param {any} status 새 상태 값
 * @returns {Promise<boolean>} 업데이트 성공 여부
 */
export const updateStudentStatusInNotion = async (studentId, statusType, status) => {
  try {
    console.log(`학생 ${studentId}의 ${statusType} 상태를 ${status}로 업데이트 중...`);
    const apiUrl = getApiUrl(`/api/notion/student/${studentId}/status`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statusType,
        status
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("노션에서 학생 상태를 업데이트하는 중 오류가 발생했습니다:", error);
    return false;
  }
};

/**
 * 기본 수업 정보를 반환하는 함수
 * @returns {Object} 기본 수업 정보
 */
function getDefaultClassInfo() {
  return {
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
  };
}

export default {
  fetchStudentsFromNotion,
  updateStudentStatusInNotion,
  fetchClassInfoFromNotion
}; 