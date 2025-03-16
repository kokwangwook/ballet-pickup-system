import React from 'react';
import { 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  FormHelperText,
  TextField
} from '@mui/material';

/**
 * 주소 선택 컴포넌트
 */
const AddressSelector = ({ 
  formData, 
  handleChange, 
  handleLocationChange, 
  locations, 
  errors, 
  touched 
}) => {
  // 위치 옵션 (locations에서 가져옴)
  const locationOptions = locations ? Object.entries(locations).map(([id, name]) => ({
    id,
    name
  })) : [];
  
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
        주소 정보
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="주소"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            error={touched?.address && Boolean(errors?.address)}
            helperText={touched?.address && errors?.address}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="상세 주소"
            name="addressDetail"
            value={formData.addressDetail || ''}
            onChange={handleChange}
            error={touched?.addressDetail && Boolean(errors?.addressDetail)}
            helperText={touched?.addressDetail && errors?.addressDetail}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl 
            fullWidth 
            size="small"
            error={touched?.arrivalLocation && Boolean(errors?.arrivalLocation)}
          >
            <InputLabel id="arrival-location-label">등원 위치</InputLabel>
            <Select
              labelId="arrival-location-label"
              id="arrivalLocation"
              name="arrivalLocation"
              value={formData.arrivalLocation || ''}
              onChange={(e) => handleLocationChange('arrivalLocation', e.target.value)}
              label="등원 위치"
            >
              <MenuItem value="">
                <em>선택 안함</em>
              </MenuItem>
              {locationOptions.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
            {touched?.arrivalLocation && errors?.arrivalLocation && (
              <FormHelperText>{errors.arrivalLocation}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl 
            fullWidth 
            size="small"
            error={touched?.departureLocation && Boolean(errors?.departureLocation)}
          >
            <InputLabel id="departure-location-label">하원 위치</InputLabel>
            <Select
              labelId="departure-location-label"
              id="departureLocation"
              name="departureLocation"
              value={formData.departureLocation || ''}
              onChange={(e) => handleLocationChange('departureLocation', e.target.value)}
              label="하원 위치"
            >
              <MenuItem value="">
                <em>선택 안함</em>
              </MenuItem>
              {locationOptions.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
            {touched?.departureLocation && errors?.departureLocation && (
              <FormHelperText>{errors.departureLocation}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
};

export default AddressSelector; 