import { Client } from '@notionhq/client';

// Notion API 키 설정
const NOTION_API_KEY = process.env.NOTION_API_KEY;

// Notion 클라이언트 초기화
const notion = new Client({ auth: NOTION_API_KEY });

export default async function handler(req, res) {
  // POST 요청만 처리
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    console.log("상태 업데이트 API 핸들러 호출됨");
    console.log("API 키 유무 확인:", !!NOTION_API_KEY);
    
    if (!NOTION_API_KEY) {
      return res.status(500).json({ 
        error: "서버 환경 변수가 설정되지 않았습니다. NOTION_API_KEY를 확인하세요." 
      });
    }
    
    // 요청 본문에서 필요한 정보 추출
    const { pageId, property, status } = req.body;
    
    if (!pageId || !property) {
      return res.status(400).json({ error: "pageId와 property는 필수 항목입니다." });
    }
    
    console.log(`학생 ID: ${pageId}, 속성: ${property}, 상태: ${status}`);
    
    // 테스트 모드에서는 실제 API 호출 없이 성공 반환
    if (process.env.NODE_ENV === 'development' || !NOTION_API_KEY) {
      console.log("테스트 모드: 실제 Notion API 호출 없이 성공 반환");
      return res.status(200).json({ success: true, mockResponse: true });
    }
    
    // Notion 페이지 업데이트
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        [property]: {
          checkbox: status
        }
      }
    });
    
    console.log("Notion 업데이트 성공");
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Notion API 요청 오류:", error);
    return res.status(500).json({ error: error.message });
  }
} 