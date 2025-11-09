// src/components/HomeButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DARK_BLUE, LOGO_IMAGE } from './designUtils';

const styles = {
  button: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    width: '40px', 
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: `2px solid ${DARK_BLUE}`, 
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    zIndex: 1000, 
    transition: 'opacity 0.2s',
  },
  logoImage: {
    width: '30px', 
    height: '30px',
    objectFit: 'contain',
  }
};

export default function HomeButton() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <button 
      onClick={handleGoHome} 
      style={styles.button}
      aria-label="Go to Home Page"
    >
      <img src={LOGO_IMAGE} alt="Trip Treat Logo" style={styles.logoImage}/>
    </button>
  );
}