import React, { useState, ChangeEvent } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  Button, 
  ButtonGroup, 
  TextField, 
  InputAdornment,
  Tooltip,
  IconButton,
  Popover,
  Paper
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';

// Slippage presets
const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0, 2.0];

interface SlippageSelectorProps {
  slippage: number;
  onSlippageChange: (value: number) => void;
}

export default function SlippageSelector({ slippage, onSlippageChange }: SlippageSelectorProps) {
  const [customSlippage, setCustomSlippage] = useState<string>('');
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  // For the info tooltip
  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);
  const infoOpen = Boolean(infoAnchorEl);
  
  // Handle preset button click
  const handlePresetClick = (value: number) => {
    onSlippageChange(value);
    setCustomSlippage('');
    setShowCustom(false);
  };
  
  // Handle custom slippage input
  const handleCustomSlippageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomSlippage(value);
      
      // Update parent if valid number
      if (value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
          onSlippageChange(numValue);
        }
      }
    }
  };
  
  // For slippage info tooltip
  const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setInfoAnchorEl(event.currentTarget);
  };
  
  const handleInfoClose = () => {
    setInfoAnchorEl(null);
  };
  
  // For settings popover
  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleSettingsClose = () => {
    setAnchorEl(null);
  };
  
  // Helper to get slippage warning level
  const getSlippageWarning = () => {
    if (slippage < 0.1) return { level: 'warning', message: 'Your transaction may fail due to low slippage tolerance' };
    if (slippage > 5) return { level: 'error', message: 'High slippage tolerance may result in unfavorable trades' };
    return null;
  };
  
  const slippageWarning = getSlippageWarning();
  const open = Boolean(anchorEl);
  
  return (
    <>
      {/* Compact button to open settings */}
      <IconButton 
        onClick={handleSettingsClick}
        sx={{ 
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
          }
        }}
      >
        <SettingsIcon sx={{ color: '#FFC107' }} />
      </IconButton>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            borderRadius: 2,
            border: '1px solid rgba(255, 193, 7, 0.2)',
            p: 2,
            width: 300,
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#FFC107' }}>
              Slippage Tolerance
            </Typography>
            <Tooltip title="The maximum price change you're willing to accept">
              <IconButton size="small" onClick={handleInfoClick}>
                <InfoIcon fontSize="small" sx={{ color: '#999' }} />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <ButtonGroup variant="outlined" fullWidth>
              {SLIPPAGE_PRESETS.map((preset) => (
                <Button 
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  sx={{ 
                    color: slippage === preset ? '#000' : '#FFC107',
                    backgroundColor: slippage === preset ? '#FFC107' : 'transparent',
                    '&:hover': {
                      backgroundColor: slippage === preset ? '#FFC107' : 'rgba(255, 193, 7, 0.1)',
                    }
                  }}
                >
                  {preset}%
                </Button>
              ))}
              <Button 
                onClick={() => setShowCustom(true)}
                sx={{ 
                  color: !SLIPPAGE_PRESETS.includes(slippage) ? '#000' : '#FFC107',
                  backgroundColor: !SLIPPAGE_PRESETS.includes(slippage) ? '#FFC107' : 'transparent',
                  '&:hover': {
                    backgroundColor: !SLIPPAGE_PRESETS.includes(slippage) ? '#FFC107' : 'rgba(255, 193, 7, 0.1)',
                  }
                }}
              >
                Custom
              </Button>
            </ButtonGroup>
          </Box>
          
          {showCustom && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Custom Slippage"
                variant="outlined"
                value={customSlippage}
                onChange={handleCustomSlippageChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ 
                  input: { color: '#FFF' },
                  label: { color: '#AAA' }
                }}
              />
            </Box>
          )}
          
          <Box sx={{ width: '100%', px: 1 }}>
            <Typography gutterBottom sx={{ color: '#AAA', fontSize: '0.75rem' }}>
              Current: {slippage}%
            </Typography>
            <Slider
              value={slippage}
              onChange={(_, value) => onSlippageChange(value as number)}
              aria-labelledby="slippage-slider"
              step={0.1}
              min={0}
              max={10}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              sx={{
                color: '#FFC107',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(255, 193, 7, 0.16)',
                  },
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  opacity: 0.2,
                },
              }}
            />
          </Box>
          
          {slippageWarning && (
            <Box 
              sx={{ 
                mt: 1, 
                p: 1, 
                borderRadius: 1, 
                backgroundColor: slippageWarning.level === 'warning' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                border: `1px solid ${slippageWarning.level === 'warning' ? '#FFC107' : '#f44336'}`,
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: slippageWarning.level === 'warning' ? '#FFC107' : '#f44336',
                }}
              >
                {slippageWarning.message}
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
      
      {/* Info tooltip */}
      <Popover
        open={infoOpen}
        anchorEl={infoAnchorEl}
        onClose={handleInfoClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            p: 2,
            maxWidth: 300,
          }
        }}
      >
        <Typography variant="body2" sx={{ color: '#FFF' }}>
          Slippage tolerance is the maximum price change you're willing to accept between the time your order is submitted and when it's executed.
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Box component="li" sx={{ color: '#AAA', fontSize: '0.85rem' }}>
            <Typography variant="body2" sx={{ color: '#AAA' }}>
              Lower slippage (0.1-0.5%): May cause failed transactions in volatile markets
            </Typography>
          </Box>
          <Box component="li" sx={{ color: '#AAA', fontSize: '0.85rem', mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#AAA' }}>
              Higher slippage (≥1%): May result in worse price execution
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
} 