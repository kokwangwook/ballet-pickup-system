import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { usePickup } from '../contexts/PickupContext';

const StudentForm = ({ student, onClose, isEdit = false }) => {
  const { classInfo, addStudent, updateStudent } = usePickup();
  const [formData, setFormData] = useState({
    name: '',
    classTime: '',
    arrivalTime: '',
    departureTime: '',
    arrivalLocation: '',
    departureLocation: '',
    registrationType: '정회원',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 편집 모드인 경우 초기 데이터 설정
  useEffect(() => {
    if (isEdit && student) {
      setFormData({
        name: student.name || '',
        classTime: student.classTime || '',
        arrivalTime: student.arrivalTime || '',
        departureTime: student.departureTime || '',
        arrivalLocation: student.arrivalLocation || '',
        departureLocation: student.departureLocation || '',
        registrationType: student.registrationType || '정회원',
        phoneNumber: student.phoneNumber || ''
      });
    }
  }, [isEdit, student]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 에러 상태 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  // 클래스 시간 변경 시 도착/출발 시간 자동 설정
  const handleClassTimeChange = (e) => {
    const { value } = e.target;
    if (value && classInfo[value]) {
      const classTimeObj = classInfo[value];
      const arrivalTime = parseFloat(value) - 0.67; // 약 40분 전
      const departureTime = parseFloat(classTimeObj.endTime) - 0.17; // 약 10분 전
      
      setFormData({
        ...formData,
        classTime: value,
        arrivalTime: arrivalTime.toFixed(2),
        departureTime: departureTime.toFixed(2)
      });
    } else {
      setFormData({
        ...formData,
        classTime: value
      });
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검증
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = '이름은 필수입니다';
    if (!formData.classTime) newErrors.classTime = '수업 시간은 필수입니다';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      if (isEdit) {
        // 학생 정보 수정
        await updateStudent(student.id, formData);
        setSuccess(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        // 새 학생 등록
        await addStudent(formData);
        setSuccess(true);
        setFormData({
          name: '',
          classTime: '',
          arrivalTime: '',
          departureTime: '',
          arrivalLocation: '',
          departureLocation: '',
          registrationType: '정회원',
          phoneNumber: ''
        });
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('학생 저장 오류:', error);
      setErrorMessage(error.message || '학생 정보를 저장하는 중 오류가 발생했습니다.');
    }
  };

  // 이미지에서 확인된 시간 옵션들
  const classTimeOptions = [
    '15:30',
    '16:30',
    '17:30',
    '18:30',
    '19:30'
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? '학생 정보 수정' : '새 학생 등록'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="학생 이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required error={!!errors.classTime}>
              <InputLabel id="classTime-label">수업 시간</InputLabel>
              <Select
                labelId="classTime-label"
                id="classTime"
                name="classTime"
                value={formData.classTime}
                onChange={handleClassTimeChange}
                label="수업 시간"
              >
                {classTimeOptions.map((time) => (
                  <MenuItem key={time} value={time}>{time}</MenuItem>
                ))}
              </Select>
              {errors.classTime && (
                <Typography variant="caption" color="error">
                  {errors.classTime}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="phoneNumber"
              label="전화번호"
              name="phoneNumber"
              placeholder="010-XXXX-XXXX"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="registrationType-label">등록 유형</InputLabel>
              <Select
                labelId="registrationType-label"
                id="registrationType"
                name="registrationType"
                value={formData.registrationType}
                onChange={handleChange}
                label="등록 유형"
              >
                <MenuItem value="정회원">정회원</MenuItem>
                <MenuItem value="준회원">준회원</MenuItem>
                <MenuItem value="체험">체험</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="arrivalTime"
              label="등원 시간 (HH:MM)"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="departureTime"
              label="하원 시간 (HH:MM)"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="arrivalLocation-label">등원 위치</InputLabel>
              <Select
                labelId="arrivalLocation-label"
                id="arrivalLocation"
                name="arrivalLocation"
                value={formData.arrivalLocation}
                onChange={handleChange}
                label="등원 위치"
              >
                <MenuItem value="우방아파트">우방아파트</MenuItem>
                <MenuItem value="집앞">집앞</MenuItem>
                <MenuItem value="대협로제1빌딩 113동">대협로제1빌딩 113동</MenuItem>
                <MenuItem value="대형 102동">대형 102동</MenuItem>
                <MenuItem value="중흥 113동">중흥 113동</MenuItem>
                <MenuItem value="중흥 114동">중흥 114동</MenuItem>
                <MenuItem value="빛뜨락자치회 홀겨운2번">빛뜨락자치회 홀겨운2번</MenuItem>
                <MenuItem value="우미린10동">우미린10동</MenuItem>
                <MenuItem value="한벼리유치원(530)">한벼리유치원(530)</MenuItem>
                <MenuItem value="예시앞1111동">예시앞1111동</MenuItem>
                <MenuItem value="예시앞 1120동">예시앞 1120동</MenuItem>
                <MenuItem value="연결육아원(루어학원)">연결육아원(루어학원)</MenuItem>
                <MenuItem value="중흥1차 정류장">중흥1차 정류장</MenuItem>
                <MenuItem value="중흥2차 정류장">중흥2차 정류장</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="departureLocation-label">하원 위치</InputLabel>
              <Select
                labelId="departureLocation-label"
                id="departureLocation"
                name="departureLocation"
                value={formData.departureLocation}
                onChange={handleChange}
                label="하원 위치"
              >
                <MenuItem value="우방아파트">우방아파트</MenuItem>
                <MenuItem value="집앞">집앞</MenuItem>
                <MenuItem value="대협로제1빌딩 113동">대협로제1빌딩 113동</MenuItem>
                <MenuItem value="대형 102동">대형 102동</MenuItem>
                <MenuItem value="중흥 113동">중흥 113동</MenuItem>
                <MenuItem value="중흥 114동">중흥 114동</MenuItem>
                <MenuItem value="빛뜨락자치회 홀겨운2번">빛뜨락자치회 홀겨운2번</MenuItem>
                <MenuItem value="우미린10동">우미린10동</MenuItem>
                <MenuItem value="한벼리유치원(530)">한벼리유치원(530)</MenuItem>
                <MenuItem value="예시앞1111동">예시앞1111동</MenuItem>
                <MenuItem value="예시앞 1120동">예시앞 1120동</MenuItem>
                <MenuItem value="연결육아원(루어학원)">연결육아원(루어학원)</MenuItem>
                <MenuItem value="중흥1차 정류장">중흥1차 정류장</MenuItem>
                <MenuItem value="중흥2차 정류장">중흥2차 정류장</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
            >
              {isEdit ? '수정 완료' : '학생 등록'}
            </Button>
          </Grid>
          
          {onClose && (
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                fullWidth
                onClick={onClose}
              >
                취소
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
      
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {isEdit ? '학생 정보가 수정되었습니다!' : '새 학생이 등록되었습니다!'}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={() => setErrorMessage('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default StudentForm; 