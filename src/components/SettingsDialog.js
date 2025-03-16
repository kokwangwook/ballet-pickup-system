import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import { usePickup } from '../contexts/PickupContext';

// 시간대 옵션
const timeOptions = [
  '15:30',
  '16:30',
  '17:30',
  '18:30',
  '19:30'
];

// 환경 설정 다이얼로그 컴포넌트
const SettingsDialog = ({ open, onClose }) => {
  const { classInfo, updateClassInfo } = usePickup();
  const [settings, setSettings] = useState({
    defaultArrivalTime: '-40', // 기본값: 수업 시작 40분 전
    defaultDepartureTime: '+10', // 기본값: 수업 종료 10분 후
    displayWeekends: false,  // 주말 표시 여부
    timeOptions: [...timeOptions]  // 시간대 옵션
  });
  
  // 새 시간대 추가를 위한 상태
  const [newTimeOption, setNewTimeOption] = useState('');
  
  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings({
      ...settings,
      [name]: e.target.type === 'checkbox' ? checked : value
    });
  };
  
  // 시간대 추가 핸들러
  const handleAddTimeOption = () => {
    if (!newTimeOption || settings.timeOptions.includes(newTimeOption)) return;
    
    setSettings({
      ...settings,
      timeOptions: [...settings.timeOptions, newTimeOption].sort()
    });
    setNewTimeOption('');
  };
  
  // 시간대 삭제 핸들러
  const handleRemoveTimeOption = (option) => {
    setSettings({
      ...settings,
      timeOptions: settings.timeOptions.filter(time => time !== option)
    });
  };
  
  // 설정 저장 핸들러
  const handleSaveSettings = () => {
    // 환경 설정 저장 로직 구현
    console.log('저장할 환경 설정:', settings);
    
    // 설정 저장 후 다이얼로그 닫기
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">시스템 환경 설정</Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* 시간 설정 섹션 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              시간 설정
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="defaultArrivalTime"
              label="기본 등원 시간"
              value={settings.defaultArrivalTime}
              onChange={handleChange}
              helperText="수업 시작 시간 기준 (예: -40은 40분 전)"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="defaultDepartureTime"
              label="기본 하원 시간"
              value={settings.defaultDepartureTime}
              onChange={handleChange}
              helperText="수업 종료 시간 기준 (예: +10은 10분 후)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="primary" gutterBottom>
              시간대 관리
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              아래에서 수업 시간대를 추가하거나 삭제할 수 있습니다.
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <TextField
                label="새 시간대 추가"
                value={newTimeOption}
                onChange={(e) => setNewTimeOption(e.target.value)}
                placeholder="예: 14:30"
                size="small"
                sx={{ mr: 1 }}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleAddTimeOption}
                size="medium"
              >
                추가
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {settings.timeOptions.map((option) => (
                <Box 
                  key={option}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5
                  }}
                >
                  <Typography variant="body2">{option}</Typography>
                  <IconButton 
                    size="small"
                    onClick={() => handleRemoveTimeOption(option)}
                    sx={{ ml: 0.5, p: 0.3 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="primary" gutterBottom>
              UI 설정
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.displayWeekends}
                  onChange={handleChange}
                  name="displayWeekends"
                  color="primary"
                />
              }
              label="주말 표시"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              활성화하면 캘린더에 토요일과 일요일도 표시됩니다.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          취소
        </Button>
        <Button onClick={handleSaveSettings} color="primary" variant="contained">
          설정 저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog; 