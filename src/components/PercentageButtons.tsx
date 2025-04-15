import React from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';

// Percentage presets
const PERCENTAGE_PRESETS = [25, 50, 75, 100];

interface PercentageButtonsProps {
  onPercentageClick: (percentage: number) => void;
  maxValue?: number | null;
  label?: string;
}

export default function PercentageButtons({ 
  onPercentageClick, 
  maxValue = null,
  label = "of balance"
}: PercentageButtonsProps) {
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography variant="caption" sx={{ color: '#AAA' }}>
          {maxValue !== null ? `Available: ${maxValue}` : ''}
        </Typography>
        
        <ButtonGroup 
          variant="outlined" 
          size="small" 
          aria-label="percentage buttons"
        >
          {PERCENTAGE_PRESETS.map((percentage) => (
            <Button 
              key={percentage}
              onClick={() => onPercentageClick(percentage)}
              sx={{ 
                color: '#FFC107',
                borderColor: 'rgba(255, 193, 7, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  borderColor: 'rgba(255, 193, 7, 0.5)',
                }
              }}
            >
              {percentage}%
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#AAA', 
          display: 'block', 
          textAlign: 'right',
          fontSize: '0.65rem',
          mt: -0.5
        }}
      >
        {label}
      </Typography>
    </Box>
  );
} 