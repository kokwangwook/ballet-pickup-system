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
 * 노션 데이터베이스에서 학생 데이터를 가져옵니다.
 */
export const fetchStudentsFromNotion = async () => {
  try {
    // 배포 환경에서도 작동하도록 URL을 완전한 경로로 구성
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/students`;
    console.log("API 호출 URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`서버 응답이 올바르지 않습니다. 상태 코드: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API 응답 데이터:", data);
    console.log("데이터 길이:", data.length);
    console.log("첫 번째 학생 데이터:", data.length > 0 ? data[0] : "학생 데이터 없음");
    
    // 서버 응답은 성공했지만 데이터가 비어있는 경우
    if (data.length === 0) {
      console.warn("노션 데이터베이스에서 학생 정보를 찾을 수 없습니다. 선택한 날짜에 데이터가 있는지 확인하세요.");
    }
    
    return data;
  } catch (error) {
    console.error('노션에서 데이터를 가져오는 중 오류가 발생했습니다:', error);
    throw error;
  }
};

/**
 * 노션 데이터베이스의 특정 학생 상태를 업데이트합니다.
 */
export const updateStudentStatusInNotion = async (pageId, property, status) => {
  try {
    // 배포 환경에서도 작동하도록 URL을 완전한 경로로 구성
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/update-status`;
    console.log("상태 업데이트 API 호출 URL:", url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageId,
        property,
        status
      })
    });
    
    if (!response.ok) {
      throw new Error(`서버 응답이 올바르지 않습니다. 상태 코드: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('노션 데이터 업데이트 중 오류가 발생했습니다:', error);
    throw error;
  }
};

/**
 * 노션 데이터베이스에서 수업 정보 및 위치 데이터를 가져옵니다.
 */
export const fetchClassInfoFromNotion = async () => {
  try {
    // 배포 환경에서도 작동하도록 URL을 완전한 경로로 구성
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/class-info`;
    console.log("수업 정보 API 호출 URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`서버 응답이 올바르지 않습니다. 상태 코드: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("수업 정보 API 응답 데이터:", data);
    console.log("수업 시간 항목 수:", Object.keys(data).length);
    
    // 서버 응답은 성공했지만 데이터가 비어있는 경우
    if (Object.keys(data).length === 0) {
      console.warn("노션 데이터베이스에서 수업 정보를 찾을 수 없습니다.");
    }
    
    return data;
  } catch (error) {
    console.error('노션에서 수업 정보를 가져오는 중 오류가 발생했습니다:', error);
    throw error;
  }
};

export default {
  fetchStudentsFromNotion,
  updateStudentStatusInNotion,
  fetchClassInfoFromNotion
}; 