// src/components/designUtils.jsx
import React from 'react';

// --- DESIGN CONSTANTS ---
export const DARK_BLUE = '#0F2035'; 
export const YELLOW_ACCENT = '#f5c542';
export const GRAY_BACKGROUND = '#f8f8f8';
export const LOGO_IMAGE = '/logo.png'; 

// A reusable Card component for styling sections
export const Card = ({ children, style }) => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        padding: '20px',
        ...style,
    }}>
        {children}
    </div>
);

// A reusable Header component (Trip Helper / Restaurant Finder banner)
export const PageHeader = ({ title, icon }) => (
    <div style={{
        backgroundColor: DARK_BLUE,
        padding: '50px 0 20px 0',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        marginBottom: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    }}>
        <div style={{
            display: 'inline-block',
            backgroundColor: YELLOW_ACCENT,
            color: DARK_BLUE,
            padding: '10px 40px',
            borderRadius: '8px',
            fontSize: '2.5rem',
            fontWeight: 700,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        }}>
            {title}
            {icon}
        </div>
    </div>
);

// Icons (redefined to ensure they are available)
export const HotelIcon = (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={DARK_BLUE}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);
export const TreatIcon = (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={DARK_BLUE}>
        <path d="M16 6v8c0 2.21-1.79 4-4 4s-4-1.79-4-4V6H6v8c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-2zM14 2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
    </svg>
);