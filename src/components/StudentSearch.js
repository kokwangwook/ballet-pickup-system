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
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { usePickup } from '../contexts/PickupContext';

const StudentSearch = ({ onStudentSelect, onClose }) => {
  const { students } = usePickup();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 검색어 변경 시 결과 업데이트
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, searchType]);

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

  return (
    <Paper elevation={3} sx={{ p: 3, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        학생 검색
      </Typography>
      
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
                  button 
                  onClick={() => handleStudentSelect(student)}
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText 
                    primary={`${student.name} (${student.shortId || '번호없음'})`} 
                    secondary={`수업시간: ${student.classTime || '미지정'} | ${student.motherPhone || student.fatherPhone || student.studentPhone || '연락처 없음'}`}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : searchTerm.trim().length > 0 ? (
          <Typography variant="body2" align="center" sx={{ py: 2 }}>
            검색 결과가 없습니다.
          </Typography>
        ) : (
          <Typography variant="body2" align="center" sx={{ py: 2 }}>
            학생 이름, 단축번호, 수업시간 또는 연락처로 검색하세요.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default StudentSearch; 