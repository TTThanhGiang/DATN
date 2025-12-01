import React from 'react';
import { Box, CardContent, Container, Typography, Card, CardHeader, Divider } from '@mui/material';

const PageWrapper = ({ title, children, sx = {}, ...others }) => {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <Box
        sx={{
          pt: { xs: 2, md: 3 },
          p: { xs: 2, md: 3, lg: 4 },
        }}
      >
        {/* Tiêu đề nằm trong container để căn giữa */}
        <Card>
          <CardHeader title={title}/>
          <Divider />
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PageWrapper;
