import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CustomButton from './CustomButton';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';

/**
 * 커스텀 버튼 사용 예제 컴포넌트
 * @returns {React.ReactElement} 버튼 예제 컴포넌트
 */
const ButtonExample = () => {
  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        버튼 예제
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          기본 버튼
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <CustomButton text="학생관리" to="/" />
          <CustomButton text="학부모페이지" to="/parent" />
          <CustomButton text="메시지템플릿" to="/templates" />
          <CustomButton text="알림이력" to="/notifications" />
          <CustomButton text="알림설정" to="/settings" />
          <CustomButton text="운전자앱" to="/driver" />
          <CustomButton text="차량위치" to="/vehicle-tracker" />
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          아이콘이 있는 버튼
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <CustomButton text="학생등록" startIcon={<PersonAddIcon />} onClick={() => alert('학생등록 버튼 클릭!')} />
          <CustomButton text="학생검색" startIcon={<SearchIcon />} onClick={() => alert('학생검색 버튼 클릭!')} />
          <CustomButton text="메시지템플릿" startIcon={<MessageIcon />} to="/templates" />
          <CustomButton text="알림이력" startIcon={<NotificationsIcon />} to="/notifications" />
          <CustomButton text="알림설정" startIcon={<SettingsIcon />} to="/settings" />
          <CustomButton text="운전자앱" startIcon={<DirectionsCarIcon />} to="/driver" />
          <CustomButton text="차량위치" startIcon={<LocationOnIcon />} to="/vehicle-tracker" />
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          다양한 색상의 버튼
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <CustomButton text="기본 버튼" />
          <CustomButton text="파란색 버튼" sx={{ backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }} />
          <CustomButton text="초록색 버튼" sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }} />
          <CustomButton text="빨간색 버튼" sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }} />
          <CustomButton text="노란색 버튼" sx={{ backgroundColor: '#ffeb3b', color: 'rgba(0, 0, 0, 0.87)', '&:hover': { backgroundColor: '#fbc02d' } }} />
          <CustomButton 
            text="학생등록" 
            startIcon={<PersonAddIcon />} 
            sx={{ backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }} 
            onClick={() => alert('학생등록 버튼 클릭!')} 
          />
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          클릭 시 색상이 변경되는 버튼
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <CustomButton 
            text="파란색으로 변경" 
            activeColor="#2196f3" 
            onClick={() => console.log('파란색 버튼 클릭')} 
          />
          <CustomButton 
            text="초록색으로 변경" 
            activeColor="#4caf50" 
            onClick={() => console.log('초록색 버튼 클릭')} 
          />
          <CustomButton 
            text="빨간색으로 변경" 
            activeColor="#f44336" 
            onClick={() => console.log('빨간색 버튼 클릭')} 
          />
          <CustomButton 
            text="보라색으로 변경" 
            activeColor="#9c27b0" 
            onClick={() => console.log('보라색 버튼 클릭')} 
          />
          <CustomButton 
            text="주황색으로 변경" 
            activeColor="#ff9800" 
            onClick={() => console.log('주황색 버튼 클릭')} 
          />
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          아이콘이 있는 토글 버튼
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <CustomButton 
            text="학생등록" 
            startIcon={<PersonAddIcon />} 
            activeColor="#2196f3" 
            onClick={() => console.log('학생등록 버튼 토글')} 
          />
          <CustomButton 
            text="학생검색" 
            startIcon={<SearchIcon />} 
            activeColor="#4caf50" 
            onClick={() => console.log('학생검색 버튼 토글')} 
          />
          <CustomButton 
            text="메시지템플릿" 
            startIcon={<MessageIcon />} 
            activeColor="#f44336" 
            onClick={() => console.log('메시지템플릿 버튼 토글')} 
          />
          <CustomButton 
            text="알림이력" 
            startIcon={<NotificationsIcon />} 
            activeColor="#9c27b0" 
            onClick={() => console.log('알림이력 버튼 토글')} 
          />
          <CustomButton 
            text="알림설정" 
            startIcon={<SettingsIcon />} 
            activeColor="#ff9800" 
            onClick={() => console.log('알림설정 버튼 토글')} 
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ButtonExample; 