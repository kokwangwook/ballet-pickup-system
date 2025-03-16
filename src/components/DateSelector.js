import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper,
  IconButton,
  ButtonGroup,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getDayColor } from '../utils/tableUtils';
import { DayButton, ContentContainer } from '../styles/commonStyles';

/**
 * 날짜 선택 컴포넌트
 */
const DateSelector = ({ 
  selectedDate, 
  setSelectedDate, 
  selectedDayOfWeek, 
  setSelectedDayOfWeek 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 요일 이름 배열
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 날짜 이동 함수
  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };
  
  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };
  
  // 오늘 날짜로 이동
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // 요일 선택 함수
  const handleDaySelect = (dayIndex) => {
    setSelectedDayOfWeek(dayIndex);
  };
  
  // 버튼 색상 결정 함수
  const getButtonColor = (dayIndex) => {
    return getDayColor(dayIndex);
  };
  
  return (
    <ContentContainer>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexWrap: 'nowrap'
          }}>
            <IconButton onClick={goToPreviousDay} size={isMobile ? "small" : "medium"}>
              <ArrowBackIosNewIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mx: 1,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }} onClick={goToToday}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                sx={{ 
                  fontWeight: 'medium', 
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {isToday(selectedDate) && (
                  <TodayIcon 
                    color="primary" 
                    fontSize="small" 
                    sx={{ mr: 0.5 }} 
                  />
                )}
                {format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })}
              </Typography>
            </Box>
            <IconButton onClick={goToNextDay} size={isMobile ? "small" : "medium"}>
              <ArrowForwardIosIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={8}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 1, 
                display: 'flex', 
                alignItems: 'center',
                mb: { xs: 1, sm: 0 }
              }}
            >
              요일 선택:
            </Typography>
            <ButtonGroup 
              variant="outlined" 
              size={isMobile ? "small" : "medium"}
              sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
            >
              {dayNames.map((day, index) => (
                <DayButton
                  key={day}
                  onClick={() => handleDaySelect(index)}
                  selected={selectedDayOfWeek === index}
                  daycolor={getButtonColor(index)}
                >
                  {day}
                </DayButton>
              ))}
            </ButtonGroup>
          </Box>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default DateSelector; 