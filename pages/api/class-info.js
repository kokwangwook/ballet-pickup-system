import { Client } from '@notionhq/client';

// Notion API 키와 데이터베이스 ID 설정
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_CLASS_DATABASE_ID = process.env.NOTION_CLASS_DATABASE_ID || process.env.NOTION_DATABASE_ID;

// Notion 클라이언트 초기화
const notion = new Client({ auth: NOTION_API_KEY });

export default async function handler(req, res) {
  try {
    console.log("수업 정보 API 핸들러 호출됨");
    console.log("API 키 유무 확인:", !!NOTION_API_KEY);
    console.log("수업 데이터베이스 ID 유무 확인:", !!NOTION_CLASS_DATABASE_ID);
    
    if (!NOTION_API_KEY || !NOTION_CLASS_DATABASE_ID) {
      // 환경변수가 없는 경우 샘플 데이터 반환
      console.log("환경 변수가 없어 샘플 데이터를 반환합니다.");
      return res.status(200).json({
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
      });
    }
    
    // Notion 데이터베이스에서 데이터 가져오기
    const response = await notion.databases.query({
      database_id: NOTION_CLASS_DATABASE_ID,
      sorts: [
        {
          property: "ClassTime",
          direction: "ascending",
        },
      ],
    });
    
    console.log(`Notion 응답: ${response.results.length}개의 수업 정보 가져옴`);
    
    // 데이터 변환 (Notion 형식 -> 앱 형식)
    const classData = {};
    
    for (const item of response.results) {
      const properties = item.properties;
      
      if (!properties.ClassTime || !properties.ClassTime.title || properties.ClassTime.title.length === 0) {
        continue;
      }
      
      const classTime = properties.ClassTime.title[0].plain_text;
      const startTime = properties.StartTime?.rich_text?.[0]?.plain_text || classTime;
      const endTime = properties.EndTime?.rich_text?.[0]?.plain_text || 
                      calculateEndTime(startTime);
      
      // 위치 정보 추출
      const locations = {};
      for (let i = 1; i <= 5; i++) {
        const locationProp = `Location${i}`;
        if (properties[locationProp]?.rich_text?.[0]?.plain_text) {
          locations[i] = properties[locationProp].rich_text[0].plain_text;
        }
      }
      
      // 수업 정보 추가
      classData[classTime] = {
        startTime,
        endTime,
        locations
      };
    }
    
    console.log(`변환된 수업 데이터: ${Object.keys(classData).length}개의 항목`);
    
    // 데이터가 없는 경우 샘플 데이터 사용
    if (Object.keys(classData).length === 0) {
      console.log("Notion에서 가져온 수업 데이터가 없어 샘플 데이터를 사용합니다.");
      classData["10:00"] = {
        startTime: "10:00",
        endTime: "11:00",
        locations: { 1: "학원 앞", 2: "공원 입구", 3: "중앙역" }
      };
      classData["14:00"] = {
        startTime: "14:00",
        endTime: "15:00",
        locations: { 1: "학원 앞", 2: "공원 입구", 3: "중앙역" }
      };
      classData["16:00"] = {
        startTime: "16:00",
        endTime: "17:00",
        locations: { 1: "학원 앞", 2: "공원 입구", 3: "중앙역" }
      };
      classData["18:00"] = {
        startTime: "18:00",
        endTime: "19:00",
        locations: { 1: "학원 앞", 2: "공원 입구", 3: "중앙역" }
      };
    }
    
    // 응답 반환
    return res.status(200).json(classData);
  } catch (error) {
    console.error("Notion API 요청 오류:", error);
    return res.status(500).json({ error: error.message });
  }
}

// 종료 시간 계산 (시작 시간 + 1시간)
function calculateEndTime(startTime) {
  const [hours, minutes] = startTime.split(':').map(Number);
  let endHours = hours + 1;
  
  if (endHours >= 24) {
    endHours -= 24;
  }
  
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
} 