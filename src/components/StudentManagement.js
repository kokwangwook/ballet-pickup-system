import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Card, 
  CardContent, 
  CardActions, 
  Grid, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  InputAdornment
} from '@mui/material';
import { usePickup } from '../contexts/PickupContext';
import StudentForm from './StudentForm';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const StudentManagement = () => {
  const { students, loading, classInfo } = usePickup();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // 학생 데이터가 로드되면 필터링된 학생 목록 업데이트
  useEffect(() => {
    if (students) {
      filterStudents();
    }
  }, [students, searchTerm, activeTab]);

  // 검색어와 탭 선택에 따라 학생 목록 필터링
  const filterStudents = () => {
    if (!students) return;
    
    let filtered = [...students];
    
    // 검색어로 필터링
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(term) || 
        student.shortId.toString().includes(term)
      );
    }
    
    // 탭 선택에 따라 필터링
    if (activeTab > 0) {
      const classTimeKeys = Object.keys(classInfo || {});
      if (classTimeKeys.length > 0) {
        const selectedClassTime = classTimeKeys[activeTab - 1];
        filtered = filtered.filter(student => student.classTime === selectedClassTime);
      }
    }
    
    setFilteredStudents(filtered);
  };

  // 학생 선택하여 수정 모달 열기
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsEdit(true);
    setDialogOpen(true);
  };

  // 새 학생 등록 모달 열기
  const handleNewStudent = () => {
    setSelectedStudent(null);
    setIsEdit(false);
    setDialogOpen(true);
  };

  // 모달 닫기
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 탭 변경 핸들러
  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 수업 시간 기준 정렬
  const sortedClassTimes = classInfo 
    ? Object.keys(classInfo).sort((a, b) => parseFloat(a) - parseFloat(b)) 
    : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        학생 관리
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="학생 이름 또는 ID 검색..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: '300px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleNewStudent}
          startIcon={<AddIcon />}
        >
          새 학생 등록
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="전체" />
          {sortedClassTimes.map((time) => (
            <Tab key={time} label={`${time} 수업`} />
          ))}
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredStudents.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNewStudent}
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                새 학생 등록
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredStudents.map((student) => (
                <Grid item xs={12} sm={6} md={4} key={student.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div">
                          {student.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {student.shortId}
                        </Typography>
                      </Box>
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        수업: {student.classTime} {student.classTime && classInfo && classInfo[student.classTime] 
                              ? `~ ${classInfo[student.classTime].endTime}` 
                              : ''}
                      </Typography>
                      <Typography variant="body2">
                        등록 유형: {student.registrationType || '정회원'}
                      </Typography>
                      <Typography variant="body2">
                        등원: {student.arrivalTime || '정보 없음'} ({student.arrivalLocation || '정보 없음'})
                      </Typography>
                      <Typography variant="body2">
                        하원: {student.departureTime || '정보 없음'} ({student.departureLocation || '정보 없음'})
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditStudent(student)}
                      >
                        수정
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEdit ? '학생 정보 수정' : '새 학생 등록'}
        </DialogTitle>
        <DialogContent>
          <StudentForm 
            student={selectedStudent} 
            onClose={handleCloseDialog}
            isEdit={isEdit}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default StudentManagement; 