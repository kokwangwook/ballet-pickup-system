import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const MessageTemplateManager = () => {
  // 샘플 템플릿 데이터
  const [templates, setTemplates] = useState([
    { id: 1, name: '등원 알림', content: '안녕하세요. [학생이름]님의 등원 차량이 [시간]분 후 도착 예정입니다.' },
    { id: 2, name: '하원 알림', content: '안녕하세요. [학생이름]님의 하원 차량이 [시간]분 후 도착 예정입니다.' },
    { id: 3, name: '수업 알림', content: '안녕하세요. [학생이름]님의 [수업명] 수업이 [시간]분 후 시작됩니다.' },
  ]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  // 템플릿 추가 다이얼로그 열기
  const handleOpenAddDialog = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
    setDialogOpen(true);
  };

  // 템플릿 수정 다이얼로그 열기
  const handleOpenEditDialog = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.content);
    setDialogOpen(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // 템플릿 저장
  const handleSaveTemplate = () => {
    if (editingTemplate) {
      // 기존 템플릿 수정
      setTemplates(templates.map(template => 
        template.id === editingTemplate.id 
          ? { ...template, name: templateName, content: templateContent } 
          : template
      ));
    } else {
      // 새 템플릿 추가
      const newTemplate = {
        id: Date.now(),
        name: templateName,
        content: templateContent
      };
      setTemplates([...templates, newTemplate]);
    }
    handleCloseDialog();
  };

  // 템플릿 삭제
  const handleDeleteTemplate = (id) => {
    if (window.confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      setTemplates(templates.filter(template => template.id !== id));
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          메시지 템플릿 관리
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          학부모에게 보낼 메시지 템플릿을 관리할 수 있습니다.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                템플릿 목록
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                추가
              </Button>
            </Box>
            <List>
              {templates.map((template, index) => (
                <React.Fragment key={template.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText 
                      primary={template.name} 
                      secondary={template.content.length > 30 
                        ? `${template.content.substring(0, 30)}...` 
                        : template.content} 
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleOpenEditDialog(template)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteTemplate(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              템플릿 미리보기
            </Typography>
            <Typography variant="body1" paragraph>
              사용 가능한 변수: [학생이름], [시간], [수업명], [날짜]
            </Typography>
            
            <Grid container spacing={2}>
              {templates.map((template) => (
                <Grid item xs={12} key={template.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="body1">
                        {template.content}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleOpenEditDialog(template)}
                        >
                          수정
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* 템플릿 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? '템플릿 수정' : '새 템플릿 추가'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="템플릿 이름"
            fullWidth
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="템플릿 내용"
            fullWidth
            multiline
            rows={4}
            value={templateContent}
            onChange={(e) => setTemplateContent(e.target.value)}
            helperText="사용 가능한 변수: [학생이름], [시간], [수업명], [날짜]"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSaveTemplate} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MessageTemplateManager; 