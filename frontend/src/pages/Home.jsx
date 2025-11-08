// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import HotelFilterForm from '../components/HotelFilters';
import HotelScatterPlot from "../components/HotelScatterPlot";
import HotelSummaryTable from "../components/HotelSummaryTable";
import { useSession } from '../hooks/useSession';

export default function Home() {
  const [filters, setFilters] = useState(null);
  const [hotels, setHotels] = useState([]);
  const { sessionId, logClick } = useSession();  // ← NEW

  const handleSearch = (f) => {
    setFilters(f);
    setHotels([]);
  };

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
      .then((response) => setHotels(response.data || []))
      .catch((err) => console.error("Error:", err));
  }, [filters]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Hotel Finder</h1>

      <HotelFilterForm onSubmit={handleSearch} />

      {filters && (
        <>
          
          <div style={{ marginTop: '2rem' }}>
            <HotelScatterPlot filters={filters} logClick={logClick} />
          </div>

          <HotelSummaryTable hotels={hotels} filters={filters} logClick={logClick} />
        </>
      )}
    </div>
  );
}