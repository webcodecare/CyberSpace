"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";

/**
 * Office location.
 * Address text is used for directions (Google resolves it itself).
 * Coordinates: OpenStreetMap way 32720392 "Həsən Məcidov küçəsi", Yasamal, Baku (street-level).
 * House No. 14 is not mapped in OSM/Mapbox. Replace OFFICE.lat/lng with exact building
 * coordinates (e.g. from Google Maps "What's here?") to pin the building precisely.
 */
const OFFICE = {
  address: "14 Hasan Mejidov Street, Baku, Azerbaijan",
  lat: 40.38394,
  lng: 49.81149,
  zoom: 15.5,
};

const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  OFFICE.address,
)}&travelmode=driving`;

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Soft "light" Mapbox style + blue (--blue #1457d9) pin. Marker is the image center, so it
// stays visible when the image is cropped (object-fit: cover) on narrow screens.
const MAP_SRC = TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l+1457d9(${OFFICE.lng},${OFFICE.lat})/${OFFICE.lng},${OFFICE.lat},${OFFICE.zoom},0/1280x640@2x?logo=true&attribution=true&access_token=${TOKEN}`
  : null;

export default function OfficeMap({
  title,
  directionsLabel,
  unavailableLabel,
}: {
  title: string;
  directionsLabel: string;
  unavailableLabel: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showMap = MAP_SRC && !failed;

  return (
    <div className="office-map">
      {showMap ? (
        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="office-map__frame"
          aria-label={`${directionsLabel}: ${OFFICE.address}`}
        >
          {!loaded && <span className="office-map__skeleton skel" aria-hidden="true" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MAP_SRC}
            alt={`${title}: ${OFFICE.address}`}
            className={`office-map__img${loaded ? " is-loaded" : ""}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </a>
      ) : (
        <div className="office-map__frame office-map__frame--fallback" role="status">
          <MapPin size={28} />
          <p>{unavailableLabel}</p>
        </div>
      )}

      <div className="office-map__card">
        <span className="office-map__pin">
          <MapPin size={18} />
        </span>
        <div className="office-map__text">
          <strong>{title}</strong>
          <span>{OFFICE.address}</span>
        </div>
        <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm office-map__btn">
          <Navigation size={14} /> {directionsLabel}
        </a>
      </div>
    </div>
  );
}
