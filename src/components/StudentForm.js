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
  OutlinedInput,
  IconButton,
  FormControlLabel
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ko } from 'date-fns/locale';
import usePickup from '../hooks/usePickup';
import CloseIcon from '@mui/icons-material/Close';

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
  const { classInfo, addStudent, updateStudent, deleteStudent, locations } = usePickup();
  const [formData, setFormData] = useState({
    name: '',
    shortId: '',
    classTimes: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    arrivalLocations: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    departureLocations: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    arrivalTimes: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    departureTimes: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    motherPhone: '',
    studentPhone: '',
    classDays: [],
    registrationDate: new Date(),
    fatherPhone: '',
    otherPhone: '',
    isActive: true,
    school: '',
    birthDate: null,
    grade: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 월요일 위치 복사 체크박스 상태
  const [copyArrivalToAll, setCopyArrivalToAll] = useState(false);
  const [copyDepartureToAll, setCopyDepartureToAll] = useState(false);
  // 월요일 수업시간 복사 체크박스 상태
  const [copyClassTimeToAll, setCopyClassTimeToAll] = useState(false);
  // 월요일 등하원 시간 복사 체크박스 상태
  const [copyArrivalTimeToAll, setCopyArrivalTimeToAll] = useState(false);
  const [copyDepartureTimeToAll, setCopyDepartureTimeToAll] = useState(false);

  // 편집 모드인 경우 초기 데이터 설정
  useEffect(() => {
    if (isEdit && student) {
      // 기본 요일별 객체 생성
      const defaultLocations = {
        '월': '',
        '화': '',
        '수': '',
        '목': '',
        '금': ''
      };

      // 요일별 수업 시간 설정
      const classTimes = student.classTimes || defaultLocations;
      // arrivalLocations와 departureLocations가 있는지 확인하고 안전하게 설정
      const arrivalLocs = student.arrivalLocations || defaultLocations;
      const departureLocs = student.departureLocations || defaultLocations;
      // 등원시간과 하원시간 설정
      const arrivalTimes = student.arrivalTimes || defaultLocations;
      const departureTimes = student.departureTimes || defaultLocations;

      setFormData({
        name: student.name || '',
        shortId: student.shortId || '',
        classTimes: {
          '월': classTimes['월'] || '',
          '화': classTimes['화'] || '',
          '수': classTimes['수'] || '',
          '목': classTimes['목'] || '',
          '금': classTimes['금'] || ''
        },
        arrivalLocations: {
          '월': arrivalLocs['월'] || '',
          '화': arrivalLocs['화'] || '',
          '수': arrivalLocs['수'] || '',
          '목': arrivalLocs['목'] || '',
          '금': arrivalLocs['금'] || ''
        },
        departureLocations: {
          '월': departureLocs['월'] || '',
          '화': departureLocs['화'] || '',
          '수': departureLocs['수'] || '',
          '목': departureLocs['목'] || '',
          '금': departureLocs['금'] || ''
        },
        arrivalTimes: {
          '월': arrivalTimes['월'] || student.arrivalTime || '',
          '화': arrivalTimes['화'] || student.arrivalTime || '',
          '수': arrivalTimes['수'] || student.arrivalTime || '',
          '목': arrivalTimes['목'] || student.arrivalTime || '',
          '금': arrivalTimes['금'] || student.arrivalTime || ''
        },
        departureTimes: {
          '월': departureTimes['월'] || student.departureTime || '',
          '화': departureTimes['화'] || student.departureTime || '',
          '수': departureTimes['수'] || student.departureTime || '',
          '목': departureTimes['목'] || student.departureTime || '',
          '금': departureTimes['금'] || student.departureTime || ''
        },
        motherPhone: student.motherPhone || '',
        studentPhone: student.studentPhone || '',
        classDays: student.classDays || [],
        registrationDate: student.registrationDate ? new Date(student.registrationDate) : null,
        fatherPhone: student.fatherPhone || '',
        otherPhone: student.otherPhone || '',
        isActive: student.isActive !== undefined ? student.isActive : true,
        school: student.school || '',
        birthDate: student.birthDate ? new Date(student.birthDate) : null,
        grade: student.grade || ''
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

  // 다중 선택 핸들러 수정
  const handleMultiSelectChange = (event) => {
    const { target: { value } } = event;
    const newClassDays = typeof value === 'string' ? value.split(',') : value;
    
    // 수업 요일이 변경되면 선택되지 않은 요일의 위치 정보 초기화 고려
    const newArrivalLocations = { ...formData.arrivalLocations };
    const newDepartureLocations = { ...formData.departureLocations };
    
    // 모든 요일에 대해 검사 - 요일 목록 직접 사용
    ['월', '화', '수', '목', '금'].forEach(day => {
      // 해당 요일이 새롭게 선택된 수업 요일에 포함되지 않았다면
      if (!newClassDays.includes(day)) {
        // 해당 요일의 위치 정보를 빈 문자열로 초기화하지 않고 유지
        // 나중에 다시 해당 요일을 선택했을 때 기존 위치 정보를 복원할 수 있도록 함
      }
    });
    
    setFormData({
      ...formData,
      classDays: newClassDays,
      arrivalLocations: newArrivalLocations,
      departureLocations: newDepartureLocations
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

  // 요일별 위치 정보 변경 핸들러 수정
  const handleLocationChange = (type, day, value) => {
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [type]: {
          ...prevData[type],
          [day]: value
        }
      };

      // 월요일 값을 수정하고 체크박스가 활성화된 경우, 선택된 다른 요일에 동일한 값 적용
      if (day === '월') {
        if ((type === 'arrivalLocations' && copyArrivalToAll) || 
            (type === 'departureLocations' && copyDepartureToAll)) {
          // 선택된 수업 요일에만 월요일 값 복사
          formData.classDays.forEach(otherDay => {
            if (otherDay !== '월') {
              newData[type][otherDay] = value;
            }
          });
        }
      }

      return newData;
    });
  };

  // 요일별 수업 시간 변경 핸들러
  const handleClassTimeChange = (day, value) => {
    setFormData(prevData => {
      const newData = {
        ...prevData,
        classTimes: {
          ...prevData.classTimes,
          [day]: value
        }
      };

      // 월요일 값을 수정하고 체크박스가 활성화된 경우, 선택된 다른 요일에 동일한 값 적용
      if (day === '월' && copyClassTimeToAll) {
        // 선택된 수업 요일에만 월요일 값 복사
        formData.classDays.forEach(otherDay => {
          if (otherDay !== '월') {
            newData.classTimes[otherDay] = value;
          }
        });
      }

      return newData;
    });
  };

  // 요일별 시간 정보 변경 핸들러
  const handleTimeChange = (type, day, value) => {
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [type]: {
          ...prevData[type],
          [day]: value
        }
      };

      // 월요일 값을 수정하고 체크박스가 활성화된 경우, 선택된 다른 요일에 동일한 값 적용
      if (day === '월') {
        if ((type === 'arrivalTimes' && copyArrivalTimeToAll) || 
            (type === 'departureTimes' && copyDepartureTimeToAll)) {
          // 선택된 수업 요일에만 월요일 값 복사
          formData.classDays.forEach(otherDay => {
            if (otherDay !== '월') {
              newData[type][otherDay] = value;
            }
          });
        }
      }

      return newData;
    });
  };

  // 체크박스 상태 변경 핸들러
  const handleCopyToAllChange = (type, checked) => {
    if (type === 'arrival') {
      setCopyArrivalToAll(checked);
      
      // 체크박스가 활성화되면 현재 월요일 값을 선택된 다른 모든 요일에 복사
      if (checked) {
        const mondayValue = formData.arrivalLocations['월'];
        setFormData(prevData => {
          const newArrivalLocations = { ...prevData.arrivalLocations };
          // formData.classDays에 포함된 요일에만 월요일 값 복사
          formData.classDays.forEach(day => {
            if (day !== '월') {
              newArrivalLocations[day] = mondayValue;
            }
          });
          return {
            ...prevData,
            arrivalLocations: newArrivalLocations
          };
        });
      }
    } else if (type === 'departure') {
      setCopyDepartureToAll(checked);
      
      // 체크박스가 활성화되면 현재 월요일 값을 선택된 다른 모든 요일에 복사
      if (checked) {
        const mondayValue = formData.departureLocations['월'];
        setFormData(prevData => {
          const newDepartureLocations = { ...prevData.departureLocations };
          // formData.classDays에 포함된 요일에만 월요일 값 복사
          formData.classDays.forEach(day => {
            if (day !== '월') {
              newDepartureLocations[day] = mondayValue;
            }
          });
          return {
            ...prevData,
            departureLocations: newDepartureLocations
          };
        });
      }
    } else if (type === 'classTime') {
      setCopyClassTimeToAll(checked);
      
      // 체크박스가 활성화되면 현재 월요일 값을 선택된 다른 모든 요일에 복사
      if (checked) {
        const mondayValue = formData.classTimes['월'];
        setFormData(prevData => {
          const newClassTimes = { ...prevData.classTimes };
          // formData.classDays에 포함된 요일에만 월요일 값 복사
          formData.classDays.forEach(day => {
            if (day !== '월') {
              newClassTimes[day] = mondayValue;
            }
          });
          return {
            ...prevData,
            classTimes: newClassTimes
          };
        });
      }
    } else if (type === 'arrivalTime') {
      setCopyArrivalTimeToAll(checked);
      
      // 체크박스가 활성화되면 현재 월요일 값을 선택된 다른 모든 요일에 복사
      if (checked) {
        const mondayValue = formData.arrivalTimes['월'];
        setFormData(prevData => {
          const newArrivalTimes = { ...prevData.arrivalTimes };
          // formData.classDays에 포함된 요일에만 월요일 값 복사
          formData.classDays.forEach(day => {
            if (day !== '월') {
              newArrivalTimes[day] = mondayValue;
            }
          });
          return {
            ...prevData,
            arrivalTimes: newArrivalTimes
          };
        });
      }
    } else if (type === 'departureTime') {
      setCopyDepartureTimeToAll(checked);
      
      // 체크박스가 활성화되면 현재 월요일 값을 선택된 다른 모든 요일에 복사
      if (checked) {
        const mondayValue = formData.departureTimes['월'];
        setFormData(prevData => {
          const newDepartureTimes = { ...prevData.departureTimes };
          // formData.classDays에 포함된 요일에만 월요일 값 복사
          formData.classDays.forEach(day => {
            if (day !== '월') {
              newDepartureTimes[day] = mondayValue;
            }
          });
          return {
            ...prevData,
            departureTimes: newDepartureTimes
          };
        });
      }
    }
  };

  // 초기 폼 상태를 상수로 저장
  const initialFormState = {
    name: '',
    shortId: '',
    classTimes: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    arrivalLocations: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    departureLocations: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    arrivalTimes: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    departureTimes: {
      '월': '',
      '화': '',
      '수': '',
      '목': '',
      '금': ''
    },
    motherPhone: '',
    studentPhone: '',
    classDays: [],
    registrationDate: new Date(),
    fatherPhone: '',
    otherPhone: '',
    isActive: true,
    school: '',
    birthDate: null,
    grade: ''
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = '이름은 필수입니다';
    if (!formData.shortId) newErrors.shortId = '단축번호는 필수입니다';
    if (!formData.classDays || formData.classDays.length === 0) newErrors.classDays = '수업요일을 선택해주세요';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검증
    if (!validateForm()) return;
    
    // 제출 중 상태로 변경
    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        registrationDate: formData.registrationDate ? formData.registrationDate.toISOString() : null,
        birthDate: formData.birthDate ? formData.birthDate.toISOString() : null
      };
      
      console.log('학생 정보 제출 데이터:', dataToSubmit);
      
      if (isEdit) {
        // 학생 정보 수정
        await updateStudent(student.id, dataToSubmit);
        console.log('학생 정보 수정 완료:', student.id);
        setSuccess(true);
        setSuccessMessage('학생 정보가 성공적으로 수정되었습니다!');
        
        // 1.5초 후에 닫기
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        // 새 학생 등록
        await addStudent(dataToSubmit);
        setSuccess(true);
        setSuccessMessage('새 학생이 성공적으로 등록되었습니다!');
        // 폼 초기화 (창은 닫지 않음)
        resetForm();
      }
    } catch (error) {
      console.error('학생 저장 오류:', error);
      setErrorMessage(error.message || '학생 정보를 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 학생 삭제 함수
  const handleDelete = async () => {
    if (window.confirm('정말로 이 학생을 삭제하시겠습니까?')) {
      try {
        setIsSubmitting(true);
        await deleteStudent(student.id);
        setSuccessMessage('학생이 성공적으로 삭제되었습니다.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        setErrorMessage('학생 삭제 중 오류가 발생했습니다: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 수업 시간 옵션
  const classTimeOptions = [
    '15:30',
    '16:30',
    '17:30',
    '18:30'
  ];

  // 수업 요일 옵션
  const dayOptions = ['월', '화', '수', '목', '금'];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'relative' }}>
      {/* 오른쪽 상단에 닫기 버튼 추가 */}
      {onClose && (
        <IconButton 
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      
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
              onChange={handleChange}
              error={!!errors.shortId}
              helperText={errors.shortId}
            />
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
              id="school"
              label="학교명"
              name="school"
              value={formData.school}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="grade"
              label="학년"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="예: 3학년"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DatePicker
                label="생년월일"
                value={formData.birthDate}
                onChange={(date) => {
                  setFormData({
                    ...formData,
                    birthDate: date
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    name: "birthDate"
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* 수업 요일 선택 후 요일별 수업 시간 설정 UI */}
          {formData.classDays.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                요일별 수업 시간 설정
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                각 요일마다 다른 수업 시간을 설정할 수 있습니다. 
                상단의 수업 시간 필드는 요일별 수업 시간으로 대체되었습니다.
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={copyClassTimeToAll}
                      onChange={(e) => handleCopyToAllChange('classTime', e.target.checked)}
                    />
                  }
                  label="월요일 수업 시간을 모든 요일에 적용"
                />
              </Box>
              
              <Grid container spacing={2}>
                {formData.classDays.map((day) => (
                  <Grid item xs={12} sm={6} key={`classTime-${day}`}>
                    <FormControl fullWidth margin="dense">
                      <InputLabel id={`classTime-${day}-label`}>{day}요일 수업 시간</InputLabel>
                      <Select
                        labelId={`classTime-${day}-label`}
                        id={`classTime-${day}`}
                        value={formData.classTimes[day]}
                        onChange={(e) => handleClassTimeChange(day, e.target.value)}
                        disabled={day !== '월' && copyClassTimeToAll}
                        label={`${day}요일 수업 시간`}
                      >
                        <MenuItem value="">선택 안함</MenuItem>
                        {classTimeOptions.map((time) => (
                          <MenuItem key={`${day}-${time}`} value={time}>{time}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* 요일별 등하원 위치 섹션과 시간 섹션을 통합 */}
          {formData.classDays.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                요일별 등하원 정보 설정
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                선택한 수업 요일에 대해 등하원 위치와 시간을 설정하세요.
              </Typography>

              {/* 요일별 등원 위치와 시간 */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    등원 정보 (요일별)
                  </Typography>
                  {formData.classDays.includes('월') && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={copyArrivalToAll}
                            onChange={(e) => handleCopyToAllChange('arrival', e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        }
                        label="월요일 위치를 모든 요일에 적용"
                        sx={{ fontSize: '0.8rem' }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={copyArrivalTimeToAll}
                            onChange={(e) => handleCopyToAllChange('arrivalTime', e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        }
                        label="월요일 시간을 모든 요일에 적용"
                        sx={{ fontSize: '0.8rem' }}
                      />
                    </Box>
                  )}
                </Box>
                {/* 선택된 수업 요일에 대해서만 입력 필드 표시 */}
                {formData.classDays.length > 0 ? (
                  formData.classDays.map((day) => (
                    <Box key={`arrival-${day}`} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                      <Typography sx={{ minWidth: 30 }}>{day}</Typography>
                      <TextField
                        sx={{ flex: 1 }}
                        size="small"
                        id={`arrivalLocations-${day}`}
                        label={`${day}요일 등원 위치`}
                        value={formData.arrivalLocations[day] || ''}
                        onChange={(e) => handleLocationChange('arrivalLocations', day, e.target.value)}
                        disabled={day !== '월' && copyArrivalToAll}
                      />
                      <TextField
                        sx={{ flex: 1 }}
                        size="small"
                        id={`arrivalTimes-${day}`}
                        label={`${day}요일 등원 시간`}
                        value={formData.arrivalTimes[day] || ''}
                        onChange={(e) => handleTimeChange('arrivalTimes', day, e.target.value)}
                        placeholder="예: 14:50"
                        disabled={day !== '월' && copyArrivalTimeToAll}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    수업 요일을 선택해주세요.
                  </Typography>
                )}
              </Box>

              {/* 요일별 하원 위치와 시간 */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    하원 정보 (요일별)
                  </Typography>
                  {formData.classDays.includes('월') && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={copyDepartureToAll}
                            onChange={(e) => handleCopyToAllChange('departure', e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        }
                        label="월요일 위치를 모든 요일에 적용"
                        sx={{ fontSize: '0.8rem' }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={copyDepartureTimeToAll}
                            onChange={(e) => handleCopyToAllChange('departureTime', e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        }
                        label="월요일 시간을 모든 요일에 적용"
                        sx={{ fontSize: '0.8rem' }}
                      />
                    </Box>
                  )}
                </Box>
                {/* 선택된 수업 요일에 대해서만 입력 필드 표시 */}
                {formData.classDays.length > 0 ? (
                  formData.classDays.map((day) => (
                    <Box key={`departure-${day}`} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                      <Typography sx={{ minWidth: 30 }}>{day}</Typography>
                      <TextField
                        sx={{ flex: 1 }}
                        size="small"
                        id={`departureLocations-${day}`}
                        label={`${day}요일 하원 위치`}
                        value={formData.departureLocations[day] || ''}
                        onChange={(e) => handleLocationChange('departureLocations', day, e.target.value)}
                        disabled={day !== '월' && copyDepartureToAll}
                      />
                      <TextField
                        sx={{ flex: 1 }}
                        size="small"
                        id={`departureTimes-${day}`}
                        label={`${day}요일 하원 시간`}
                        value={formData.departureTimes[day] || ''}
                        onChange={(e) => handleTimeChange('departureTimes', day, e.target.value)}
                        placeholder="예: 16:20"
                        disabled={day !== '월' && copyDepartureTimeToAll}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    수업 요일을 선택해주세요.
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

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
          {successMessage || (isEdit ? '학생 정보가 수정되었습니다!' : '새 학생이 등록되었습니다!')}
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