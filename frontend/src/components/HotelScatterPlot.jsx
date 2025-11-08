// src/components/HotelScatterPlot.jsx
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

export default function HotelScatterPlot({ filters }) {
  const [hotels, setHotels] = useState([]);

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
      .then((data) => setHotels(data))
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
      h.link || null
    ])

    return {
      x: xPositions,
      y: sortedGroup.map((h) => h.price_avg), // true Y, no distortion
      text: sortedGroup.map((h) => h.name),
      link: sortedGroup.map((h) => h.link),
      customdata,
      mode: "markers",
      type: "scatter",
      marker: { size: 10, opacity: 0.9, color: colors[idx % colors.length]},
      error_y: {
        type: "data",
        symmetric: false,
        array: sortedGroup.map((h) => h.price_max - h.price_avg),
        arrayminus: sortedGroup.map((h) => h.price_avg - h.price_min),
        thickness: 1.8,
        width: 6,
      },
      hovertemplate:
        "<b>%{text}</b><br>" +
        `Rating: ${rating}<br>` +
        "Avg Price: %{y:.0f}<br>" + 
        "Minimum Price: %{customdata[0]:.0f} <br>"+
        "Maximum Price: %{customdata[1]:.0f} <br>" +
        '<a href="%{[customdata[2]]]}" target="_blank" style="color: #0066cc; text-decoration: underline;">View on TripAdvisor</a><br>'+
        "<extra></extra>",
      name: `Rating ${rating}`,
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

  return <Plot 
      data={traces} 
      layout={layout} 
      config={{ responsive: true }} 
      onClick={(event) => {
        console.log("--- Plot Click Event ---");
        const point = event.points?.[0];
        console.log("Clicked point data:", point);

        if(point){
          console.log("Point's customdata:", point.customdata);
          const url = point?.customdata?.[2];
          console.log("Extracted URL:", url);

          if (url){
            console.log("Attempting to open URL:", url);
            window.open(url, "_blank");
          } else {
            console.log("No URL found at customdata[2].");
          }
        } else {
          console.log("Click event had no point data.");
        }
      }}
  />;
}