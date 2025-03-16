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
  DialogTitle,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { usePickup } from '../contexts/PickupContext';

const StudentSearch = ({ onStudentSelect, onClose, onAddStudent }) => {
  const { students, allStudents, deleteStudent, updateStudent } = usePickup();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentStatus, setStudentStatus] = useState('active'); // 'active', 'inactive', 'all'
  const [confirmWithdrawalOpen, setConfirmWithdrawalOpen] = useState(false);
  const [studentToWithdraw, setStudentToWithdraw] = useState(null);
  const [confirmReactivateOpen, setConfirmReactivateOpen] = useState(false);
  const [studentToReactivate, setStudentToReactivate] = useState(null);

  // 퇴원 학생 수 계산
  const inactiveStudentsCount = allStudents.filter(student => student.isActive === false).length;

  // 컴포넌트 마운트 시 모든 학생 표시
  useEffect(() => {
    // 학생 리스트를 이름 기준으로 가나다순 정렬
    const sortedStudents = [...allStudents].sort((a, b) => {
      // 이름이 없는 경우를 대비한 처리
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, 'ko');
    });
    
    // 학생 상태에 따라 필터링
    const filteredStudents = filterByStatus(sortedStudents);
    setSearchResults(filteredStudents);
  }, [allStudents, studentStatus]);

  // 학생 상태에 따라 필터링하는 함수
  const filterByStatus = (studentList) => {
    switch(studentStatus) {
      case 'active':
        return studentList.filter(student => student.isActive !== false);
      case 'inactive':
        return studentList.filter(student => student.isActive === false);
      case 'all':
      default:
        return studentList;
    }
  };

  // 검색어 변경 시 결과 업데이트
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      performSearch();
    } else {
      // 검색어가 없는 경우 모든 학생을 가나다순으로 정렬하여 표시
      const sortedStudents = [...allStudents].sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB, 'ko');
      });
      
      // 학생 상태에 따라 필터링
      const filteredStudents = filterByStatus(sortedStudents);
      setSearchResults(filteredStudents);
    }
  }, [searchTerm, searchType, allStudents, studentStatus]);

  // 검색 실행
  const performSearch = () => {
    setLoading(true);
    
    // 검색어 소문자 변환
    const term = searchTerm.toLowerCase();
    
    // 검색 타입에 따른 필터링 함수
    let filteredStudents = [];
    
    switch(searchType) {
      case 'name':
        filteredStudents = allStudents.filter(student => 
          student.name && student.name.toLowerCase().includes(term)
        );
        break;
      case 'shortId':
        filteredStudents = allStudents.filter(student => 
          student.shortId && student.shortId.toString().includes(term)
        );
        break;
      case 'classTime':
        filteredStudents = allStudents.filter(student => 
          student.classTime && student.classTime.includes(term)
        );
        break;
      case 'phone':
        filteredStudents = allStudents.filter(student => 
          (student.motherPhone && student.motherPhone.includes(term)) ||
          (student.fatherPhone && student.fatherPhone.includes(term)) ||
          (student.studentPhone && student.studentPhone.includes(term)) ||
          (student.otherPhone && student.otherPhone.includes(term))
        );
        break;
      default:
        filteredStudents = allStudents.filter(student => 
          student.name && student.name.toLowerCase().includes(term)
        );
    }
    
    // 학생 상태에 따라 필터링
    filteredStudents = filterByStatus(filteredStudents);
    
    // 필터링된 결과를 가나다순으로 정렬
    filteredStudents.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, 'ko');
    });
    
    setSearchResults(filteredStudents);
    setLoading(false);
  };

  // 학생 상태 변경 핸들러
  const handleStudentStatusChange = (e) => {
    setStudentStatus(e.target.value);
  };

  // 학생 상태 버튼 변경 핸들러
  const handleStatusButtonChange = (event, newStatus) => {
    if (newStatus !== null) {
      setStudentStatus(newStatus);
    }
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
  
  // 개별 학생 삭제 핸들러
  const handleDeleteSingle = (student) => {
    setStudentToDelete(student);
    setConfirmDeleteOpen(true);
  };
  
  // 삭제 확인 처리
  const handleConfirmDelete = () => {
    if (studentToDelete) {
      // 단일 학생 삭제
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    } else {
      // 선택된 여러 학생 삭제
      selected.forEach(studentId => {
        deleteStudent(studentId);
      });
      setSelected([]);
    }
    setConfirmDeleteOpen(false);
    // 검색 결과 업데이트
    performSearch();
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
  
  // 개별 학생 수정 핸들러
  const handleEditSingle = (student) => {
    if (onStudentSelect) {
      onStudentSelect(student);
    }
  };
  
  // 신규 학생 추가 핸들러
  const handleAddStudent = () => {
    if (onAddStudent) {
      onAddStudent();
    }
  };

  // 퇴원 처리 핸들러
  const handleWithdrawal = (student) => {
    setStudentToWithdraw(student);
    setConfirmWithdrawalOpen(true);
  };

  // 재등록 처리 핸들러
  const handleReactivate = (student) => {
    setStudentToReactivate(student);
    setConfirmReactivateOpen(true);
  };

  // 퇴원 확인 처리
  const handleConfirmWithdrawal = async () => {
    if (studentToWithdraw) {
      try {
        console.log('퇴원 처리 시작:', studentToWithdraw.id, studentToWithdraw.name);
        console.log('학생 전체 데이터:', studentToWithdraw);
        
        // 학생 ID 결정 (docId가 있으면 사용, 없으면 id 사용)
        const studentId = studentToWithdraw.docId || studentToWithdraw.id;
        console.log(`사용할 학생 ID: ${studentId}`);
        
        // 학생 상태 업데이트
        await updateStudent(studentId, { 
          isActive: false,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`${studentToWithdraw.name} 학생이 퇴원 처리되었습니다.`);
        
        // 성공 메시지 표시
        alert(`${studentToWithdraw.name} 학생이 퇴원 처리되었습니다.`);
        
        // 검색 결과 다시 로드 - 항상 수행
        setTimeout(() => {
          if (searchTerm.trim().length > 0) {
            performSearch();
          } else {
            // 검색어가 없는 경우 모든 학생을 가나다순으로 정렬하여 표시
            const sortedStudents = [...allStudents].sort((a, b) => {
              const nameA = a.name || '';
              const nameB = b.name || '';
              return nameA.localeCompare(nameB, 'ko');
            });
            
            // 학생 상태에 따라 필터링
            const filteredStudents = filterByStatus(sortedStudents);
            setSearchResults(filteredStudents);
          }
        }, 300); // 약간의 지연을 두어 상태 업데이트가 완료되도록 함
        
      } catch (error) {
        console.error('학생 퇴원 처리 중 오류 발생:', error);
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
        alert(`퇴원 처리 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
      } finally {
        setConfirmWithdrawalOpen(false);
        setStudentToWithdraw(null);
      }
    } else {
      setConfirmWithdrawalOpen(false);
      setStudentToWithdraw(null);
    }
  };

  // 재등록 확인 처리
  const handleConfirmReactivate = async () => {
    if (studentToReactivate) {
      try {
        console.log('재등록 처리 시작:', studentToReactivate.id, studentToReactivate.name);
        console.log('학생 전체 데이터:', studentToReactivate);
        
        // 학생 ID 결정 (docId가 있으면 사용, 없으면 id 사용)
        const studentId = studentToReactivate.docId || studentToReactivate.id;
        console.log(`사용할 학생 ID: ${studentId}`);
        
        // 학생 상태 업데이트
        await updateStudent(studentId, { 
          isActive: true,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`${studentToReactivate.name} 학생이 재등록 처리되었습니다.`);
        
        // 성공 메시지 표시
        alert(`${studentToReactivate.name} 학생이 재등록 처리되었습니다.`);
        
        // 검색 결과 다시 로드 - 항상 수행
        setTimeout(() => {
          if (searchTerm.trim().length > 0) {
            performSearch();
          } else {
            // 검색어가 없는 경우 모든 학생을 가나다순으로 정렬하여 표시
            const sortedStudents = [...allStudents].sort((a, b) => {
              const nameA = a.name || '';
              const nameB = b.name || '';
              return nameA.localeCompare(nameB, 'ko');
            });
            
            // 학생 상태에 따라 필터링
            const filteredStudents = filterByStatus(sortedStudents);
            setSearchResults(filteredStudents);
          }
        }, 300); // 약간의 지연을 두어 상태 업데이트가 완료되도록 함
        
      } catch (error) {
        console.error('학생 재등록 처리 중 오류 발생:', error);
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
        alert(`재등록 처리 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
      } finally {
        setConfirmReactivateOpen(false);
        setStudentToReactivate(null);
      }
    } else {
      setConfirmReactivateOpen(false);
      setStudentToReactivate(null);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          학생 검색 <Typography component="span" variant="body2" color="text.secondary">
            (총 {students.length}명)
          </Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleAddStudent}
            size="small"
          >
            신규 학생 등록
          </Button>
          <IconButton 
            color="default" 
            size="small"
            onClick={onClose} 
            aria-label="닫기"
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* 학생 상태 토글 버튼 그룹 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={studentStatus}
          exclusive
          onChange={handleStatusButtonChange}
          aria-label="학생 상태 필터"
          size="small"
          sx={{ width: '100%', maxWidth: '500px' }}
        >
          <ToggleButton 
            value="active" 
            aria-label="재학 중인 학생" 
            sx={{ flex: 1 }}
          >
            <PersonIcon sx={{ mr: 1 }} />
            재학 중
          </ToggleButton>
          <ToggleButton 
            value="inactive" 
            aria-label="퇴원한 학생" 
            sx={{ flex: 1 }}
          >
            <Badge badgeContent={inactiveStudentsCount} color="error" sx={{ mr: 1 }}>
              <PersonOffIcon />
            </Badge>
            퇴원
          </ToggleButton>
          <ToggleButton 
            value="all" 
            aria-label="모든 학생" 
            sx={{ flex: 1 }}
          >
            전체 학생
          </ToggleButton>
        </ToggleButtonGroup>
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
      
      {/* 학생 상태 표시 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {studentStatus === 'active' ? '재학 중인 학생만 표시됩니다.' : 
           studentStatus === 'inactive' ? '퇴원한 학생만 표시됩니다.' : 
           '모든 학생이 표시됩니다.'}
        </Typography>
      </Box>
      
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
            {searchResults.map((student, index) => (
              <React.Fragment key={student.id}>
                <ListItem 
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                    ...(student.isActive === false && { 
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      color: 'text.secondary'
                    })
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '32px' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: '24px', textAlign: 'center' }}>
                      {index + 1}
                    </Typography>
                  </ListItemIcon>
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
                    {student.isActive === false ? (
                      <PersonOffIcon sx={{ color: 'text.disabled' }} />
                    ) : (
                      <PersonIcon sx={{ color: 'primary.main' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        {student.name} ({student.shortId || '번호없음'})
                        {student.isActive === false && (
                          <Chip 
                            label="퇴원" 
                            size="small" 
                            color="error" 
                            sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }} 
                          />
                        )}
                      </Box>
                    } 
                    secondary={`수업시간: ${student.classTime || '미지정'} | ${student.motherPhone || student.fatherPhone || student.studentPhone || '연락처 없음'}`}
                    onClick={() => handleStudentSelect(student)}
                    sx={{ cursor: 'pointer' }}
                  />
                  <ButtonGroup variant="outlined" size="small">
                    <Tooltip title="학생 정보 수정">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditSingle(student)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {student.isActive !== false ? (
                      <Tooltip title="학생 퇴원 처리">
                        <IconButton 
                          size="small" 
                          color="warning"
                          onClick={() => handleWithdrawal(student)}
                        >
                          <LogoutIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="학생 재등록">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleReactivate(student)}
                        >
                          <PersonIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="학생 삭제">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteSingle(student)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ButtonGroup>
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
        onClose={() => {
          setConfirmDeleteOpen(false);
          setStudentToDelete(null);
        }}
      >
        <DialogTitle>학생 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {studentToDelete 
              ? `"${studentToDelete.name}" 학생을 삭제하시겠습니까?`
              : `선택한 ${selected.length}명의 학생을 삭제하시겠습니까?`} 
            이 작업은 취소할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfirmDeleteOpen(false);
            setStudentToDelete(null);
          }}>취소</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 퇴원 확인 다이얼로그 */}
      <Dialog
        open={confirmWithdrawalOpen}
        onClose={() => {
          setConfirmWithdrawalOpen(false);
          setStudentToWithdraw(null);
        }}
      >
        <DialogTitle>학생 퇴원 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {studentToWithdraw && `"${studentToWithdraw.name}" 학생을 퇴원 처리하시겠습니까?`}
            <br />
            퇴원 처리된 학생은 메인 화면에 표시되지 않지만, 학생 검색에서 '퇴원' 상태로 조회할 수 있습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfirmWithdrawalOpen(false);
            setStudentToWithdraw(null);
          }}>취소</Button>
          <Button onClick={handleConfirmWithdrawal} color="warning" autoFocus>
            퇴원 처리
          </Button>
        </DialogActions>
      </Dialog>

      {/* 재등록 확인 다이얼로그 */}
      <Dialog
        open={confirmReactivateOpen}
        onClose={() => {
          setConfirmReactivateOpen(false);
          setStudentToReactivate(null);
        }}
      >
        <DialogTitle>학생 재등록 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {studentToReactivate && `"${studentToReactivate.name}" 학생을 재등록 처리하시겠습니까?`}
            <br />
            재등록 처리된 학생은 다시 메인 화면에 표시됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfirmReactivateOpen(false);
            setStudentToReactivate(null);
          }}>취소</Button>
          <Button onClick={handleConfirmReactivate} color="success" autoFocus>
            재등록 처리
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default StudentSearch; 