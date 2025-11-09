// src/components/HotelSummaryTable.jsx
import React from 'react';
import { useSession } from '../hooks/useSession';

export default function HotelSummaryTable({ hotels, filters }) {
  const { logClick } = useSession();
  if (!hotels?.length || !filters) return null;

  // === 1. Build rating clusters (same logic as scatterplot) ===
  const minRating = Math.ceil(filters.rating_min * 10) / 10;
  const maxRating = Math.floor(filters.rating_max * 10) / 10;
  const ratingClusters = [];
  for (let r = minRating; r <= maxRating; r += 0.1) {
    ratingClusters.push(parseFloat(r.toFixed(1)));
  }

  // === 2. Group hotels by rounded rating ===
  const clusterMap = {};
  ratingClusters.forEach((r) => (clusterMap[r] = []));

  hotels.forEach((h) => {
    const rounded = Math.round(h.rating * 10) / 10;
    if (clusterMap[rounded]) clusterMap[rounded].push(h);
  });

  // === 3. Build table rows ===
  const rows = ratingClusters
    .map((rating) => {
      const group = clusterMap[rating] || [];
      if (group.length === 0) return null;

      const sorted = [...group].sort((a, b) => a.price_avg - b.price_avg);
      const cheapest = sorted[0];

      return {
        rating,
        total: group.length,
        cheapest,
      };
    })
    .filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Hotel Summary by Rating</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Rating</th>
            <th style={styles.th}>Total</th>
            <th style={styles.th}>Cheapest Hotel</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ rating, total, cheapest }) => (
            <tr key={rating}>
              <td style={styles.td}>{rating.toFixed(1)}</td>
              <td style={styles.td}>{total}</td>
              <td style={styles.td}>
                <a
                  href={cheapest.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (cheapest.id) logClick(cheapest.id); // LOG CLICK
                    setTimeout(() => window.open(cheapest.link, "_blank"), 100);
                  }}
                  style={styles.link}
                >
                  {cheapest.name}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { margin: '2rem 0', fontFamily: 'system-ui, sans-serif' },
  title: { marginBottom: '0.8rem', color: '#222' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  th: {
    background: '#6A6DCD',
    color: 'white',
    padding: '0.8rem',
    textAlign: 'left',
    fontWeight: 600,
  },
  td: {
    padding: '0.7rem 0.8rem',
    borderBottom: '1px solid #eee',
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
    fontWeight: 500,
  },
};