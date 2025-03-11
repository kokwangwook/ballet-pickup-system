import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Checkbox,
  Tooltip,
  ListItemIcon,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { usePickup } from '../contexts/PickupContext';

const StudentSearch = ({ onStudentSelect, onClose, onAddStudent }) => {
  const { students, removeStudent } = usePickup();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // 컴포넌트 마운트 시 모든 학생 표시
  useEffect(() => {
    setSearchResults(students);
  }, [students]);

  // 검색어 변경 시 결과 업데이트
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      performSearch();
    } else {
      // 검색어가 없는 경우 모든 학생 표시
      setSearchResults(students);
    }
  }, [searchTerm, searchType, students]);

  // 검색 실행
  const performSearch = () => {
    setLoading(true);
    
    // 검색어 소문자 변환
    const term = searchTerm.toLowerCase();
    
    // 검색 타입에 따른 필터링 함수
    let filteredStudents = [];
    
    switch(searchType) {
      case 'name':
        filteredStudents = students.filter(student => 
          student.name && student.name.toLowerCase().includes(term)
        );
        break;
      case 'shortId':
        filteredStudents = students.filter(student => 
          student.shortId && student.shortId.toString().includes(term)
        );
        break;
      case 'classTime':
        filteredStudents = students.filter(student => 
          student.classTime && student.classTime.includes(term)
        );
        break;
      case 'phone':
        filteredStudents = students.filter(student => 
          (student.motherPhone && student.motherPhone.includes(term)) ||
          (student.fatherPhone && student.fatherPhone.includes(term)) ||
          (student.studentPhone && student.studentPhone.includes(term)) ||
          (student.otherPhone && student.otherPhone.includes(term))
        );
        break;
      default:
        filteredStudents = students.filter(student => 
          student.name && student.name.toLowerCase().includes(term)
        );
    }
    
    setSearchResults(filteredStudents);
    setLoading(false);
  };

  // 검색어 입력 핸들러
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 검색 타입 변경 핸들러
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchTerm(''); // 검색 타입 변경 시 검색어 초기화
  };

  // 학생 선택 핸들러
  const handleStudentSelect = (student) => {
    if (onStudentSelect) {
      onStudentSelect(student);
    }
  };
  
  // 체크박스 토글 핸들러
  const handleToggle = (studentId) => {
    const currentIndex = selected.indexOf(studentId);
    const newSelected = [...selected];
    
    if (currentIndex === -1) {
      newSelected.push(studentId);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    
    setSelected(newSelected);
  };
  
  // 선택한 학생 삭제 핸들러
  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };
  
  // 삭제 확인 처리
  const handleConfirmDelete = () => {
    selected.forEach(studentId => {
      // removeStudent 함수를 호출하여 학생 삭제
      removeStudent(studentId);
    });
    setSelected([]);
    setConfirmDeleteOpen(false);
  };
  
  // 선택한 학생 수정 핸들러
  const handleEdit = () => {
    if (selected.length === 1) {
      // 선택된 학생 찾기
      const studentToEdit = students.find(student => student.id === selected[0]);
      if (studentToEdit && onStudentSelect) {
        onStudentSelect(studentToEdit);
      }
    }
  };
  
  // 신규 학생 추가 핸들러
  const handleAddStudent = () => {
    if (onAddStudent) {
      onAddStudent();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          학생 검색
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddStudent}
          size="small"
        >
          신규 학생 등록
        </Button>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="search-type-label">검색 유형</InputLabel>
            <Select
              labelId="search-type-label"
              id="search-type"
              value={searchType}
              onChange={handleSearchTypeChange}
              label="검색 유형"
            >
              <MenuItem value="name">이름</MenuItem>
              <MenuItem value="shortId">단축번호</MenuItem>
              <MenuItem value="classTime">수업시간</MenuItem>
              <MenuItem value="phone">연락처</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            id="search-input"
            label={`${searchType === 'name' ? '이름' : searchType === 'shortId' ? '단축번호' : searchType === 'classTime' ? '수업시간' : '연락처'} 검색`}
            placeholder={`${searchType === 'name' ? '학생 이름' : searchType === 'shortId' ? '단축번호' : searchType === 'classTime' ? '예) 15:30' : '전화번호'} 입력`}
            value={searchTerm}
            onChange={handleSearchTermChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={performSearch} edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      
      {selected.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2">
            {selected.length}명의 학생이 선택됨
          </Typography>
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="선택한 학생 수정 (한 명만 선택 가능)">
              <Button 
                startIcon={<EditIcon />} 
                onClick={handleEdit}
                disabled={selected.length !== 1}
              >
                수정
              </Button>
            </Tooltip>
            <Tooltip title="선택한 학생 삭제">
              <Button 
                startIcon={<DeleteIcon />} 
                onClick={handleDelete}
                color="error"
              >
                삭제
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Typography variant="body2" align="center" sx={{ py: 2 }}>
            검색 중...
          </Typography>
        ) : searchResults.length > 0 ? (
          <List>
            {searchResults.map((student) => (
              <React.Fragment key={student.id}>
                <ListItem 
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selected.indexOf(student.id) !== -1}
                      onChange={() => handleToggle(student.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <PersonIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${student.name} (${student.shortId || '번호없음'})`} 
                    secondary={`수업시간: ${student.classTime || '미지정'} | ${student.motherPhone || student.fatherPhone || student.studentPhone || '연락처 없음'}`}
                    onClick={() => handleStudentSelect(student)}
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" align="center" sx={{ py: 2 }}>
            검색 결과가 없습니다.
          </Typography>
        )}
      </Box>
      
      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>학생 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            선택한 {selected.length}명의 학생을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>취소</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default StudentSearch; 