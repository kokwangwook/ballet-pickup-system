// 학생 데이터와 수업 정보를 포함한 모의 데이터
const students = [
  { id: 1, name: "이재인", shortId: 72, classes: ["3:40"] },
  { id: 2, name: "김서아", shortId: 46, classes: ["3:40"] },
  { id: 3, name: "박가을", shortId: 43, classes: ["3:40"] },
  { id: 4, name: "이지유", shortId: 65, classes: ["4:40"] },
  { id: 5, name: "최라온", shortId: 57, classes: ["4:40"] },
  { id: 6, name: "허가빈", shortId: 69, classes: ["4:40"] },
  { id: 7, name: "정민준", shortId: 33, classes: ["5:40"] },
  { id: 8, name: "송하은", shortId: 28, classes: ["5:40"] },
  { id: 9, name: "강지호", shortId: 91, classes: ["6:40"] },
  { id: 10, name: "윤서윤", shortId: 52, classes: ["6:40"] },
  { id: 11, name: "임도윤", shortId: 85, classes: ["7:40"] },
  { id: 12, name: "오하린", shortId: 39, classes: ["7:40"] }
];

// 수업 시간 정보
const classInfo = {
  "3:40": {
    startTime: "15:00",
    endTime: "16:30",
    arrivalLocation: "연봉음악학원(주변하차장)",
    departureLocation: "연봉음악학원(주변하차장)",
    locations: {
      1: "공통1차 정류장",
      2: "공통2차 정류장",
      3: "한빛유치원(3:30)"
    }
  },
  "4:40": {
    startTime: "16:00",
    endTime: "17:30",
    arrivalLocation: "예시장 1120동",
    departureLocation: "예시장 1120동",
    locations: {
      1: "예시장1111동",
      2: "한빛유치원(3:30)"
    }
  },
  "5:40": {
    startTime: "17:00",
    endTime: "18:30",
    arrivalLocation: "중앙초등학교",
    departureLocation: "중앙초등학교",
    locations: {
      1: "미래아파트 정문",
      2: "행복마을 3단지"
    }
  },
  "6:40": {
    startTime: "18:00",
    endTime: "19:30",
    arrivalLocation: "초록마을 후문",
    departureLocation: "초록마을 후문",
    locations: {
      1: "푸른숲 아파트",
      2: "해돋이 공원"
    }
  },
  "7:40": {
    startTime: "19:00",
    endTime: "20:30",
    arrivalLocation: "별빛 아파트",
    departureLocation: "별빛 아파트",
    locations: {
      1: "달빛 초등학교",
      2: "햇살 공원"
    }
  }
};

// 학생별 위치 정보 (초기값)
const studentLocations = {
  1: { arrival: 1, departure: 1 },
  2: { arrival: 1, departure: 1 },
  3: { arrival: 2, departure: 2 },
  4: { arrival: null, departure: null },
  5: { arrival: 1, departure: 1 },
  6: { arrival: 2, departure: 2 },
  7: { arrival: 1, departure: 1 },
  8: { arrival: 2, departure: 2 },
  9: { arrival: 1, departure: 1 },
  10: { arrival: 2, departure: 2 },
  11: { arrival: 1, departure: 1 },
  12: { arrival: 2, departure: 2 }
};

export { students, classInfo, studentLocations }; 