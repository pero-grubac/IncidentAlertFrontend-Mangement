import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Box, CircularProgress } from "@mui/material";
import { useSearch } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import { useIncidents } from "../../context/IncidentContext";
const containerStyle = {
  width: "100%",
  height: "100vh",
};

const initialCenter = {
  lat: 44.787197,
  lng: 20.457273,
};

const geocodeLatLng = async (lat, lng) => {
  const geocoder = new window.google.maps.Geocoder();
  const latLng = new window.google.maps.LatLng(lat, lng);

  try {
    const results = await new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });

    if (results && results.length > 0) {
      return results[0].formatted_address;
    } else {
      return "No address found";
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Geocoding error";
  }
};

const geocodeAddress = async (address) => {
  const geocoder = new window.google.maps.Geocoder();

  try {
    const results = await new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });

    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      return { lat: lat(), lng: lng() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

const MapComponent = () => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const { incidents } = useIncidents();
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (searchTerm) {
      const geocodeAndPlaceMarker = async () => {
        const location = await geocodeAddress(searchTerm);
        if (location) {
          setMarkerPosition(location);
          setLocationData({
            id: 0,
            latitude: location.lat,
            longitude: location.lng,
            name: searchTerm,
          });
        }
      };
      geocodeAndPlaceMarker();
    }
  }, [searchTerm]);

  // Display loading spinner while Google Maps is not loaded
  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Set full screen height
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleMarkerDblClick = (location) => {
    if (location) {
      navigate(`/location/${location.name}`, {
        state: { location },
      });
    }
  };

  const handleMapClick = async (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    setMarkerPosition({
      lat: clickedLat,
      lng: clickedLng,
    });
    const locationName = await geocodeLatLng(clickedLat, clickedLng);

    console.log("Kliknuta lokacija:", {
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
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box sx={{ flex: 1 }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition || initialCenter}
          zoom={10}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            zoomControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              onDblClick={() => handleMarkerDblClick(locationData)}
            />
          )}
          {incidents.map((incident) => (
            <Marker
              key={incident.id}
              position={{
                lat: incident.location.latitude,
                lng: incident.location.longitude,
              }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(32, 32),
              }}
              onDblClick={() =>
                handleMarkerDblClick({
                  id: incident.id,
                  latitude: incident.location.latitude,
                  longitude: incident.location.longitude,
                  name: incident.location.name,
                })
              }
            />
          ))}
        </GoogleMap>
      </Box>
    </Box>
  );
};

export default MapComponent;
