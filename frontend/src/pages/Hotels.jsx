// src/pages/Hotels.jsx
import { useState, useEffect } from 'react';
import HotelFilterForm from '../components/HotelFilters';
import HotelScatterPlot from "../components/HotelScatterPlot";
import HotelSummaryTable from "../components/HotelSummaryTable";
import HomeButton from '../components/HomeButton';
// Import original components (Note: YELLOW_ACCENT is now overridden locally)
import { Card, GRAY_BACKGROUND, DARK_BLUE, LOGO_IMAGE } from '../components/designUtils';

// Constants
const LOGO_TRIP = '/logoTrip.png'; 
const HEADER_HEIGHT = '100px'; 
const FOOTER_HEIGHT = '10vh';
// *** UPDATED: Set the banner/icon background color to the gf\old/brown from the image ***
const NEW_YELLOW_ACCENT = '#DFAA5B'; 
const FONT_SIZE = '2.5rem'; // Keep title font size consistent

// New component for the icon image (Now large and fixed size)
const TripIconImage = (
    <img 
        src={LOGO_TRIP} 
        alt="Trip Icon" 
        // This style ensures the image scales to the container height and keeps its aspect ratio
        style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
    />
);

// Style objects for the Hotel page layout
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
        padding: '10px 0 10px 40px', // Reduced right padding to make room for the large image
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
        // Ensure text doesn't shrink
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
        
        {/* Icon Image (Now takes up the remaining height/space) */}
        {icon}
    </div>
);


export default function Hotels() {
    const [filters, setFilters] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [recLoading, setRecLoading] = useState(false);

    const sessionId = localStorage.getItem('hotel_session_id') || Math.random().toString(36).substr(2, 9);
    localStorage.setItem('hotel_session_id', sessionId);

    const handleSearch = (f) => {
        setFilters(f);
        setHotels([]);
        setRecommendations([]);
        setRecLoading(true);
    };

    // === FETCH HOTELS ===
    useEffect(() => {
        if (!filters) return;

        const query = new URLSearchParams({
            min_price: filters.price_min,
            max_price: filters.price_max,
            min_rating: filters.rating_min,
            max_rating: filters.rating_max,
        });

        fetch(`http://localhost:8000/api/hotels?${query.toString()}`)
            .then((res) => res.json())
            .then((response) => {
                setHotels(response.data || []);
                setRecLoading(false);
            })
            .catch((err) => console.error("Error:", err));
    }, [filters]);

    // === FETCH RECOMMENDATIONS ON FILTER CHANGE ===
    useEffect(() => {
        if (!filters) return;

        const city = hotels[0]?.city ?? "New York";
        setRecLoading(true);

        fetch(
            `http://localhost:8000/recommend?session_id=${sessionId}&city=${encodeURIComponent(city)}&limit=5`
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error('HTTP error ' + res.status);
                }
                return res.json();
            })
            .then((data) => {
                console.log("Recommendations:", data);
                setRecommendations(data?.recommendations || []);
            })
            .catch((err) => console.error("Recs error:", err))
            .finally(() => setRecLoading(false));
    }, [filters, sessionId, hotels]);

    return (
        <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: GRAY_BACKGROUND, fontFamily: 'system-ui, sans-serif'}}>
            
            {/* 1. Header Bar with Yellow Banner */}
            <div style={styles.headerBar}>
                <CustomPageHeader 
                    title="Trip Helper" 
                    icon={TripIconImage} 
                />
            </div>
            
            {/* 2. Main Content Area */}
            <div style={styles.contentArea}>
                <HotelFilterForm onSubmit={handleSearch} />

                {filters && (
                    <>
                        <div style={{ 
                            display: 'flex', 
                            maxWidth: '1400px', 
                            margin: '20px auto', 
                            padding: '0 20px',
                            gap: '20px',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            }}>
                            {/* Chart Column */}
                            <Card style={{ flex: 1, minWidth: '600px', padding: '0', overflow: 'visible' }}>
                                <HotelScatterPlot filters={filters} />
                            </Card>

                            {/* Table Column */}
                            <div style={{ width: '450px', flexShrink: 0 }}>
                                <HotelSummaryTable hotels={hotels} filters={filters} />
                            </div>
                        </div>

                        {/* RECOMMENDATIONS */}
                        <div style={{ maxWidth: '1400px', margin: '0 auto 20px auto', padding: '0 20px' }}>
                            <h2>You May Also Like</h2>
                            {recLoading ? (
                                <div style={{ margin: '1rem 0', color: '#666' }}>
                                    <p>Loading recommendations…</p>
                                </div>
                            ) : recommendations.length > 0 ? (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {recommendations.map((hotel) => (
                                        <div
                                            key={hotel.id}
                                            style={{
                                                border: '1px solid #ddd',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                width: '200px',
                                                backgroundColor: 'white',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {hotel.featured_image ? (
                                                <img
                                                    src={hotel.featured_image}
                                                    alt={hotel.name}
                                                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100px', background: '#eee', borderRadius: '4px' }} />
                                            )}
                                            <p style={{marginTop: '0.5rem', marginBottom: '0.2rem'}}><strong>{hotel.name}</strong></p>
                                            <p style={{margin: '0', fontSize: '0.9rem'}}>Rating: {hotel.rating} </p>
                                            {hotel.matched_highlights && hotel.matched_highlights.length > 0 && (
                                                <p style={{ margin: '0.4rem 0', fontSize: '0.85rem', color: '#555' }}>
                                                    <strong>Matches:</strong> {hotel.matched_highlights.join(', ')}
                                                </p>
                                            )}
                                            <a
                                                href={hotel.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#0066cc' }}
                                            >
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ margin: '1rem 0', color: '#666' }}>
                                    <p>No recommendations yet. Click a few hotels to get started.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
                
                <HomeButton />
            </div>
            
            {/* 3. Footer Bar for Bottom Dark Area */}
            <div style={styles.footerBar}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <img src={LOGO_IMAGE} alt="Logo" style={{width: '30px', height: '30px', objectFit: 'contain'}}/>
                </div>
            </div>
        </div>
    );
}