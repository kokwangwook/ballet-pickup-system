import React from 'react';
import { 
  Grid, 
  TextField, 
  Typography,
  FormControlLabel,
  Checkbox
} from '@mui/material';

/**
 * 연락처 정보 입력 컴포넌트
 */
const ContactInfoForm = ({ 
  formData, 
  handleChange, 
  handleCheckboxChange, 
  errors, 
  touched 
}) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
        연락처 정보
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="학부모 이름"
            name="parentName"
            value={formData.parentName || ''}
            onChange={handleChange}
            error={touched?.parentName && Boolean(errors?.parentName)}
            helperText={touched?.parentName && errors?.parentName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="학부모 연락처"
            name="parentPhone"
            value={formData.parentPhone || ''}
            onChange={handleChange}
            placeholder="010-0000-0000"
            error={touched?.parentPhone && Boolean(errors?.parentPhone)}
            helperText={touched?.parentPhone && errors?.parentPhone}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.useNotification || false}
                onChange={(e) => handleCheckboxChange('useNotification', e.target.checked)}
                name="useNotification"
                color="primary"
              />
            }
            label="알림 메시지 수신"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="비상 연락처"
            name="emergencyPhone"
            value={formData.emergencyPhone || ''}
            onChange={handleChange}
            placeholder="010-0000-0000"
            error={touched?.emergencyPhone && Boolean(errors?.emergencyPhone)}
            helperText={touched?.emergencyPhone && errors?.emergencyPhone}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="비상 연락처 이름"
            name="emergencyName"
            value={formData.emergencyName || ''}
            onChange={handleChange}
            error={touched?.emergencyName && Boolean(errors?.emergencyName)}
            helperText={touched?.emergencyName && errors?.emergencyName}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ContactInfoForm; 