
import React from 'react';

const BadgePlaceholder = ({ achieved }) => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <rect
      x="4" y="4"
      width="40" height="40"
      rx="8"
      fill={achieved ? '#000' : '#eee'}
      fillOpacity={achieved ? 0.1 : 0.5}
      stroke={achieved ? '#000' : '#ccc'}
      strokeWidth="2"
    />
  </svg>
);

export default BadgePlaceholder;