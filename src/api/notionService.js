import { Client } from '@notionhq/client';

// 노션 API 키와 데이터베이스 ID 설정
const NOTION_API_KEY = 'ntn_i76479275898o0IU5KP3rbuEVr0Kfx1CTgn8dyx0FcqdId';
const NOTION_DATABASE_ID = '1b11c7da1d258012980cf270bd4ad98d';

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
    const response = await fetch('/api/students');
    
    if (!response.ok) {
      throw new Error('서버 응답이 올바르지 않습니다.');
    }
    
    const data = await response.json();
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
    const response = await fetch('/api/update-status', {
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
      throw new Error('서버 응답이 올바르지 않습니다.');
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
    const response = await fetch('/api/class-info');
    
    if (!response.ok) {
      throw new Error('서버 응답이 올바르지 않습니다.');
    }
    
    const data = await response.json();
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