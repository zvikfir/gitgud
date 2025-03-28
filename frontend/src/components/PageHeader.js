import React from 'react';
import Typography from '@mui/material/Typography';

const PageHeader = ({ title, description }) => {
  return (
    <div>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: "2.45rem",
          fontWeight: 700,
          textAlign: "left",
          marginTop: 4,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        component="p"
        gutterBottom
        sx={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: "1.15rem",
          textAlign: "left",
          marginBottom: 4,
          paddingRight: 20,
          color: "text.secondary",
        }}
      >
        {description}
      </Typography>
    </div>
  );
};

export default PageHeader;
