import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import L from "leaflet";
import { useSearch } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import { useIncidents } from "../../context/IncidentContext";

// Default to Belgrade if geolocation is not available or denied
const defaultCenter = {
  lat: 44.787197,
  lng: 20.457273,
};

// Leaflet marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png",
  iconSize: [32, 32],
});

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json`
    );
    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

const geocodeLatLng = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    if (response.data && response.data.display_name) {
      return response.data.display_name;
    } else {
      return "No address found";
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Geocoding error";
  }
};

const UpdateMapCenter = ({ mapCenter }) => {
  const map = useMap(); // Get map instance from react-leaflet

  useEffect(() => {
    if (mapCenter) {
      map.setView([mapCenter.lat, mapCenter.lng], 13); // Automatically move map to the new center
    }
  }, [mapCenter, map]);

  return null; // This component does not render anything
};
const MapClickHandler = ({
  setMarkerPosition,
  setLocationData,
  setSearchTerm,
}) => {
  useMapEvents({
    click: async (event) => {
      const clickedLat = event.latlng.lat;
      const clickedLng = event.latlng.lng;

      setMarkerPosition({
        lat: clickedLat,
        lng: clickedLng,
      });

      const locationName = await geocodeLatLng(clickedLat, clickedLng);

      console.log("Clicked location:", {
        lat: clickedLat,
        lng: clickedLng,
        name: locationName,
      });

      const location = {
        id: 0,
        latitude: clickedLat,
        longitude: clickedLng,
        name: locationName,
      };

      setSearchTerm(locationName);
      setLocationData(location);
      setMarkerPosition({ lat: clickedLat, lng: clickedLng });
    },
  });

  return null; // This component does not render anything
};
const LeafletMapComponent = () => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const { incidents } = useIncidents();
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get the user's location using the Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingLocation(false); // User location fetched successfully
        },
        () => {
          console.warn("User denied location access or error occurred.");
          setLoadingLocation(false); // Fall back to defaultCenter if denied
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      setLoadingLocation(false); // Fall back to defaultCenter
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const geocodeAndPlaceMarker = async () => {
        const location = await geocodeAddress(searchTerm);
        if (location) {
          setMarkerPosition(location); // Place the marker at the searched location
          setMapCenter(location); // Immediately update the map center to the searched location
        }
      };
      geocodeAndPlaceMarker();
    }
  }, [searchTerm]);

  const handleMarkerDblClick = (location) => {
    if (location) {
      navigate(`/location/${location.name}`, {
        state: { location },
      });
    }
  };

  if (loadingLocation) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <MapContainer
        center={userLocation || defaultCenter}
        zoom={10}
        style={{ width: "100%", height: "100vh" }}
      >
        {/* OSM Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker on the map */}
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon={markerIcon}
            eventHandlers={{
              dblclick: () => handleMarkerDblClick(locationData),
            }}
          />
        )}

        {/* Markers for incidents */}
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={{
              lat: incident.location.latitude,
              lng: incident.location.longitude,
            }}
            icon={markerIcon}
            eventHandlers={{
              dblclick: () =>
                handleMarkerDblClick({
                  id: incident.id,
                  latitude: incident.location.latitude,
                  longitude: incident.location.longitude,
                  name: incident.location.name,
                }),
            }}
          />
        ))}

        {/* Handle map click events */}
        <MapClickHandler
          setMarkerPosition={setMarkerPosition}
          setLocationData={setLocationData}
          setSearchTerm={setSearchTerm}
        />

        {/* Update map center when a new search term is found */}
        <UpdateMapCenter mapCenter={mapCenter} />
      </MapContainer>
    </Box>
  );
};

export default LeafletMapComponent;
