import { useState } from 'react';
import Slider from '@mui/material/Slider';

export default function HotelFilterForm({ onSubmit, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    rating_min: initialFilters.rating_min ?? 4.0,
    rating_max: initialFilters.rating_max ?? 5.0,
    price_min:  initialFilters.price_min  ?? 0,
    price_max:  initialFilters.price_max  ?? 1000,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(filters);
  };

  return (
    <>
      <style>{`
        .hotel-filter-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 500px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,.08);
        }
        .form-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .form-group label {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
          font-weight: 500;
          color: #333;
          min-width: 120px;
        }
        .form-group input {
          margin-top: 0.4rem;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        .search-btn {
          align-self: flex-start;
          padding: 0.6rem 1.5rem;
          background: #6A6DCD;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .search-btn:hover {
          background: #6A6DCD;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="hotel-filter-form">

        {/* Rating Slider */}
        <div className="form-group">
          <label>
            Rating Range: {filters.rating_min.toFixed(1)} – {filters.rating_max.toFixed(1)}
          </label>

          <Slider
            value={[filters.rating_min, filters.rating_max]}
            min={0}
            max={5}
            step={0.1}
            valueLabelDisplay="auto"
            onChange={(e, newValue) => {
            const updated = {
              ...filters,
              rating_min: newValue[0],
              rating_max: newValue[1],
            };
            setFilters(updated);
            onSubmit(updated); 
          }}
          />
        </div>

        {/* Price Slider */}
        <div className="form-group">
          <label>
            Price Range: ${filters.price_min} – ${filters.price_max}
          </label>

          <Slider
            value={[filters.price_min, filters.price_max]}
            min={0}
            max={5000}
            step={10}
            valueLabelDisplay="auto"
            onChange={(e, newValue) => {
          const updated = {
            ...filters,
            price_min: newValue[0],
            price_max: newValue[1],
          };
          setFilters(updated);
          onSubmit(updated); 
        }}

          />
        </div>
      </form>
    </>
  );
}