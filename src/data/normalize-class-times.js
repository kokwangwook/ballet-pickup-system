// 수업 시간을 24시간 형식으로 통일하는 스크립트
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

// 시간 형식 변환 함수
function convertToStandardTime(timeString) {
  if (!timeString) return timeString;
  
  // 이미 24시간 형식인 경우 그대로 반환
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString;
  }
  
  // 12시간 형식을 24시간 형식으로 변환
  const timeMap = {
    '3:30': '15:30',
    '3:40': '15:40',
    '4:30': '16:30',
    '4:40': '16:40',
    '5:30': '17:30',
    '5:40': '17:40',
    '6:30': '18:30',
    '6:40': '18:40',
    '7:30': '19:30',
    '7:40': '19:40'
  };
  
  return timeMap[timeString] || timeString;
}

// 수업 정보 업데이트 함수
async function updateClassInfo() {
  try {
    console.log('수업 정보 업데이트를 시작합니다...');
    
    // 수업 정보 가져오기
    const classInfoRef = db.collection('settings').doc('class-info');
    const classInfoDoc = await classInfoRef.get();
    
    if (classInfoDoc.exists) {
      const classInfo = classInfoDoc.data();
      console.log('현재 수업 정보:', classInfo);
      
      // 수업 시간 목록 업데이트
      if (classInfo.수업_시간_목록) {
        const updatedTimeList = classInfo.수업_시간_목록.map(time => {
          const standardTime = convertToStandardTime(time);
          console.log(`시간 변환: ${time} -> ${standardTime}`);
          return standardTime;
        });
        
        // 중복 제거
        const uniqueTimeList = [...new Set(updatedTimeList)].sort();
        console.log('업데이트된 수업 시간 목록:', uniqueTimeList);
        
        // Firestore 업데이트
        await classInfoRef.update({
          수업_시간_목록: uniqueTimeList,
          총_수업_시간_수: uniqueTimeList.length,
          updatedAt: new Date().toISOString()
        });
        
        console.log('수업 정보가 성공적으로 업데이트되었습니다.');
      } else {
        console.log('수업 시간 목록이 없습니다.');
      }
    } else {
      console.log('수업 정보 문서가 존재하지 않습니다.');
    }
  } catch (error) {
    console.error('수업 정보 업데이트 중 오류 발생:', error);
  }
}

// 학생 정보 업데이트 함수
async function updateStudentClassTimes() {
  try {
    console.log('학생 수업 시간 업데이트를 시작합니다...');
    
    // 모든 학생 데이터 가져오기
    const studentsSnapshot = await db.collection('students').get();
    console.log(`총 ${studentsSnapshot.size}명의 학생 데이터를 가져왔습니다.`);
    
    const updatePromises = [];
    
    studentsSnapshot.forEach(doc => {
      const student = doc.data();
      const studentId = doc.id;
      let needsUpdate = false;
      const updates = {};
      
      // classTime 필드 업데이트
      if (student.classTime) {
        const standardTime = convertToStandardTime(student.classTime);
        if (standardTime !== student.classTime) {
          updates.classTime = standardTime;
          needsUpdate = true;
          console.log(`학생 ${student.name}의 classTime 업데이트: ${student.classTime} -> ${standardTime}`);
        }
      }
      
      // classTimes 객체 업데이트
      if (student.classTimes && typeof student.classTimes === 'object') {
        const updatedClassTimes = {};
        let classTimesChanged = false;
        
        Object.keys(student.classTimes).forEach(day => {
          const time = student.classTimes[day];
          if (time) {
            const standardTime = convertToStandardTime(time);
            updatedClassTimes[day] = standardTime;
            if (standardTime !== time) {
              classTimesChanged = true;
              console.log(`학생 ${student.name}의 ${day}요일 수업 시간 업데이트: ${time} -> ${standardTime}`);
            } else {
              updatedClassTimes[day] = time;
            }
          } else {
            updatedClassTimes[day] = time;
          }
        });
        
        if (classTimesChanged) {
          updates.classTimes = updatedClassTimes;
          needsUpdate = true;
        }
      }
      
      // 업데이트가 필요한 경우 Firestore 업데이트
      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        updatePromises.push(
          db.collection('students').doc(studentId).update(updates)
            .then(() => {
              console.log(`학생 ${student.name}의 수업 시간이 성공적으로 업데이트되었습니다.`);
              return { name: student.name, success: true };
            })
            .catch(error => {
              console.error(`학생 ${student.name}의 수업 시간 업데이트 실패:`, error);
              return { name: student.name, success: false, error: error.message };
            })
        );
      }
    });
    
    // 모든 업데이트 완료 대기
    if (updatePromises.length > 0) {
      const results = await Promise.all(updatePromises);
      
      // 결과 요약
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      console.log('\n===== 업데이트 결과 요약 =====');
      console.log(`총 ${results.length}명의 학생 수업 시간 처리`);
      console.log(`성공: ${successCount}명`);
      console.log(`실패: ${failCount}명`);
      
      if (failCount > 0) {
        console.log('\n===== 실패한 학생 목록 =====');
        results.filter(r => !r.success).forEach(r => {
          console.log(`${r.name}: ${r.error}`);
        });
      }
    } else {
      console.log('업데이트가 필요한 학생이 없습니다.');
    }
  } catch (error) {
    console.error('학생 수업 시간 업데이트 중 오류 발생:', error);
  }
}

// 메인 함수
async function main() {
  try {
    // 수업 정보 업데이트
    await updateClassInfo();
    
    // 학생 수업 시간 업데이트
    await updateStudentClassTimes();
    
    console.log('모든 업데이트가 완료되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('업데이트 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main(); 