require('dotenv').config();
const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors());
app.use(express.json());

// 정적 파일 제공 (빌드된 React 앱)
app.use(express.static(path.join(__dirname, 'build')));

// 노션 클라이언트 설정
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

console.log('환경 변수 확인:');
console.log('NOTION_API_KEY 존재 여부:', !!NOTION_API_KEY);
console.log('NOTION_API_KEY 길이:', NOTION_API_KEY ? NOTION_API_KEY.length : 0);
console.log('NOTION_DATABASE_ID 존재 여부:', !!DATABASE_ID);
console.log('NOTION_DATABASE_ID 길이:', DATABASE_ID ? DATABASE_ID.length : 0);

if (!NOTION_API_KEY || !DATABASE_ID) {
  console.error('경고: Notion API 키 또는 데이터베이스 ID가 설정되지 않았습니다!');
}

const notion = new Client({
  auth: NOTION_API_KEY
});

// 학생 목록 가져오기
app.get('/api/students', async (req, res) => {
  try {
    console.log('학생 데이터 요청 수신됨');
    console.log('DATABASE_ID:', DATABASE_ID);

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: '수업시간',
          direction: 'ascending',
        },
      ],
    });
    
    console.log('노션 API 응답 결과:', {
      총_결과_수: response.results.length,
      첫_페이지_ID: response.results.length > 0 ? response.results[0].id : '결과 없음'
    });
    
    const students = response.results.map(page => {
      // 노션 페이지 ID
      const id = page.id;
      
      // 학생 이름
      const name = page.properties['이름']?.title[0]?.plain_text || '';
      
      // 단축번호
      const shortId = page.properties['단축번호']?.number || 0;
      
      // 수업 시간
      const classTime = page.properties['수업시간']?.select?.name || '';
      
      // 등원 시간
      const arrivalTime = page.properties['등원 시간']?.rich_text[0]?.plain_text || '';
      
      // 하원 시간
      const departureTime = page.properties['하원 시간']?.rich_text[0]?.plain_text || '';
      
      // 등원 위치
      const arrivalLocation = page.properties['등원 위치']?.rich_text[0]?.plain_text || '';
      
      // 하원 위치
      const departureLocation = page.properties['하원 위치']?.rich_text[0]?.plain_text || '';
      
      // 등원 상태
      const arrivalStatus = page.properties['등원 상태']?.select?.name === '완료';
      
      // 하원 상태
      const departureStatus = page.properties['하원 상태']?.select?.name === '완료';
      
      // 전화번호
      const phoneNumber = page.properties['전화번호']?.phone_number || '';
      
      // 학생여부
      const isActive = page.properties['학생여부']?.select?.name === '여등록' || false;
      
      // 등원여부확인
      const arrivalCheckStatus = page.properties['등원여부확인']?.select?.name || '';
      
      // 하원여부확인
      const departureCheckStatus = page.properties['하원여부확인']?.select?.name || '';
      
      // 등록종류확인
      const registrationType = page.properties['등록종류']?.select?.name || '';
      
      // 대기번호
      const waitingNumber = page.properties['대기번호']?.number || null;

      return {
        id,
        name,
        shortId,
        classTime,
        arrivalTime,
        departureTime,
        arrivalLocation,
        departureLocation,
        arrivalStatus,
        departureStatus,
        phoneNumber,
        isActive,
        arrivalCheckStatus,
        departureCheckStatus,
        registrationType,
        waitingNumber
      };
    });
    
    // 활성화된 학생만 필터링
    const activeStudents = students.filter(student => student.isActive);
    
    console.log('전체 학생 수:', students.length);
    console.log('활성화된 학생 수:', activeStudents.length);
    
    res.json(students);
  } catch (error) {
    console.error('노션 API 오류:', error);
    res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 수업 정보 가져오기
app.get('/api/class-info', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });

    // 고유한 수업 시간 추출
    const classTimeSet = new Set();
    response.results.forEach(page => {
      const classTime = page.properties['수업시간']?.select?.name;
      if (classTime) classTimeSet.add(classTime);
    });

    // 수업 시간별 정보 구성
    const classInfo = {};
    for (const classTime of classTimeSet) {
      const studentsInClass = response.results.filter(
        page => page.properties['수업시간']?.select?.name === classTime
      );
      
      if (studentsInClass.length > 0) {
        const firstStudent = studentsInClass[0];
        
        // 등하원 위치를 위한 모든 데이터 수집
        const locations = {};
        let locationCounter = 1;
        
        studentsInClass.forEach(student => {
          const arrivalLoc = student.properties['등원 위치']?.rich_text[0]?.plain_text;
          const departureLoc = student.properties['하원 위치']?.rich_text[0]?.plain_text;
          
          if (arrivalLoc && !Object.values(locations).includes(arrivalLoc)) {
            locations[locationCounter] = arrivalLoc;
            locationCounter++;
          }
          
          if (departureLoc && !Object.values(locations).includes(departureLoc)) {
            locations[locationCounter] = departureLoc;
            locationCounter++;
          }
        });
        
        classInfo[classTime] = {
          startTime: firstStudent.properties['수업 시작']?.rich_text[0]?.plain_text || '',
          endTime: firstStudent.properties['수업 종료']?.rich_text[0]?.plain_text || '',
          locations: locations
        };
      }
    }

    res.json(classInfo);
  } catch (error) {
    console.error('노션 API 오류:', error);
    res.status(500).json({ error: '수업 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 상태 업데이트
app.post('/api/update-status', async (req, res) => {
  const { pageId, property, status } = req.body;
  
  try {
    const propertyValueMap = {
      '등원 상태': {
        select: {
          name: status ? '완료' : '대기중'
        }
      },
      '하원 상태': {
        select: {
          name: status ? '완료' : '대기중'
        }
      },
      '등원여부확인': {
        select: {
          name: status ? 'O' : 'X'
        }
      },
      '하원여부확인': {
        select: {
          name: status ? 'O' : 'X'
        }
      }
    };

    await notion.pages.update({
      page_id: pageId,
      properties: {
        [property]: propertyValueMap[property]
      }
    });

    // 등하원 상태가 변경되면 해당하는 확인 상태도 함께 업데이트
    if (property === '등원 상태') {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          '등원여부확인': propertyValueMap['등원여부확인']
        }
      });
    } else if (property === '하원 상태') {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          '하원여부확인': propertyValueMap['하원여부확인']
        }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('상태 업데이트 오류:', error);
    res.status(500).json({ error: '상태 업데이트 중 오류가 발생했습니다.' });
  }
});

// 모든 요청을 리액트 앱으로 포워딩
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
  console.log('노션 API 키:', process.env.NOTION_API_KEY ? '설정됨' : '설정되지 않음');
  console.log('노션 데이터베이스 ID:', process.env.NOTION_DATABASE_ID ? '설정됨' : '설정되지 않음');
}); 