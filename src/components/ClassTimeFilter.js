import React from 'react';
import { 
  Box, 
  Button, 
  ButtonGroup, 
  Typography, 
  useTheme,
  Paper
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * 수업 시간 필터 컴포넌트
 */
const ClassTimeFilter = ({ 
  selectedClassTime, 
  handleClassTimeChange, 
  classInfo 
}) => {
  const theme = useTheme();
  
  // 수업 시간 목록 (기본값 + classInfo에서 가져온 시간)
  const classTimeOptions = ['all', ...(Object.keys(classInfo || {}).sort())];
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 수업 시간 필터 제목 */}
        <Typography 
          variant="h6" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 'bold',
            mb: 1
          }}
        >
          <AccessTimeIcon sx={{ mr: 1 }} />
          수업 시간 필터
        </Typography>
        
        {/* 수업 시간 선택 버튼 */}
        <ButtonGroup 
          variant="outlined" 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            mt: 1
          }}
        >
          {classTimeOptions.map((time) => (
            <Button
              key={time}
              onClick={() => handleClassTimeChange(time)}
              variant={selectedClassTime === time ? 'contained' : 'outlined'}
              sx={{ 
                m: 0.5,
                minWidth: time === 'all' ? '80px' : '60px'
              }}
            >
              {time === 'all' ? '전체' : time}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </Paper>
  );
};

export default ClassTimeFilter; 