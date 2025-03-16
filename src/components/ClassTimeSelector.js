import React from 'react';
import { 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  FormHelperText
} from '@mui/material';

/**
 * 요일별 수업 시간 선택 컴포넌트
 */
const ClassTimeSelector = ({ 
  classTimes, 
  handleClassTimeChange, 
  classInfo, 
  errors, 
  touched 
}) => {
  // 요일 목록
  const days = ['월', '화', '수', '목', '금'];
  
  // 수업 시간 옵션 (classInfo에서 가져옴)
  const timeOptions = classInfo ? Object.keys(classInfo).sort() : [];
  
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
        요일별 수업 시간
      </Typography>
      <Grid container spacing={2}>
        {days.map((day) => (
          <Grid item xs={12} sm={6} md={4} key={day}>
            <FormControl 
              fullWidth 
              size="small" 
              error={touched?.classTimes?.[day] && Boolean(errors?.classTimes?.[day])}
            >
              <InputLabel id={`class-time-${day}-label`}>{day}요일 수업</InputLabel>
              <Select
                labelId={`class-time-${day}-label`}
                id={`class-time-${day}`}
                name={`classTimes.${day}`}
                value={classTimes[day] || ''}
                onChange={(e) => handleClassTimeChange(day, e.target.value)}
                label={`${day}요일 수업`}
              >
                <MenuItem value="">
                  <em>선택 안함</em>
                </MenuItem>
                {timeOptions.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
              {touched?.classTimes?.[day] && errors?.classTimes?.[day] && (
                <FormHelperText>{errors.classTimes[day]}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default ClassTimeSelector; 