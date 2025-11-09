import React from "react";

export default function RestaurantList({ restaurants }) {
  if (!restaurants || restaurants.length === 0) {
    return <p style={{ marginTop: "1.5rem" }}>No restaurants found.</p>;
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ marginBottom: "0.5rem" }}>Results</h2>

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "1rem",
          paddingBottom: "1rem",
        }}
      >
        {restaurants.map((r) => (
          <div
            key={r.id}
            style={{
              minWidth: "250px",
              background: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              cursor: "pointer",
            }}
            onClick={() => r.link && window.open(r.link, "_blank")}
          >
            {/* IMAGE */}
            <img
              src={r.featured_image || "/no-image.jpg"}
              alt={r.name}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
              }}
            />

            <div style={{ padding: "0.8rem" }}>
              {/* NAME */}
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.3rem",
                }}
              >
                {r.name}
              </div>

              {/* STAR RATING */}
              <div style={{ fontSize: "0.9rem", color: "#555" }}>
                ⭐ {r.rating?.toFixed(1) || "N/A"}
                <span style={{ marginLeft: "0.4rem", opacity: 0.8 }}>
                  ({r.reviews})
                </span>
              </div>

              {/* PRICE RANGE */}
              <div style={{ marginTop: "0.3rem", fontSize: "0.9rem" }}>
                {r.price_range || "$".repeat(r.price_min || 1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
