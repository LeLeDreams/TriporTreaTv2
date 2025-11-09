// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import HotelFilterForm from '../components/HotelFilters';
import HotelScatterPlot from "../components/HotelScatterPlot";
import HotelSummaryTable from "../components/HotelSummaryTable";

export default function Home() {
  const [filters, setFilters] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const sessionId = localStorage.getItem('hotel_session_id') || Math.random().toString(36).substr(2, 9);
  localStorage.setItem('hotel_session_id', sessionId);

  const handleSearch = (f) => {
    setFilters(f);
    setHotels([]);
    setRecommendations([]);  // Clear old recs
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
        setRecLoading(false);      // stop spinner after hotels arrive
      })
      .catch((err) => console.error("Error:", err));
  }, [filters]);

  // === FETCH RECOMMENDATIONS ON FILTER CHANGE ===
  useEffect(() => {
    if (!filters) return;

    const city = hotels[0]?.city ?? "New York";   // fallback city
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
  }, [filters, sessionId, hotels]);   // ← runs on slider move

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Hotel Finder</h1>

      <HotelFilterForm onSubmit={handleSearch} />

      {filters && (
        <>

          <div style={{ marginTop: '2rem' }}>
            <HotelScatterPlot filters={filters} />
          </div>

          <HotelSummaryTable hotels={hotels} filters={filters} />

                    {/* RECOMMENDATIONS */}
          {recLoading ? (
            <div style={{ margin: '2rem 0', color: '#666' }}>
              <p>Loading recommendations…</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div style={{ margin: '2rem 0' }}>
              <h2>You May Also Like</h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {recommendations.map((hotel) => (
              <div
                key={hotel.id}
                style={{
                  border: '1px solid #ddd',
                  padding: '1rem',
                  borderRadius: '8px',
                  width: '200px',
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
                <p><strong>{hotel.name}</strong></p>
                <p>Rating: {hotel.rating} </p>

                {/* NEW – common highlights */}
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
            </div>
          ) : (
            <div style={{ margin: '2rem 0', color: '#666' }}>
              <p>No recommendations yet. Click a few hotels to get started.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}