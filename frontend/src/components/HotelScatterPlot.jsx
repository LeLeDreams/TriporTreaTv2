// src/components/HotelScatterPlot.jsx
import React, { useEffect, useState } from "react";
import Plotly from "plotly.js-gl2d-dist";
import createPlotlyComponent from "react-plotly.js/factory";
import { useSession } from '../hooks/useSession';

const Plot = createPlotlyComponent(Plotly);

export default function HotelScatterPlot({ filters }) {
  const [hotels, setHotels] = useState([]);
  const { logClick } = useSession();

  const [tip, setTip] = useState({
    show: false,
    x: 0,
    y: 0,
    data: null,
  });

  const colors = [
    "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
    "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  ];

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
        })
        .catch((err) => console.error("Error fetching hotel data:", err));
    }, [filters]);

  if (hotels.length === 0) return <p>Loading...</p>;

  // === 1. Define fixed rating clusters (e.g. 4.8, 4.9, 5.0) ===
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

  // === 3. Build one trace per cluster ===
  const traces = ratingClusters.map((rating, idx) => {
    const group = clusterMap[rating] || [];
    const n = group.length;

    // === Horizontal jitter inside cluster to avoid overlap ===
    const jitterWidth = 0.04; // small spread within cluster
    const xPositions = group.map((_, i) => {
      const offset = (i - (n - 1) / 2) * (jitterWidth / (n - 1 || 1));
      return rating + offset;
    });

    // Sort group by price_avg for consistent order
    const sortedGroup = [...group].sort((a, b) => a.price_avg - b.price_avg);
    
    const customdata = sortedGroup.map((h) => [
      h.price_min,
      h.price_max,
      h.link || null,
      h.id, //  hotel.id for click tracking
      h.featured_image
    ])

    return {
      x: xPositions,
      y: sortedGroup.map((h) => h.price_avg), // true Y, no distortion
      text: sortedGroup.map((h) => h.name),
      link: sortedGroup.map((h) => h.link),
      customdata,
      mode: "markers",
      type: "scattergl",
      marker: { size: 10, opacity: 0.9, color: colors[idx % colors.length]},
      error_y: {
        type: "data",
        symmetric: false,
        array: sortedGroup.map((h) => h.price_max - h.price_avg),
        arrayminus: sortedGroup.map((h) => h.price_avg - h.price_min),
        thickness: 1.8,
        width: 6,
      },
      hoverinfo: "none",
      hovertemplate: null,
      name: `Rating ${rating}`,
//      hovertemplate:
//        "<b>%{text}</b><br>" +
//        `Rating: ${rating}<br>` +
//        "Avg Price: %{y:.0f}<br>" + 
//        "Minimum Price: %{customdata[0]:.0f} <br>"+
//        "Maximum Price: %{customdata[1]:.0f} <br>" +
//        '<a href="%{[customdata[2]]]}" target="_blank" style="color: #0066cc; text-decoration: underline;">View on TripAdvisor</a><br>'+
//        "<extra></extra>",
//      name: `Rating ${rating}`,
    };
  });

  // === 4. Layout: fixed clusters + spacing ===
  const clusterSpacing = 0.15; // gap between clusters
  const xMin = ratingClusters[0] - clusterSpacing;
  const xMax = ratingClusters[ratingClusters.length - 1] + clusterSpacing;

  const layout = {
    title: "Hotel Price Ranges by Rating",
    xaxis: {
      title: "Rating",
      tickmode: "array",
      tickvals: ratingClusters,
      ticktext: ratingClusters.map((r) => r.toFixed(1)),
      fixedrange: true,
      range: [xMin, xMax],
      showgrid: true,
      zeroline: false,
    },
    yaxis: {
      title: "Price (Min–Avg–Max)",
      fixedrange: false,
      range: [0, null],
      showgrid: true,
    },
    width: 900,
    height: 600,
    hovermode: "closest",
    showlegend: false,
    margin: { l: 60, r: 40, t: 60, b: 60 },
  };

  return (
    <div style={{ position: "relative" }}>
      <Plot
        data={traces}
        layout={layout}
        config={{ responsive: true }}
        onHover={(e) => {
          const p = e.points?.[0];
          if (!p) return;

          // mimic Dash’s bbox by using the browser event coordinates
          const clientX = e.event?.clientX ?? 0;
          const clientY = e.event?.clientY ?? 0;

          const [minP, maxP, url, id, img, ratingBin, name, avgP] = p.customdata || [];

          setTip({
            show: true,
            x: clientX + 12, // small offset from cursor
            y: clientY + 12,
            data: {
              id,
              url,
              img,
              name,
              rating: ratingBin,
              avg: avgP ?? p.y,
              min: minP,
              max: maxP,
            },
          });
        }}
        onUnhover={() => setTip({ show: false, x: 0, y: 0, data: null })}
        onClick={(e) => {
          const p = e.points?.[0];
          if (!p) return;
          const [, , url, id] = p.customdata || [];
          if (id) logClick(id);
          if (url) window.open(url, "_blank");
        }}
      />

      {/* Custom tooltip card (like Dash's dcc.Tooltip children) */}
      {tip.show && tip.data && (
        <div
          style={{
            position: "fixed",
            left: tip.x,
            top: tip.y,
            zIndex: 1000,
            background: "rgba(20,20,20,0.96)",
            color: "#fff",
            borderRadius: 12,
            padding: 10,
            width: 260,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            pointerEvents: "none", // don’t block plot interactions
            backdropFilter: "blur(2px)",
          }}
        >
          {tip.data.img && (
            <img
              src={tip.data.img}
              alt="Hotel"
              style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}

          <div style={{ fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>
            {tip.data.name || "Hotel"}
          </div>

          <div style={{ fontSize: 13, opacity: 0.95, lineHeight: 1.35 }}>
            Rating: {tip.data.rating?.toFixed?.(1) ?? "—"} <br />
            Avg: ${Math.round(tip.data.avg ?? 0)} <br />
            Min–Max: ${Math.round(tip.data.min ?? 0)}–${Math.round(tip.data.max ?? 0)}
          </div>

          {tip.data.url && (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
              (click point to open TripAdvisor)
            </div>
          )}
        </div>
      )}
    </div>
  );
}