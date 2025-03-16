import { styled } from '@mui/material/styles';
import { 
  Box, 
  Button, 
  Paper, 
  TableRow, 
  TableCell,
  Container
} from '@mui/material';

/**
 * 공통 스타일 모음
 */

// 반응형 컨테이너
export const ResponsiveContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

// 섹션 헤더를 위한 스타일 컴포넌트
export const SectionHeader = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(0.75, 2),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  marginBottom: 0,
  boxShadow: 'none',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1.5),
    fontSize: '0.9rem',
  },
}));

// 클릭 가능한 행 스타일
export const ClickableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'background-color 0.2s ease',
}));

// 테이블 헤더 셀 스타일
export const StyledHeaderCell = styled(TableCell)(({ theme, rightBorder, isArrival, width }) => ({
  backgroundColor: isArrival ? '#e3f2fd' : '#fce4ec',
  color: theme.palette.text.primary,
  fontSize: '0.8rem',
  padding: '8px 10px',
  borderBottom: '1px solid #e0e0e0',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  width: width || 'auto',
  minWidth: width || 'auto',
  ...(rightBorder && {
    borderRight: '2px solid #f0f0f0',
  }),
  [theme.breakpoints.down('sm')]: {
    padding: '6px 8px',
    fontSize: '0.75rem',
  },
}));

// 테이블 데이터 셀 스타일
export const StyledTableCell = styled(TableCell)(({ theme, highlight, rightBorder, isArrival, width }) => ({
  fontSize: '0.8rem',
  padding: '8px 10px',
  borderBottom: '1px solid #f0f0f0',
  backgroundColor: isArrival ? 'rgba(227, 242, 253, 0.3)' : 'rgba(252, 228, 236, 0.2)',
  fontWeight: 'regular',
  transition: 'all 0.3s ease',
  width: width || 'auto',
  minWidth: width || 'auto',
  ...(rightBorder && {
    borderRight: '2px solid #f0f0f0',
  }),
  [theme.breakpoints.down('sm')]: {
    padding: '6px 8px',
    fontSize: '0.75rem',
  },
}));

// 요일 버튼 스타일
export const DayButton = styled(Button)(({ theme, selected, daycolor }) => ({
  minWidth: '40px',
  padding: theme.spacing(0.5, 1),
  margin: theme.spacing(0, 0.5),
  borderRadius: '20px',
  fontWeight: selected ? 'bold' : 'normal',
  color: selected ? '#fff' : daycolor,
  backgroundColor: selected ? daycolor : 'transparent',
  border: `1px solid ${daycolor}`,
  '&:hover': {
    backgroundColor: selected ? daycolor : 'rgba(0, 0, 0, 0.04)',
    color: selected ? '#fff' : daycolor,
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '30px',
    padding: theme.spacing(0.3, 0.8),
    margin: theme.spacing(0, 0.3),
    fontSize: '0.75rem',
  },
}));

// 컨테이너 스타일
export const ContentContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
}));

// 통계 카드 스타일
export const StatCard = styled(Paper)(({ theme, bgcolor }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  backgroundColor: bgcolor || theme.palette.background.default,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

// 모바일 카드 스타일
export const MobileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  overflow: 'hidden',
}));

// 폼 섹션 스타일
export const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
}));

// 그리드 간격 조정
export const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
  },
})); 