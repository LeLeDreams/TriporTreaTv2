import { useState } from 'react';

export default function HotelFilterForm({ onSubmit, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    rating_min: initialFilters.rating_min ?? 4.0,
    rating_max: initialFilters.rating_max ?? 5.0,
    price_min:  initialFilters.price_min  ?? 0,
    price_max:  initialFilters.price_max  ?? 1000,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name.includes('rating') ? parseFloat(value) || 0 : parseInt(value) || 0
    }));
  };

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
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .search-btn:hover {
          background: #0055aa;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="hotel-filter-form">
        <div className="form-group">
          <label>
            Min Rating
            <input
              type="number"
              step="0.1"
              name="rating_min"
              value={filters.rating_min}
              onChange={handleChange}
              min="0"
              max="5"
              required
            />
          </label>

          <label>
            Max Rating
            <input
              type="number"
              step="0.1"
              name="rating_max"
              value={filters.rating_max}
              onChange={handleChange}
              min="0"
              max="5"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Min Price ($)
            <input
              type="number"
              name="price_min"
              value={filters.price_min}
              onChange={handleChange}
              min="0"
              required
            />
          </label>

          <label>
            Max Price ($)
            <input
              type="number"
              name="price_max"
              value={filters.price_max}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        <button type="submit" className="search-btn">
          Search Hotels
        </button>
      </form>
    </>
  );
}