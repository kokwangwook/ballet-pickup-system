import { Client } from '@notionhq/client';

// Notion API 키와 데이터베이스 ID 설정
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Notion 클라이언트 초기화
const notion = new Client({ auth: NOTION_API_KEY });

export default async function handler(req, res) {
  try {
    console.log("Notion API 핸들러 호출됨");
    console.log("API 키 유무 확인:", !!NOTION_API_KEY);
    console.log("데이터베이스 ID 유무 확인:", !!NOTION_DATABASE_ID);
    
    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
      return res.status(500).json({ 
        error: "서버 환경 변수가 설정되지 않았습니다. NOTION_API_KEY 및 NOTION_DATABASE_ID를 확인하세요." 
      });
    }
    
    // Notion 데이터베이스에서 데이터 가져오기
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
    });
    
    console.log(`Notion 응답: ${response.results.length}개의 레코드 가져옴`);
    
    // 응답 반환
    return res.status(200).json(response);
  } catch (error) {
    console.error("Notion API 요청 오류:", error);
    return res.status(500).json({ error: error.message });
  }
} 