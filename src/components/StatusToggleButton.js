import React, { useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// 스타일이 적용된 버튼 컴포넌트
const StatusIconButton = styled(IconButton)(({ theme, statusActive, disabled }) => ({
  padding: 4,
  color: statusActive 
    ? '#4caf50' 
    : disabled 
      ? theme.palette.grey[400] 
      : '#ff9800',
  '&:hover': {
    backgroundColor: 'transparent',
  },
  '&.Mui-disabled': {
    color: theme.palette.grey[400],
  }
}));

const StatusLabel = styled(Typography)(({ theme, statusActive, disabled }) => ({
  fontSize: '0.8rem',
  fontWeight: 'normal',
  color: statusActive 
    ? '#4caf50' 
    : disabled 
      ? theme.palette.text.disabled 
      : '#ff9800',
  marginLeft: disabled ? 0 : 2,
}));

// 상태 토글 버튼 컴포넌트
const StatusToggleButton = ({ status, onClick, disabled }) => {
  // 불리언 값으로 변환
  const isActive = !!status;
  
  console.log('StatusToggleButton 렌더링:', { status, isActive, disabled });
  
  // 클릭 핸들러 - 메모이제이션 및 이벤트 전파 방지
  const handleClick = useCallback((e) => {
    // 이벤트 전파 방지
    e.stopPropagation();
    e.preventDefault();
    
    console.log('StatusToggleButton 클릭됨:', { status, isActive, disabled });
    
    if (onClick && !disabled) {
      onClick(e);
    }
  }, [onClick, status, isActive, disabled]);
  
  // 차량탑승안함인 경우 텍스트만 표시
  if (disabled) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StatusLabel statusActive={isActive ? 1 : 0} disabled={disabled}>
          {isActive ? '완료' : '차량탑승안함'}
        </StatusLabel>
      </Box>
    );
  }
  
  // 일반적인 경우 아이콘과 텍스트 표시
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <StatusIconButton 
        statusActive={isActive ? 1 : 0}
        onClick={handleClick} 
        disabled={disabled}
        size="small"
      >
        {isActive ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
      </StatusIconButton>
      <StatusLabel 
        statusActive={isActive ? 1 : 0} 
        disabled={disabled}
        onClick={handleClick} // 라벨 클릭도 토글 가능하도록
        sx={{ cursor: 'pointer' }}
      >
        {isActive ? '완료' : '대기중'}
      </StatusLabel>
    </Box>
  );
};

export default StatusToggleButton; 