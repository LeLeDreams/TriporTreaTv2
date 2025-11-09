import { useState } from 'react';
import Slider from '@mui/material/Slider';

export default function RestaurantFilterForm({ onSubmit, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    price_min: initialFilters.price_min ?? 1,
    price_max: initialFilters.price_max ?? 4,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(filters);
  };

  const priceLabel = (val) => "$".repeat(val);

  return (
    <>
      <style>{`
        .restaurant-filter-form {
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
      `}</style>

      <form onSubmit={handleSubmit} className="restaurant-filter-form">

        {/* Price Range Slider ONLY */}
        <div>
          <label>
            Price: {priceLabel(filters.price_min)} – {priceLabel(filters.price_max)}
          </label>

          <Slider
            value={[filters.price_min, filters.price_max]}
            min={1}
            max={4}
            step={1}
            marks={[
              { value: 1, label: "$" },
              { value: 2, label: "$$" },
              { value: 3, label: "$$$" },
              { value: 4, label: "$$$$" }
            ]}
            valueLabelFormat={priceLabel}
            valueLabelDisplay="auto"
            onChange={(e, newValue) => {
              const updated = {
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
