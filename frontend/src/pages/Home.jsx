// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BACKGROUND_IMAGE = '/nyc-skyline-2.jpg'; 
const LOGO_IMAGE = '/logo.png'; 
const DARK_BLUE = '#0F2035'; 
const YELLOW_ACCENT = '#f5c542'; 

export default function Home() {
  const navigate = useNavigate();

  const handleTripClick = () => {
    navigate('/hotels');
  };

  const handleTreatClick = () => {
    navigate('/restaurants');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: DARK_BLUE,
    },
    heroSection: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      zIndex: 0,
      filter: 'brightness(70%)',
    },
    contentOverlay: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      color: 'white',
      padding: '20px',
    },
    mainTitle: {
      fontSize: '4.5vw',
      fontWeight: 700,
      letterSpacing: '2px',
      marginBottom: '10px',
    },
    tagline: {
      fontSize: '1.2rem',
      fontWeight: 300,
      marginBottom: '30px',
    },
    buttonContainer: {
      display: 'flex',
      gap: '25px',
    },
    button: {
      padding: '12px 30px',
      fontSize: '1.1rem',
      fontWeight: 600,
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      backgroundColor: YELLOW_ACCENT,
      color: DARK_BLUE,
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    logoContainer: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2,
    },
    logoImage: {
        width: '80px',
        height: '80px',
        objectFit: 'contain'
    },
    triangleTopRight: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '0 300px 300px 0',
      borderColor: `transparent ${DARK_BLUE} transparent transparent`,
      zIndex: 1,
    },
    triangleBottomLeft: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '300px 0 0 300px',
      borderColor: `${DARK_BLUE} transparent transparent transparent`,
      zIndex: 1,
    }
  };

  const TripIcon = ({ color }) => (
    <svg width="20" height="20" fill={color} viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );

  const TreatIcon = ({ color }) => (
    <svg width="20" height="20" fill={color} viewBox="0 0 24 24">
      <path d="M16 6v8c0 2.21-1.79 4-4 4s-4-1.79-4-4V6H6v8c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-2zM14 2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
    </svg>
  );


  return (
    <div style={styles.container}>
      {/* Logo Area */}
      <div style={styles.logoContainer}>
         <img src={LOGO_IMAGE} alt="Trip Treat Logo" style={styles.logoImage}/>
      </div>

      <div style={styles.heroSection}>
        {/* Visual Shapes/Triangles */}
        <div style={styles.triangleTopRight}></div>
        <div style={styles.triangleBottomLeft}></div>

        {/* Background Image */}
        <img src={BACKGROUND_IMAGE} alt="City Skyline" style={styles.backgroundImage} />
        
        {/* Main Content */}
        <div style={styles.contentOverlay}>
          <h1 style={styles.mainTitle}>WELCOME TO TRIP | TREAT</h1>
          <p style={styles.tagline}>Good place. Good food. Good feeling.</p>
          
          <div style={styles.buttonContainer}>
            {/* Trip Button (Hotels) */}
            <button 
              onClick={handleTripClick} 
              style={styles.button}
            >
              <TripIcon color={DARK_BLUE} />
              Trip
            </button>

            {/* Treat Button (Restaurants) */}
            <button 
              onClick={handleTreatClick} 
              style={styles.button}
            >
              <TreatIcon color={DARK_BLUE} />
              Treat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}