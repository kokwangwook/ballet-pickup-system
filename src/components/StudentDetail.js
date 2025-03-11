import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NoteIcon from '@mui/icons-material/Note';
import EmailIcon from '@mui/icons-material/Email';

const StudentDetail = ({ student, onEdit, onClose }) => {
  console.log("StudentDetail - 받은 학생 정보:", student);
  
  if (!student) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1">학생을 선택해주세요.</Typography>
      </Paper>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* 개발용 디버그 정보 */}
      <Box 
        sx={{ 
          mb: 2,
          p: 1, 
          border: '1px dashed grey', 
          backgroundColor: '#f5f5f5',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}
      >
        <Typography variant="subtitle2" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
          디버그 정보 (개발용)
        </Typography>
        <div>
          등원위치: {student.arrivalLocationText || '정보 없음'}<br />
          하원위치: {student.departureLocationText || '정보 없음'}<br />
          ID: {student.id}<br />
          수업: {student.classes ? JSON.stringify(student.classes) : '정보 없음'}<br />
          위치 정보 포함 여부: {(student.arrivalLocationText || student.departureLocationText) ? '있음' : '없음'}
        </div>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center'
              }}
            >
              <PersonIcon 
                sx={{ 
                  mr: 1, 
                  color: 'primary.main', 
                  fontSize: '1.8rem' 
                }} 
              />
              {student.name}
              {student.shortId && (
                <Chip 
                  label={`#${student.shortId}`} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<EditIcon />}
                onClick={() => onEdit(student)}
                size="small"
              >
                정보 수정
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<CloseIcon />}
                onClick={onClose}
                size="small"
              >
                닫기
              </Button>
            </Stack>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
              수업 정보
            </Typography>
            
            <Box sx={{ pl: 3 }}>
              <Stack spacing={1}>
                <Typography variant="body1">
                  <strong>수업 시간:</strong> {student.classTime || '정보 없음'}
                </Typography>
                <Typography variant="body1">
                  <strong>수업 요일:</strong> {student.classDays ? student.classDays.join(', ') : '정보 없음'}
                </Typography>
                <Typography variant="body1">
                  <strong>학교명:</strong> {student.school || '정보 없음'}
                </Typography>
                <Typography variant="body1">
                  <strong>학년:</strong> {student.grade || '정보 없음'}
                </Typography>
                <Typography variant="body1">
                  <strong>등록일:</strong> {formatDate(student.registrationDate)}
                </Typography>
                <Typography variant="body1">
                  <strong>생년월일:</strong> {formatDate(student.birthDate)}
                </Typography>
                <Typography variant="body1">
                  <strong>등원위치:</strong> {student.arrivalLocationText || '차량탑승 안함'}
                </Typography>
                <Typography variant="body1">
                  <strong>하원위치:</strong> {student.departureLocationText || '차량탑승 안함'}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Grid>
        
        {/* 연락처 정보 섹션 */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              연락처 정보
            </Typography>
            
            <Box sx={{ pl: 3 }}>
              <Stack spacing={1}>
                <Typography variant="body1">
                  <strong>학생 전화:</strong> {student.studentPhone || '정보 없음'}
                </Typography>
                <Typography variant="body1">
                  <strong>어머니 전화:</strong> {student.motherPhone || '정보 없음'}
                </Typography>
                <Typography variant="body1">
                  <strong>아버지 전화:</strong> {student.fatherPhone || '정보 없음'}
                </Typography>
                <Typography variant="body1">
                  <strong>기타 전화:</strong> {student.otherPhone || '정보 없음'}
                </Typography>
                <Typography variant="body1">
                  <strong>이메일:</strong> {student.email || '정보 없음'}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Grid>
        
        {/* 기타 정보 섹션 */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <NoteIcon sx={{ mr: 1, color: 'primary.main' }} />
            추가 정보
          </Typography>
          
          <Box sx={{ pl: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>주소:</strong> {student.address || '정보 없음'}
                </Typography>
                
                {student.emergencyContact && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>비상 연락처:</strong> {student.emergencyContact}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                {student.allergies && (
                  <Typography variant="body1">
                    <strong>알레르기:</strong> {student.allergies}
                  </Typography>
                )}
                
                {student.medicalConditions && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>건강 상태:</strong> {student.medicalConditions}
                  </Typography>
                )}
              </Grid>
              
              {student.notes && (
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>비고:</strong> {student.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
        
        {/* 등/하원 기록 섹션 */}
        {student.attendanceHistory && student.attendanceHistory.length > 0 && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
              최근 등/하원 기록
            </Typography>
            
            <List dense>
              {student.attendanceHistory.slice(0, 5).map((record, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${formatDate(record.date)}`}
                    secondary={`등원: ${record.checkIn ? '완료' : '미완료'} | 하원: ${record.checkOut ? '완료' : '미완료'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default StudentDetail; 