import React from 'react';
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
        onClick={onClick} 
        disabled={disabled}
        size="small"
      >
        {isActive ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
      </StatusIconButton>
      <StatusLabel statusActive={isActive ? 1 : 0} disabled={disabled}>
        {isActive ? '완료' : '대기중'}
      </StatusLabel>
    </Box>
  );
};

export default StatusToggleButton; 