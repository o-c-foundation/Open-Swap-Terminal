import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export default function DappBar() {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        flexGrow: 1, 
        background: 'transparent',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
        backdropFilter: 'blur(5px)',
        padding: '8px 0'
      }} 
      elevation={0}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <SwapHorizIcon sx={{ color: '#FFC107', mr: 1, fontSize: 32 }} />
          <Typography
            variant="h5"
            noWrap
            sx={{ 
              fontFamily: "Quantico", 
              fontWeight: 700,
              color: '#FFC107',
              letterSpacing: '1px',
              textShadow: '0px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            OpenSwap
          </Typography>
        </Box>
        
        {/* Jupiter Terminal will handle wallet connection */}
      </Toolbar>
    </AppBar>
  );
}
