import React, { useState, useRef, useEffect } from "react";
import { TextField, IconButton, Button, Box, Stack } from "@mui/material";
import "./Sidebar.css";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useSearch } from "../../context/SearchContext";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useIncidents } from "../../context/IncidentContext";
import dayjs from "dayjs";
import environment from "../../Enviroments";

const libraries = ["places"];

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const { searchTerm, setSearchTerm } = useSearch();
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const navigate = useNavigate();
  const { fetchIncidentsOnDate, fetchIncidentsInDateRange } = useIncidents();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const autocompleteRef = useRef(null);

  const googleMapsApiKey = {
    key: environment().REACT_APP_GOOGLE_API_KEY,
  };

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleTodayIncidents = () => {
    const today = dayjs().toISOString();
    fetchIncidentsOnDate(today);
  };

  const handleDateRangeIncidents = () => {
    if (startDate && endDate) {
      fetchIncidentsInDateRange(
        startDate.startOf("day").toISOString(),
        endDate.startOf("day").toISOString()
      );
    }
  };

  const handleSearch = () => {
    setSearchTerm(localSearchTerm);
    navigate("/");
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        setLocalSearchTerm(place.formatted_address);
        setSearchTerm(place.formatted_address);
      }
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey.key}
      libraries={libraries}
      loadingElement={<div>Loading...</div>}
      defer
    >
      <div className="container">
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
          <div className="top_section">
            <h1 className={`logo ${isOpen ? "open" : "closed"}`}>
              Incident Alert
            </h1>
            <div
              style={{ marginLeft: isOpen ? "50px" : "0px" }}
              className={`bars ${isOpen ? "visible" : "hidden"}`}
            >
              <MenuIcon onClick={toggle} />
            </div>
          </div>
          <div className={`menuItems ${isOpen ? "visible" : "hidden"}`}>
            <div className="searchBox" style={{ marginBottom: "20px" }}>
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
              >
                <TextField
                  variant="outlined"
                  placeholder="Search..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleSearch}
                      >
                        <SearchIcon />
                      </IconButton>
                    ),
                  }}
                  sx={{ width: "100%" }}
                />
              </Autocomplete>
            </div>
            <Button
              onClick={handleTodayIncidents}
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            >
              Get Today's Incidents
            </Button>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction="row" spacing={2} width="100%">
                <Box flex={1}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newDate) => setStartDate(dayjs(newDate))}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" fullWidth />
                    )}
                  />
                </Box>
                <Box flex={1}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newDate) => setEndDate(dayjs(newDate))}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" fullWidth />
                    )}
                  />
                </Box>
              </Stack>
              <Button
                onClick={handleDateRangeIncidents}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Get Incidents in Date Range
              </Button>
            </LocalizationProvider>
            <Button
              onClick={() => navigate("/category")}
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Manage Categories
            </Button>
            <Button
              onClick={() => navigate("/grouped-incidents")}
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
            >
              View Grouped Incidents
            </Button>
          </div>
          <div className={`menuIcon ${!isOpen ? "visible" : "hidden"}`}>
            <MenuIcon onClick={toggle} />
          </div>
        </div>
        <main>{children}</main>
      </div>
    </LoadScript>
  );
};

export default Sidebar;
