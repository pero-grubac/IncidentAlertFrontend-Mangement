import React, { useState, useRef, useEffect } from "react";
import { TextField, IconButton, Button, Grid } from "@mui/material";
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
      console.log(place);

      if (place && place.formatted_address) {
        setLocalSearchTerm(place.formatted_address);
        setSearchTerm(place.formatted_address);
      }
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY}
      libraries={["places"]}
    >
      <div className="container">
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
          <div className="top_section">
            <h1 className={`logo  ${isOpen ? "open" : "closed"}`}>
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
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton
                          edge="end"
                          color="inherit"
                          onClick={handleSearch}
                        >
                          <SearchIcon />
                        </IconButton>
                      ),
                    },
                  }}
                  sx={{ width: "100%" }}
                />
              </Autocomplete>
            </div>
            {/* Button for today's incidents */}
            <Button
              onClick={handleTodayIncidents}
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 2 }} // Add margin-top here
            >
              Get Today's Incidents
            </Button>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={1}>
                {" "}
                {/* Razmak između DatePicker-a */}
                <Grid item xs={6}>
                  {" "}
                  {/* Polovina širine za svaki DatePicker */}
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newDate) => setStartDate(dayjs(newDate))}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth sx={{ mt: 2 }} />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newDate) => setEndDate(dayjs(newDate))}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth sx={{ mt: 2 }} />
                    )}
                  />
                </Grid>
              </Grid>

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
