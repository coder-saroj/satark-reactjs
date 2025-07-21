import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button, Stack } from '@mui/material';
import { AccountCircle, PersonAdd } from '@mui/icons-material';

const PublicHeader = () => {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#fff',
        color: '#222',
        borderBottom: '1px solid #ddd',
        boxShadow: 'none',
        height: 50,
        justifyContent: 'center',
      }}
    >
      <Toolbar sx={{ minHeight: '50px !important', px: 2 }}>
        {/* Logos */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 2 }}>
          <Box component="img" src="/assets/osdma_logo.png" alt="OSDMA Logo" sx={{ height: 32 }} />
          <Box component="img" src="/assets/rimes_logo.png" alt="RIMES Logo" sx={{ height: 32 }} />
        </Stack>

        {/* Title */}
        <Typography
          variant="subtitle2"
          sx={{
            flexGrow: 1,
            fontWeight: 500,
            fontSize: '0.92rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          System for Assessing, Tracking & Alerting Disaster Risk Information based on Dynamic Risk Knowledge (SATARK)
        </Typography>

        {/* Buttons */}
        <Stack direction="row" spacing={1}>
            <Button
                href="/login"
                variant="outlined"
                startIcon={<AccountCircle />}
                size="small"
                sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: '#333',
                border: '1px solid #aaa',
                borderRadius: '8px',
                backgroundColor: '#fff',
                '&:hover': {
                    backgroundColor: '#f2f2f2',
                    borderColor: '#888',
                },
                }}
            >
                Log In
            </Button>

            <Button
                href="/signup"
                variant="contained"
                startIcon={<PersonAdd />}
                size="small"
                sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: '#fff',
                border: '1px solid #007BFF',
                borderRadius: '8px',
                backgroundColor: '#007BFF',
                '&:hover': {
                    backgroundColor: '#0056b3',
                    borderColor: '#0056b3',
                },
                }}
            >
                Sign Up
            </Button>
        </Stack>

      </Toolbar>
    </AppBar>
  );
};

export default PublicHeader;
