// src/pages/Home.jsx
import { borderRadius } from '@mui/system';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BACKGROUND_IMAGE = '/TriporTreatBG.png'; 
const LOGO_IMAGE = '/logo.png'; 
const DARK_BLUE = '#0F2035'; 
const YELLOW_ACCENT = '#DFAA5B'; 
const LOGO_TRIP = '/logoTrip.png';
const LOGO_TREAT = '/logoTreat.png';

export default function Home() {
  const navigate = useNavigate();

  const handleTripClick = () => {
    navigate('/hotels');
  };

  const handleTreatClick = () => {
    navigate('/restaurants');
  };

  const HEADER_HEIGHT = '15vh'; // Height of the top dark blue bar
  const FOOTER_HEIGHT = '15vh'; // Height of the bottom dark blue bar

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: DARK_BLUE, // Default background for header/footer
    },
    
    // --- New Header Bar for Logo and Top Triangle ---
    headerBar: {
      height: HEADER_HEIGHT,
      backgroundColor: DARK_BLUE,
      position: 'relative', // To contain the logo and triangle
    },
    
    logoContainer: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute', // Positioned within the header bar
      top: '50%', // Vertically center in the header
      left: '50%',
      transform: 'translate(-50%, -50%)', // Centering trick
      zIndex: 2,
      // Add a slight box shadow if desired for separation
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    },
    logoImage: {
      width: '80px',
      height: '80px',
      objectFit: 'contain',
      borderRadius: '50%',
    },
    
    // --- Hero Section (Image and Content) ---
    heroSection: {
      flexGrow: 1, // Takes up remaining space
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
      filter: 'brightness(60%) contrast(60%) saturate(50%)', 
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
    
    // --- Button Styles (Adjusted for better icon/text alignment) ---
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
      backgroundColor: YELLOW_ACCENT, // Buttons are already the same color
      color: 'white', // Changed button text to white
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', 
      gap: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      width: '150px', 
      height: '50px',
    },
    buttonIcon:{
      width: '40px', // Increased icon size to be closer to button size
      height: '40px',
      objectFit: 'contain',
    },
    
    // --- New Footer Bar for Bottom Dark Area ---
    footerBar: {
      height: FOOTER_HEIGHT,
      backgroundColor: DARK_BLUE,
      position: 'relative',
    },
  };

  return (
    <div style={styles.container}>
      
      {/* 1. Header Bar for Logo and Top Dark Area */}
      <div style={styles.headerBar}>
        {/* Logo Area (Moved up into the dark bar) */}
        <div style={styles.logoContainer}>
          <img src={LOGO_IMAGE} alt="Trip Treat Logo" style={styles.logoImage}/>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div style={styles.heroSection}>
        {/* Background Image */}
        <img src={BACKGROUND_IMAGE} alt="City Skyline" style={styles.backgroundImage} />
        
        {/* Visual Shapes/Triangles - Placed here to overlay the image */}
        {/* Top-Right Triangle */}
        <div style={{
           position: 'absolute',
           top: 0,
           right: 0,
           width: 0,
           height: 0,
           borderStyle: 'solid',
           borderWidth: '0 150px 150px 0', 
           borderColor: `transparent ${DARK_BLUE} transparent transparent`,
           zIndex: 1,
        }}></div>

        {/* Bottom-Left Triangle (Flipped) */}
        <div style={{
           position: 'absolute',
           bottom: 0,
           left: 0,
           width: 0,
           height: 0,
           borderStyle: 'solid',
           borderWidth: '150px 0 0 150px', 
           borderColor: `${DARK_BLUE} transparent transparent ${DARK_BLUE}`,
           zIndex: 1,
        }}></div>

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
              <img src={LOGO_TRIP} alt="Trip Icon" style={styles.buttonIcon} />
              Trip
            </button>

            {/* Treat Button (Restaurants) */}
            <button 
              onClick={handleTreatClick} 
              style={styles.button}
            >
              <img src={LOGO_TREAT} alt="Treat Icon" style={styles.buttonIcon} />
              Treat
            </button>
          </div>
        </div>
      </div>
      
      {/* 3. Footer Bar for Bottom Dark Area */}
      <div style={styles.footerBar}>
      </div>
    </div>
  );
}