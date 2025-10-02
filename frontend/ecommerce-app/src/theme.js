import { createTheme } from '@mui/material/styles'

// Custom MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2' // xanh
    },
    secondary: {
      main: '#f50057' // hồng
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontSize: '2.2rem', fontWeight: 700 },
    h2: { fontSize: '1.8rem', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none'
        }
      }
    }
  }
})

export default theme
