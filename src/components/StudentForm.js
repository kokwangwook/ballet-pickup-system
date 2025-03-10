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
  Alert,
  Checkbox,
  ListItemText,
  FormHelperText,
  OutlinedInput
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ko } from 'date-fns/locale';
import { usePickup } from '../contexts/PickupContext';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const StudentForm = ({ student, onClose, isEdit = false }) => {
  const { classInfo, addStudent, updateStudent } = usePickup();
  const [formData, setFormData] = useState({
    name: '',
    shortId: '',
    classTime: '',
    arrivalLocation: '',
    departureLocation: '',
    motherPhone: '',
    studentPhone: '',
    classDays: [],
    registrationDate: null,
    fatherPhone: '',
    otherPhone: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 편집 모드인 경우 초기 데이터 설정
  useEffect(() => {
    if (isEdit && student) {
      setFormData({
        name: student.name || '',
        shortId: student.shortId || '',
        classTime: student.classTime || '',
        arrivalLocation: student.arrivalLocation || '',
        departureLocation: student.departureLocation || '',
        motherPhone: student.motherPhone || '',
        studentPhone: student.studentPhone || '',
        classDays: student.classDays || [],
        registrationDate: student.registrationDate ? new Date(student.registrationDate) : null,
        fatherPhone: student.fatherPhone || '',
        otherPhone: student.otherPhone || '',
        isActive: student.isActive !== undefined ? student.isActive : true
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

  // 날짜 변경 핸들러
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      registrationDate: date
    });
  };

  // 다중 선택 핸들러
  const handleMultiSelectChange = (event) => {
    const { target: { value } } = event;
    setFormData({
      ...formData,
      classDays: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // 숫자만 입력 핸들러
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    // 숫자만 허용
    if (/^\d*$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 전화번호 형식 핸들러
  const handlePhoneInput = (e) => {
    const { name, value } = e.target;
    // 숫자와 하이픈만 허용
    if (/^[\d-]*$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value
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
    if (!formData.shortId) newErrors.shortId = '단축번호는 필수입니다';
    if (!formData.classDays || formData.classDays.length === 0) newErrors.classDays = '수업요일을 선택해주세요';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const dataToSubmit = {
        ...formData,
        registrationDate: formData.registrationDate ? formData.registrationDate.toISOString() : null
      };
      
      if (isEdit) {
        // 학생 정보 수정
        await updateStudent(student.id, dataToSubmit);
        setSuccess(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        // 새 학생 등록
        await addStudent(dataToSubmit);
        setSuccess(true);
        setFormData({
          name: '',
          shortId: '',
          classTime: '',
          arrivalLocation: '',
          departureLocation: '',
          motherPhone: '',
          studentPhone: '',
          classDays: [],
          registrationDate: null,
          fatherPhone: '',
          otherPhone: '',
          isActive: true
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

  // 수업 시간 옵션
  const classTimeOptions = [
    '15:30',
    '16:30',
    '17:30',
    '18:30',
    '19:30'
  ];

  // 수업 요일 옵션
  const dayOptions = ['월', '화', '수', '목', '금'];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? '학생 정보 수정' : '새 학생 등록'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          {/* 기본 정보 섹션 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              기본 정보
            </Typography>
          </Grid>

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
            <TextField
              margin="normal"
              required
              fullWidth
              id="shortId"
              label="단축번호"
              name="shortId"
              value={formData.shortId}
              onChange={handleNumberInput}
              error={!!errors.shortId}
              helperText={errors.shortId}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
                onChange={handleChange}
                label="수업 시간"
              >
                {classTimeOptions.map((time) => (
                  <MenuItem key={time} value={time}>{time}</MenuItem>
                ))}
              </Select>
              {errors.classTime && (
                <FormHelperText>{errors.classTime}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required error={!!errors.classDays}>
              <InputLabel id="classDays-label">수업 요일</InputLabel>
              <Select
                labelId="classDays-label"
                id="classDays"
                name="classDays"
                multiple
                value={formData.classDays}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="수업 요일" />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {dayOptions.map((day) => (
                  <MenuItem key={day} value={day}>
                    <Checkbox checked={formData.classDays.indexOf(day) > -1} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
              </Select>
              {errors.classDays && (
                <FormHelperText>{errors.classDays}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="arrivalLocation"
              label="픽업 위치"
              name="arrivalLocation"
              value={formData.arrivalLocation}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="departureLocation"
              label="하원 위치"
              name="departureLocation"
              value={formData.departureLocation}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DatePicker
                label="학원 등록일"
                value={formData.registrationDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    name="registrationDate"
                  />
                )}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal"
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* 연락처 섹션 */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              연락처 정보
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="motherPhone"
              label="엄마 연락처"
              name="motherPhone"
              placeholder="010-XXXX-XXXX"
              value={formData.motherPhone}
              onChange={handlePhoneInput}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="fatherPhone"
              label="아빠 연락처"
              name="fatherPhone"
              placeholder="010-XXXX-XXXX"
              value={formData.fatherPhone}
              onChange={handlePhoneInput}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="studentPhone"
              label="학생 연락처"
              name="studentPhone"
              placeholder="010-XXXX-XXXX"
              value={formData.studentPhone}
              onChange={handlePhoneInput}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="otherPhone"
              label="기타 연락처"
              name="otherPhone"
              placeholder="010-XXXX-XXXX"
              value={formData.otherPhone}
              onChange={handlePhoneInput}
            />
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