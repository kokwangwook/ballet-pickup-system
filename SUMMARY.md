# 발레 픽업 시스템 구현 요약

## 프로젝트 구조

```
ballet-pickup-system/
├── node_modules/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── api/
│   ├── components/
│   │   ├── StatusToggleButton.js
│   │   ├── StudentTable.js
│   │   └── VehicleSection.js
│   ├── contexts/
│   │   └── PickupContext.js
│   ├── data/
│   │   └── mockData.js
│   ├── hooks/
│   ├── styles/
│   ├── utils/
│   ├── App.js
│   └── index.js
├── package.json
├── package-lock.json
└── README.md
```

## 주요 컴포넌트 설명

1. **StudentTable.js**
   - 메인 컴포넌트
   - 날짜 선택, 통계 정보, 수업별 학생 목록 표시
   - PC/모바일 반응형 레이아웃 적용

2. **VehicleSection.js**
   - 각 수업 시간별 학생 목록 표시
   - PC 버전에서는 테이블 형식, 모바일에서는 카드 형식으로 표시
   - 등하원 시간, 위치, 상태 표시

3. **StatusToggleButton.js**
   - 등하원 상태 토글 버튼 (대기중/완료)
   - 차량 탑승하지 않는 학생은 비활성화
   - 색상으로 상태 구분 (대기중: 주황색, 완료: 초록색)

## 데이터 관리

1. **PickupContext.js**
   - Context API를 사용한 상태 관리
   - 학생 목록, 수업 정보, 등하원 상태 관리
   - 날짜 변경, 상태 토글 등의 기능 제공

2. **mockData.js**
   - 학생 데이터, 수업 정보, 학생별 위치 정보 등의 더미 데이터 제공

## 주요 기능

1. **날짜별 학생 관리**
   - 날짜 선택기 (DatePicker)
   - 요일 버튼으로 빠른 날짜 이동

2. **시간대별 그룹화**
   - 3:40, 4:40, 5:40, 6:40, 7:40 수업별로 학생 목록 표시

3. **등하원 시간 자동 계산**
   - 등원: 수업 시작 40분 전
   - 하원: 수업 종료 50분 후

4. **상태 관리**
   - 등원 상태와 하원 상태 독립적으로 관리
   - 클릭으로 상태 토글 (대기중 ↔ 완료)

5. **통계 정보**
   - 전체 운행, 등원 완료, 하원 완료, 남은 운행 수 표시

## 기술 스택

1. **프런트엔드**
   - React.js
   - Material-UI
   - Context API (상태 관리)
   - date-fns (날짜/시간 처리)

2. **스타일링**
   - Material-UI 스타일 시스템
   - 반응형 디자인 (PC/모바일)

## 확장 가능성

1. **백엔드 연동**
   - Context API를 실제 API 호출로 대체
   - 실시간 데이터 업데이트 (Socket.io, Firebase 등)

2. **추가 기능**
   - 학생 관리 (추가/수정/삭제)
   - 수업 일정 관리
   - 사용자 인증 (관리자/학부모) 