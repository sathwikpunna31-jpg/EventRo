import React from 'react';
import { Oval } from 'react-loader-spinner';

function Loader({ size = 40, color = '#6a11cb' }) { // Default size and color
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '2rem' }}>
      <Oval
        height={size}
        width={size}
        color={color}
        secondaryColor="#ccc" // Secondary color for the spinner trail
        strokeWidth={4}
        strokeWidthSecondary={4}
        ariaLabel="loading-indicator"
      />
    </div>
  );
}

export default Loader;