import { useState, useEffect } from 'react';
import RestaurantFilterForm from '../components/RestFilters';
import RestaurantList from '../components/RestaurantList';

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
      min_rating: 0,   // always include all ratings
      max_rating: 5,
    });

    fetch(`http://localhost:8000/api/restaurants?${query.toString()}`)
      .then((res) => res.json())
      .then((response) => {
        const list = response.data || [];

        // ✅ Sort by rating desc, then reviews desc
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
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Restaurant Finder</h1>

      <RestaurantFilterForm onSubmit={handleSearch} />

      <RestaurantList restaurants={restaurants} />
    </div>
  );
}
