/**
 * 위치 ID를 파싱하는 함수
 * @param {string} locationId 위치 ID 문자열 (예: "location_1")
 * @returns {number} 파싱된 위치 번호
 */
export const parseLocationId = (locationId) => {
  if (!locationId) return 0;
  const match = locationId.match(/location_(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * 위치 번호로 위치 ID를 생성하는 함수
 * @param {number} locationNumber 위치 번호
 * @returns {string} 생성된 위치 ID
 */
export const createLocationId = (locationNumber) => {
  return `location_${locationNumber}`;
};

/**
 * 위치 정보를 가져오는 함수
 * @param {Array} locations 위치 목록
 * @param {string} locationId 위치 ID
 * @returns {Object|null} 위치 정보 객체 또는 null
 */
export const getLocationById = (locations, locationId) => {
  if (!locations || !locationId) return null;
  return locations.find(loc => loc.id === locationId) || null;
};

/**
 * 위치 이름을 가져오는 함수
 * @param {Array} locations 위치 목록
 * @param {string} locationId 위치 ID
 * @returns {string} 위치 이름 또는 빈 문자열
 */
export const getLocationName = (locations, locationId) => {
  const location = getLocationById(locations, locationId);
  return location ? location.name : '';
}; 