// src/pages/Restaurants.jsx
import { useState, useEffect } from 'react';
import RestaurantFilterForm from '../components/RestFilters';
import RestaurantList from '../components/RestaurantList';
import HomeButton from '../components/HomeButton';
// Import only necessary utilities
import { GRAY_BACKGROUND, TreatIcon, DARK_BLUE, LOGO_IMAGE } from '../components/designUtils'; 

// --- HEADER CONSTANTS ---
const LOGO_TREAT = '/logoTreat.png'; 
const HEADER_HEIGHT = '100px'; 
const FOOTER_HEIGHT = '10vh';
const NEW_YELLOW_ACCENT = '#DFAA5B'; 
const FONT_SIZE = '2.5rem'; 

// New component for the icon image (Now large and fixed size)
const TreatIconImage = (
    <img 
        src={LOGO_TREAT} 
        alt="Treat Icon" 
        // This style ensures the image scales to the container height and keeps its aspect ratio
        style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
    />
);

// Style objects for the Restaurant page layout
const styles = {
    // --- Header Bar Styles ---
    headerBar: {
        height: HEADER_HEIGHT,
        backgroundColor: DARK_BLUE,
        position: 'relative', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', 
    },
    
    // --- Yellow Banner Style (Trip Helper Box) ---
    yellowBanner: {
        // *** UPDATED: Use the new gold/brown color ***
        backgroundColor: NEW_YELLOW_ACCENT, 
        color: 'white', 
        padding: '10px -100 -100px -200px', // Reduced right padding to make room for the large image
        borderRadius: '8px',
        fontSize: FONT_SIZE,
        fontWeight: 700,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        // *** UPDATED: Gap adjusted and structure modified to contain text + large image ***
        gap: '15px',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '70px', // Fixed height for the banner
    },
    
    // --- Footer Bar Styles ---
    footerBar: {
        height: FOOTER_HEIGHT,
        backgroundColor: DARK_BLUE,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
    },

    // Main Content Area
    contentArea: {
        flexGrow: 1,
        backgroundColor: GRAY_BACKGROUND,
        fontFamily: 'system-ui, sans-serif',
        paddingBottom: '20px',
    },
    
    // Style for the Trip Helper Text to allow flexible sizing
    titleText: {
        whiteSpace: 'nowrap',
        lineHeight: FONT_SIZE,
    }
};

// Recreated PageHeader look (CustomPageHeader)
const CustomPageHeader = ({ title, icon }) => (
    <div style={styles.yellowBanner}>
        {/* Title Text */}
        <div style={styles.titleText}>
            {title}
        </div>
        
        {/* Icon Image */}
        {icon}
    </div>
);


export default function RestaurantPage() {
    const [filters, setFilters] = useState(null);
    const [restaurants, setRestaurants] = useState([]);

    const handleSearch = (f) => {
        setFilters(f);
    };

    useEffect(() => {
        if (!filters) return;

        const query = new URLSearchParams({
            min_price: filters.price_min,
            max_price: filters.price_max,
            min_rating: 0, 
            max_rating: 5,
        });

        fetch(`http://localhost:8000/api/restaurants?${query.toString()}`)
            .then((res) => res.json())
            .then((response) => {
                const list = response.data || [];

                // Sort by rating desc, then reviews desc
                list.sort((a, b) => {
                    if (b.rating === a.rating) {
                        return (b.reviews || 0) - (a.reviews || 0);
                    }
                    return b.rating - a.rating;
                });

                setRestaurants(list);
            })
            .catch((err) => console.error("Error:", err));
    }, [filters]);

    return (
        // Set up the main div for the header/content/footer layout
        <div style={{ minHeight: "100vh", backgroundColor: GRAY_BACKGROUND, fontFamily: "system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
            
            {/* 1. Header Bar with Yellow Banner */}
            <div style={styles.headerBar}>
                <CustomPageHeader 
                    title="Treat Helper" 
                    icon={TreatIconImage} 
                />
            </div>
            
            {/* 2. Main Content Area */}
            <div style={styles.contentArea}>
                <RestaurantFilterForm onSubmit={handleSearch} />
                
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
                    <RestaurantList restaurants={restaurants} />
                </div>
                
                <HomeButton />
            </div>
            
            {/* 3. Footer Bar for Bottom Dark Area */}
            <div style={styles.footerBar}>
                 {/* Footer content removed as per Hotels.jsx update, only structure remains */}
            </div>
        </div>
    );
}