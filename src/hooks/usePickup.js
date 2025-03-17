import { useContext } from 'react';
import { PickupContext } from '../contexts/PickupContext';

/**
 * 픽업 컨텍스트를 사용하기 위한 커스텀 훅
 * 이 훅을 통해 컴포넌트에서 픽업 관련 상태와 함수에 쉽게 접근할 수 있습니다.
 * 
 * @returns {Object} 픽업 컨텍스트의 모든 상태와 함수
 * 
 * @example
 * // 컴포넌트에서 사용 예시
 * const { 
 *   students, 
 *   selectedDayOfWeek, 
 *   handleDayChange 
 * } = usePickup();
 */
const usePickup = () => {
  const context = useContext(PickupContext);
  
  if (context === undefined) {
    throw new Error('usePickup must be used within a PickupProvider');
  }
  
  return context;
};

export default usePickup;
