import { Client } from '@notionhq/client';

// Notion API 키와 데이터베이스 ID 설정
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Notion 클라이언트 초기화
const notion = new Client({ auth: NOTION_API_KEY });

export default async function handler(req, res) {
  try {
    console.log("학생 API 핸들러 호출됨");
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
    
    // 데이터 변환 (Notion 형식 -> 앱 형식)
    const studentsData = response.results.map(student => {
      const properties = student.properties;
      
      // 필요한 속성들이 있는지 확인
      const hasName = properties.Name && properties.Name.title && properties.Name.title.length > 0;
      const hasClassTime = properties.ClassTime && properties.ClassTime.rich_text && properties.ClassTime.rich_text.length > 0;
      const shortId = properties.ShortId?.number || Math.floor(Math.random() * 100);
      
      if (!hasName) {
        return null;
      }
      
      const name = hasName ? properties.Name.title[0].plain_text : "이름 없음";
      
      // 클래스 시간 추출
      let classTimes = [];
      
      if (hasClassTime) {
        const classTimeText = properties.ClassTime.rich_text[0].plain_text;
        
        // 쉼표, 공백, 그리고 기타 구분자로 나눔
        classTimes = classTimeText.split(/[,;/\s]+/).filter(time => time.trim() !== '');
        
        // 정규표현식을 사용하여 시간 형식 (예: "10:00", "14:30") 추출
        const timePattern = /\d{1,2}:\d{2}/g;
        const extractedTimes = classTimeText.match(timePattern);
        
        if (extractedTimes) {
          extractedTimes.forEach(time => {
            if (!classTimes.includes(time)) {
              classTimes.push(time);
            }
          });
        }
      }
      
      // 처리된 학생 데이터 객체 생성
      return {
        id: student.id,
        name: name,
        shortId: shortId,
        classes: classTimes.length > 0 ? classTimes : ["10:00", "14:00", "16:00", "18:00"]
      };
    }).filter(student => student !== null);
    
    console.log(`변환된 학생 데이터: ${studentsData.length}명`);
    
    // 응답 반환
    return res.status(200).json(studentsData);
  } catch (error) {
    console.error("Notion API 요청 오류:", error);
    return res.status(500).json({ error: error.message });
  }
} 