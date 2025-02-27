import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const canadaBounds = [40, -140, 70, -50];

  useEffect(() => {
    fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"
    )
      .then((res) => res.json())
      .then((data) => {
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const canadianQuakes = data.features.filter((quake) => {
          const [lng, lat] = quake.geometry.coordinates;
          return (
            lat >= canadaBounds[0] &&
            lat <= canadaBounds[2] &&
            lng >= canadaBounds[1] &&
            lng <= canadaBounds[3] &&
            quake.properties.time >= twoWeeksAgo
          );
        });
        setEarthquakes(canadianQuakes);
      });
  }, []);

  const timeAgo = (time) => {
    const diff = Date.now() - new Date(time).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    return days > 0 ? `${days} days ago` : `${hours} hours ago`;
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "10px",
        display: "flex",
        gap: "20px",
      }}
    >
      <div
        style={{
          flex: "1",
          maxHeight: "80vh",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: "24px" }}>
          🇨🇦 Canada Earthquake Tracker
        </h1>
        {earthquakes.length === 0 ? (
          <p style={{ fontSize: "18px" }}>
            Loading earthquakes...please allow location...
          </p>
        ) : (
          <ul>
            {earthquakes.map((quake) => (
              <li
                key={quake.id}
                style={{
                  marginBottom: "15px",
                  fontSize: "18px",
                  fontWeight: "normal",
                }}
              >
                Magnitude {quake.properties.mag} - {quake.properties.place} -{" "}
                <em>{timeAgo(quake.properties.time)}</em>
              </li>
            ))}
          </ul>
        )}
      </div>
      <MapContainer
        center={[56, -106]}
        zoom={4}
        style={{ flex: "2", height: "80vh" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {earthquakes.map((quake) => (
          <Circle
            key={quake.id}
            center={[
              quake.geometry.coordinates[1],
              quake.geometry.coordinates[0],
            ]}
            radius={quake.properties.mag * 10000}
            pathOptions={{
              fillColor: "red",
              color: "darkred",
              fillOpacity: 0.6,
            }}
          >
            <Popup>
              <strong style={{ fontSize: "16px" }}>Magnitude:</strong>{" "}
              {quake.properties.mag} <br />
              <strong style={{ fontSize: "16px" }}>Location:</strong>{" "}
              {quake.properties.place} <br />
              <strong style={{ fontSize: "16px" }}>Time:</strong>{" "}
              {timeAgo(quake.properties.time)}
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
