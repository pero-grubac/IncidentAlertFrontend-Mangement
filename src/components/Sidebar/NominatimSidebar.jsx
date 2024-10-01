import React, { useState, useEffect } from "react";
import { TextField, IconButton, Button, Grid } from "@mui/material";
import "./Sidebar.css";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import { useSearch } from "../../context/SearchContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useIncidents } from "../../context/IncidentContext";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const NominatimSidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(""); // Removed suggestions
  const { searchTerm, setSearchTerm } = useSearch();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();
  const { fetchIncidentsOnDate, fetchIncidentsInDateRange } = useIncidents();

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Function to handle searching incidents for today
  const handleTodayIncidents = () => {
    const today = dayjs().toISOString();
    fetchIncidentsOnDate(today);
  };

  // Function to handle searching incidents in a date range
  const handleDateRangeIncidents = () => {
    if (startDate && endDate) {
      fetchIncidentsInDateRange(
        startDate.startOf("day").toISOString(),
        endDate.startOf("day").toISOString()
      );
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchTerm(localSearchTerm);
    navigate("/");
  };

  return (
    <div className="container">
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="top_section">
          <h1 className={`logo  ${isOpen ? "open" : "closed"}`}>
            Incident Alert
          </h1>
          <div className={`bars ${isOpen ? "visible" : "hidden"}`}>
            <IconButton onClick={toggleSidebar}>
              <MenuIcon />
            </IconButton>
          </div>
        </div>

        {/* Search Box without Suggestions */}
        <div className={`menuItems ${isOpen ? "visible" : "hidden"}`}>
          <div className="searchBox" style={{ marginBottom: "20px" }}>
            <TextField
              variant="outlined"
              placeholder="Search..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
              sx={{ width: "100%" }}
            />
          </div>

          {/* Button for today's incidents */}
          <Button
            onClick={handleTodayIncidents}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            Get Today's Incidents
          </Button>

          {/* Date Range Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
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
          <IconButton onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
};

export default NominatimSidebar;
