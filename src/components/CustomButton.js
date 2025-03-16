import React, { useState } from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * 커스텀 버튼 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.text - 버튼에 표시할 텍스트
 * @param {string} [props.to] - 링크 경로 (있을 경우 Link 컴포넌트로 렌더링)
 * @param {Function} [props.onClick] - 클릭 이벤트 핸들러
 * @param {React.ReactNode} [props.startIcon] - 버튼 시작 부분에 표시할 아이콘
 * @param {Object} [props.sx] - 추가 스타일 속성
 * @param {string} [props.activeColor] - 클릭 시 변경될 색상 (기본값: '#1976d2')
 * @param {boolean} [props.toggleOnClick] - 클릭 시 색상 토글 여부 (기본값: true)
 * @returns {React.ReactElement} 커스텀 버튼 컴포넌트
 */
const CustomButton = ({ 
  text, 
  to, 
  onClick, 
  startIcon, 
  sx = {}, 
  activeColor = '#1976d2', 
  toggleOnClick = true,
  ...props 
}) => {
  // 버튼 클릭 상태 관리
  const [isActive, setIsActive] = useState(false);

  // 클릭 이벤트 핸들러
  const handleClick = (event) => {
    if (toggleOnClick) {
      setIsActive(!isActive);
    }
    
    // 외부에서 전달받은 onClick 함수가 있으면 실행
    if (onClick) {
      onClick(event);
    }
  };

  // 기본 스타일 설정
  const buttonStyle = {
    mr: 1,
    color: 'inherit',
    backgroundColor: isActive ? activeColor : (sx.backgroundColor || 'transparent'),
    color: isActive ? 'white' : (sx.color || 'inherit'),
    '&:hover': {
      backgroundColor: isActive 
        ? (sx['&:hover']?.backgroundColor || '#1565c0') 
        : (sx['&:hover']?.backgroundColor || 'rgba(0, 0, 0, 0.04)')
    },
    ...sx
  };

  // to prop이 있으면 Link 컴포넌트로 렌더링
  if (to) {
    return (
      <Button
        color="inherit"
        component={Link}
        to={to}
        startIcon={startIcon}
        sx={buttonStyle}
        onClick={handleClick}
        {...props}
      >
        {text}
      </Button>
    );
  }

  // 일반 버튼으로 렌더링
  return (
    <Button
      color="inherit"
      onClick={handleClick}
      startIcon={startIcon}
      sx={buttonStyle}
      {...props}
    >
      {text}
    </Button>
  );
};

export default CustomButton; 