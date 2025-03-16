// 발레블랑 수업 버스 탑승 명단 정보를 기반으로 학생 정보 업데이트
require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase 초기화
let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
  console.log('Firebase 서비스 계정 파일 경로:', serviceAccountPath);
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
    console.log('Firebase 서비스 계정을 파일에서 로드했습니다.');
  } else {
    console.log('서비스 계정 파일이 존재하지 않습니다. 환경 변수를 사용합니다.');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin이 성공적으로 초기화되었습니다.');
} catch (error) {
  console.error('Firebase 초기화 오류:', error);
  process.exit(1);
}

const db = admin.firestore();

// 학생 정보 업데이트 함수
async function updateStudentInfo() {
  try {
    console.log('학생 정보 업데이트를 시작합니다...');
    
    // 모든 학생 데이터 가져오기
    const studentsSnapshot = await db.collection('students').get();
    const students = [];
    studentsSnapshot.forEach(doc => {
      students.push({
        docId: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`총 ${students.length}명의 학생 데이터를 가져왔습니다.`);
    
    // 업데이트할 학생 정보 정의
    const studentsToUpdate = [
      // 월, 수요일 2시30분 등원 (3시30분 수업)
      {
        name: '최진리',
        shortId: '94',
        motherPhone: '010-9487-4825',
        arrivalLocations: { '월': '애시앙 110동', '수': '애시앙 110동' },
        classDays: ['월', '수'],
        classTime: '3:30'
      },
      {
        name: '이제인',
        shortId: '72',
        classDays: ['월', '화', '수', '목'],
        classTime: '3:30'
      },
      {
        name: '최지원',
        arrivalLocations: { '월': '빛누리초정문', '수': '빛누리초정문' },
        classDays: ['월', '수'],
        classTime: '3:30'
      },
      {
        name: '서라온',
        shortId: '76',
        arrivalLocations: { '월': '빛누리초 에시앙1122동', '수': '빛누리초 에시앙1122동' },
        classDays: ['월', '수'],
        classTime: '3:30'
      },
      {
        name: '고보영',
        shortId: '92',
        arrivalLocations: { '월': '빛누리초' },
        classDays: ['월'],
        classTime: '3:30'
      },
      
      // 등원(5시40분 수업)
      {
        name: '고나윤',
        shortId: '59',
        motherPhone: '010-2121-7124',
        arrivalLocations: { '월': '영무예다음 107동 1-2', '수': '영무예다음 107동 1-2' },
        classDays: ['월', '수'],
        classTime: '5:40'
      },
      {
        name: '박리온',
        shortId: '58',
        motherPhone: '010-7132-0484',
        arrivalLocations: { '월': '영무예다음 107동 1-2', '수': '영무예다음 107동 1-2' },
        classDays: ['월', '수'],
        classTime: '5:40'
      },
      {
        name: '임단아',
        motherPhone: '010-5006-0772',
        arrivalLocations: { '월': '한국방송통신전파진흥원어린이집 별빛반', '수': '한국방송통신전파진흥원어린이집 별빛반' },
        classDays: ['월', '수'],
        classTime: '5:40',
        grade: '5세'
      },
      {
        name: '조서율',
        motherPhone: '010-9658-3131',
        arrivalLocations: { '월': '빛그린유치원', '수': '빛그린유치원' },
        classDays: ['월', '수'],
        classTime: '5:40',
        grade: '6세'
      },
      {
        name: '강한서',
        motherPhone: '010-4321-1121',
        arrivalLocations: { '월': '빛그린유치원 3세 3반', '수': '빛그린유치원 3세 3반' },
        classDays: ['월', '수'],
        classTime: '5:40'
      },
      {
        name: '장하윤',
        shortId: '31',
        arrivalLocations: { '월': '빛누리유치원 (돌봄212번)', '수': '빛누리유치원 (돌봄212번)' },
        classDays: ['월', '수'],
        classTime: '5:40'
      },
      {
        name: '양라윤',
        shortId: '63',
        motherPhone: '010-2170-2220',
        arrivalLocations: { '월': '빛누리유치원 (돌봄212번)', '수': '빛누리유치원 (돌봄212번)' },
        classDays: ['월', '수'],
        classTime: '5:40'
      },
      {
        name: '임예령',
        shortId: '99',
        motherPhone: '010-4174-3623',
        arrivalLocations: { '월': '빛누리 유치원', '수': '빛누리 유치원' },
        classDays: ['월', '수'],
        classTime: '5:40'
      },
      
      // 3시30분 등원(4시40분 수업)
      {
        name: '김은우',
        shortId: '26',
        motherPhone: '010-3899-4437',
        arrivalLocations: { '월': '한빛유치원', '수': '한빛유치원' },
        classDays: ['월', '수'],
        classTime: '4:40',
        grade: '6세'
      },
      {
        name: '김윤서',
        shortId: '27',
        motherPhone: '010-2848-4510',
        arrivalLocations: { '월': '한빛유치원', '수': '한빛유치원' },
        classDays: ['월', '수'],
        classTime: '4:40',
        grade: '7세'
      },
      {
        name: '오윤서',
        motherPhone: '010-8915-3097',
        arrivalLocations: { '월': '빛그린유치원 4세 3반', '수': '빛그린유치원 4세 3반' },
        classDays: ['월', '수'],
        classTime: '4:40',
        grade: '7세'
      },
      {
        name: '최은서',
        shortId: '87',
        motherPhone: '010-6619-7657',
        arrivalLocations: { '월': '빛그린유치원', '수': '빛그린유치원' },
        classDays: ['월', '수'],
        classTime: '4:40',
        grade: '7세'
      },
      {
        name: '김도하',
        shortId: '60',
        motherPhone: '010-7376-4865',
        arrivalLocations: { '월': '빛그린유치원 3세2반', '수': '빛그린유치원 3세2반' },
        classDays: ['월', '수'],
        classTime: '4:40'
      },
      {
        name: '이나은',
        shortId: '100',
        motherPhone: '010-9450-3900',
        arrivalLocations: { '월': '빛그린유치원', '수': '빛그린유치원' },
        classDays: ['월', '수'],
        classTime: '4:40',
        note: '다음주부터'
      },
      {
        name: '김주아',
        shortId: '19',
        motherPhone: '010-9156-0214',
        arrivalLocations: { '월': '빛그린유치원', '수': '빛그린유치원' },
        departureLocations: { '월': '중흥1동101', '수': '중흥1동101' },
        classDays: ['월', '수'],
        classTime: '4:40',
        grade: '5세'
      },
      {
        name: '이지유',
        shortId: '5',
        motherPhone: '010-7700-7148',
        arrivalLocations: { '월': '빛누리 즐거운2반 220번', '수': '빛누리 즐거운2반 220번' },
        departureLocations: { '월': '에시앙 1120동', '수': '에시앙 1120동' },
        classDays: ['월', '수'],
        classTime: '4:40'
      },
      {
        name: '권예나',
        shortId: '13',
        motherPhone: '010-7670-5580',
        arrivalLocations: { '월': '빛누리 즐거운2반 220번', '수': '빛누리 즐거운2반 220번' },
        departureLocations: { '월': '코오롱하늘채', '수': '코오롱하늘채' },
        classDays: ['월', '수'],
        classTime: '4:40'
      },
      {
        name: '최라원',
        shortId: '57',
        motherPhone: '010-6608-2656',
        arrivalLocations: { '월': '빛누리유치원 행복한1반 215번', '수': '빛누리유치원 행복한1반 215번' },
        classDays: ['월', '수'],
        classTime: '4:40'
      },
      
      // 5시40분 하원등원(6시40분수업)
      {
        name: '이지유',
        shortId: '5',
        motherPhone: '010-7700-7148',
        departureLocations: { '월': '에시앙 1120동', '수': '에시앙 1120동' },
        classDays: ['월', '수'],
        classTime: '6:40'
      },
      {
        name: '김윤서',
        shortId: '6',
        motherPhone: '010-2848-4510',
        arrivalLocations: { '월': '트이다학원', '수': '트이다학원' },
        classDays: ['월', '수'],
        classTime: '6:40',
        grade: '7세'
      },
      {
        name: '최은서',
        shortId: '87',
        motherPhone: '010-6619-7657',
        departureLocations: { '월': '부영3차 315동(관리동하차)', '수': '부영3차 315동(관리동하차)' },
        classDays: ['월', '수'],
        classTime: '6:40',
        grade: '7세'
      },
      {
        name: '박연후',
        shortId: '35',
        arrivalLocations: { '월': '대방 102동', '수': '대방 102동', '금': '대방 102동' },
        departureLocations: { '월': '대방 102동', '수': '대방 102동', '금': '대방 102동' },
        classDays: ['월', '수', '금'],
        classTime: '6:40',
        note: '등원'
      },
      
      // 화, 목요일 2시30분 등원(3시30분수업)
      {
        name: '황인아',
        shortId: '97',
        motherPhone: '010-6579-8050',
        arrivalLocations: { '화': '돌봄4반', '목': '돌봄4반' },
        classDays: ['화', '목'],
        classTime: '3:30'
      },
      {
        name: '신소예',
        shortId: '90',
        motherPhone: '010-9246-1915',
        arrivalLocations: { '화': '빛가람초등학교', '목': '빛가람초등학교' },
        classDays: ['화', '목'],
        classTime: '3:30'
      },
      {
        name: '김수아',
        shortId: '84',
        motherPhone: '010-9480-0735',
        arrivalLocations: { '화': '에시앙 1104동 1-2호', '목': '에시앙 1104동 1-2호' },
        classDays: ['화', '목'],
        classTime: '3:30'
      },
      {
        name: '박서희',
        arrivalLocations: { '목': '중흥3차' },
        classDays: ['목'],
        classTime: '3:30'
      },
      {
        name: '이제인',
        shortId: '72',
        arrivalLocations: { '월': '중흥3차', '화': '중흥3차', '수': '중흥3차', '목': '중흥3차' },
        classDays: ['월', '화', '수', '목'],
        classTime: '3:30'
      },
      {
        name: '이라희',
        shortId: '93',
        motherPhone: '010-6487-2215',
        arrivalLocations: { '화': '돌봄교실', '목': '돌봄교실' },
        classDays: ['화', '목'],
        classTime: '3:30',
        note: '강지숙 선생님'
      },
      {
        name: '조믿음',
        shortId: '98',
        motherPhone: '010-4592-8248',
        arrivalLocations: { '화': '돌봄교실', '목': '돌봄교실' },
        classDays: ['화', '목'],
        classTime: '3:30',
        note: '유정애 선생님'
      },
      {
        name: '박가을',
        arrivalLocations: { '화': '중흥1차 108동', '목': '중흥1차 108동' },
        classDays: ['화', '목'],
        classTime: '3:30'
      },
      
      // 3시30분 등원(4시30분 수업)
      {
        name: '서은솔',
        shortId: '74',
        arrivalLocations: { '화': '한빛유치원', '목': '한빛유치원' },
        classDays: ['화', '목'],
        classTime: '4:30'
      },
      {
        name: '권루나',
        shortId: '75',
        motherPhone: '010-2926-9939',
        arrivalLocations: { '화': '한빛유치원', '목': '한빛유치원' },
        classDays: ['화', '목'],
        classTime: '4:30'
      },
      {
        name: '이은서',
        shortId: '80',
        motherPhone: '010-9487-4825',
        arrivalLocations: { '화': '한빛유치원', '목': '한빛유치원' },
        classDays: ['화', '목'],
        classTime: '4:30'
      },
      {
        name: '이서우',
        shortId: '73',
        motherPhone: '010-2541-1938',
        arrivalLocations: { '화': '도담유치원', '목': '도담유치원' },
        classDays: ['화', '목'],
        classTime: '4:30',
        grade: '5세'
      },
      {
        name: '이채원',
        motherPhone: '010-8636-2554',
        arrivalLocations: { '화': '라원유치원', '목': '라원유치원' },
        classDays: ['화', '목'],
        classTime: '4:30'
      },
      {
        name: '김태린',
        motherPhone: '010-8636-2554',
        arrivalLocations: { '화': '라원유치원', '목': '라원유치원' },
        classDays: ['화', '목'],
        classTime: '4:30',
        note: '18일부터 등원'
      },
      {
        name: '김하린',
        shortId: '10',
        arrivalLocations: { '화': '빛누리유치원 (220)', '목': '빛누리유치원 (220)' },
        classDays: ['화', '목'],
        classTime: '4:30'
      },
      {
        name: '김아린',
        arrivalLocations: { '화': '빛누리유치원 (220)', '목': '빛누리유치원 (220)' },
        classDays: ['화', '목'],
        classTime: '4:30'
      },
      
      // 4시30분하원 등원(5시30분수업)
      {
        name: '박가을',
        arrivalLocations: { '화': '중흥1차 108동', '목': '중흥1차 108동' },
        classDays: ['화', '목'],
        classTime: '5:30'
      },
      {
        name: '김유하',
        arrivalLocations: { '화': '써밋빌리지15', '목': '써밋빌리지15' },
        classDays: ['화', '목'],
        classTime: '5:30'
      },
      {
        name: '박서희',
        arrivalLocations: { '화': '중흥3차 303동' },
        classDays: ['화'],
        classTime: '5:30'
      },
      {
        name: '김수아',
        shortId: '84',
        arrivalLocations: { '화': '에시앙 1104동 1-2호 라인', '목': '에시앙 1104동 1-2호 라인' },
        classDays: ['화', '목'],
        classTime: '5:30'
      },
      {
        name: '이제인',
        shortId: '72',
        arrivalLocations: { '월': '중흥3차 311', '화': '중흥3차 311', '수': '중흥3차 311', '목': '중흥3차 311' },
        classDays: ['월', '화', '수', '목'],
        classTime: '5:30'
      },
      {
        name: '신소예',
        shortId: '90',
        arrivalLocations: { '화': 'LH3단지 301동 1~2', '목': 'LH3단지 301동 1~2' },
        classDays: ['화', '목'],
        classTime: '5:30'
      },
      {
        name: '최승리',
        shortId: '96',
        arrivalLocations: { '화': '에시앙1104동', '목': '에시앙1104동' },
        classDays: ['화', '목'],
        classTime: '5:30',
        note: '등원'
      },
      {
        name: '설지유',
        shortId: '91',
        arrivalLocations: { '화': '중흥 209동', '목': '중흥 209동' },
        classDays: ['화', '목'],
        classTime: '5:30',
        note: '등원'
      }
    ];
    
    // 각 학생 정보 업데이트
    const updatePromises = [];
    
    for (const studentInfo of studentsToUpdate) {
      // 이름으로 학생 찾기
      const student = students.find(s => s.name === studentInfo.name);
      
      if (student) {
        console.log(`학생 찾음: ${studentInfo.name} (ID: ${student.docId})`);
        
        // 업데이트할 데이터 준비
        const updateData = {
          updatedAt: new Date().toISOString()
        };
        
        // 단축번호 업데이트
        if (studentInfo.shortId) {
          updateData.shortId = studentInfo.shortId;
        }
        
        // 엄마 전화번호 업데이트
        if (studentInfo.motherPhone) {
          updateData.motherPhone = studentInfo.motherPhone;
        }
        
        // 수업 요일 업데이트
        if (studentInfo.classDays) {
          updateData.classDays = studentInfo.classDays;
        }
        
        // 수업 시간 업데이트
        if (studentInfo.classTime) {
          updateData.classTime = studentInfo.classTime;
        }
        
        // 등원 위치 업데이트
        if (studentInfo.arrivalLocations) {
          updateData.arrivalLocations = {
            ...(student.arrivalLocations || {}),
            ...studentInfo.arrivalLocations
          };
        }
        
        // 하원 위치 업데이트
        if (studentInfo.departureLocations) {
          updateData.departureLocations = {
            ...(student.departureLocations || {}),
            ...studentInfo.departureLocations
          };
        }
        
        // 학년 업데이트
        if (studentInfo.grade) {
          updateData.grade = studentInfo.grade;
        }
        
        // 메모 업데이트
        if (studentInfo.note) {
          updateData.note = studentInfo.note;
        }
        
        // 활성 상태 업데이트
        updateData.isActive = true;
        
        console.log(`업데이트할 데이터:`, updateData);
        
        // Firestore 업데이트
        updatePromises.push(
          db.collection('students').doc(student.docId).update(updateData)
            .then(() => {
              console.log(`학생 정보 업데이트 성공: ${studentInfo.name}`);
              return { name: studentInfo.name, success: true };
            })
            .catch(error => {
              console.error(`학생 정보 업데이트 실패: ${studentInfo.name}`, error);
              return { name: studentInfo.name, success: false, error: error.message };
            })
        );
      } else {
        console.log(`학생을 찾을 수 없음: ${studentInfo.name}`);
        
        // 새 학생 추가 데이터 준비
        const newStudentData = {
          name: studentInfo.name,
          shortId: studentInfo.shortId || '',
          motherPhone: studentInfo.motherPhone || '',
          classDays: studentInfo.classDays || [],
          classTime: studentInfo.classTime || '',
          arrivalLocations: studentInfo.arrivalLocations || {},
          departureLocations: studentInfo.departureLocations || {},
          grade: studentInfo.grade || '',
          note: studentInfo.note || '',
          isActive: true,
          registrationDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log(`새 학생 추가 데이터:`, newStudentData);
        
        // Firestore에 새 학생 추가
        updatePromises.push(
          db.collection('students').add(newStudentData)
            .then(docRef => {
              console.log(`새 학생 추가 성공: ${studentInfo.name} (ID: ${docRef.id})`);
              return { name: studentInfo.name, success: true, newStudent: true, id: docRef.id };
            })
            .catch(error => {
              console.error(`새 학생 추가 실패: ${studentInfo.name}`, error);
              return { name: studentInfo.name, success: false, error: error.message };
            })
        );
      }
    }
    
    // 모든 업데이트 완료 대기
    const results = await Promise.all(updatePromises);
    
    // 결과 요약
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const newStudentCount = results.filter(r => r.success && r.newStudent).length;
    
    console.log('\n===== 업데이트 결과 요약 =====');
    console.log(`총 ${results.length}명의 학생 정보 처리`);
    console.log(`성공: ${successCount}명 (새 학생: ${newStudentCount}명)`);
    console.log(`실패: ${failCount}명`);
    
    if (failCount > 0) {
      console.log('\n===== 실패한 학생 목록 =====');
      results.filter(r => !r.success).forEach(r => {
        console.log(`${r.name}: ${r.error}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('학생 정보 업데이트 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
updateStudentInfo(); 