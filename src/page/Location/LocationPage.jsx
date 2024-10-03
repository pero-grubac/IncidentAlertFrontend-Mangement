import React, { useState, useEffect } from "react";
import FilterSection from "../../components/FilterSection/FilterSection";
import IncidentCard from "../../components/IncidentCard/IncidentCard";
import IncidentDetailsDialog from "../../components/IncidentDetailsDialog/IncidentDetailsDialog";
import { Box, Grid, CircularProgress } from "@mui/material";
import { getIncidentsByLocationName } from "../../service/incident.service";
import { getStatusList } from "../../service/status.service";
import { useParams } from "react-router-dom";
import { getCategories } from "../../service/category.service";
import { Snackbar, Alert } from "@mui/material";
import enviroments from "../../Enviroments";
import axios from "axios";

const GOOGLE_API_KEY = enviroments().REACT_APP_GOOGLE_API_KEY;

const LocationPage = ({ locationId }) => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dateFilterStart, setDateFilterStart] = useState(null);
  const [dateFilterEnd, setDateFilterEnd] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { locationName } = useParams();
  const TRANSLATE_URL =
    "https://translation.googleapis.com/language/translate/v2";

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  useEffect(() => {
    // Fetch incidents and categories
    const fetchIncidents = async () => {
      try {
        const response = await getIncidentsByLocationName(locationName);
        const data = response.data;
        setIncidents(data);
      } catch (error) {
        console.error("Failed to fetch incidents", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const data = response.data;
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    const fetchStatusList = async () => {
      try {
        const response = await getStatusList();
        const data = response.data;
        setStatusList(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchIncidents();
    fetchCategories();
    fetchStatusList();
  }, [locationName]);

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
  };

  return (
    <Box>
      <h1>Location: {locationName}</h1>
      <FilterSection
        dateFilterStart={dateFilterStart}
        setDateFilterStart={setDateFilterStart}
        dateFilterEnd={dateFilterEnd}
        setDateFilterEnd={setDateFilterEnd}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        statusList={statusList}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <Grid container spacing={2}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          incidents
            .filter((incident) => {
              const matchesDate =
                (!dateFilterStart ||
                  new Date(incident.dateTime) >= new Date(dateFilterStart)) &&
                (!dateFilterEnd ||
                  new Date(incident.dateTime) <= new Date(dateFilterEnd));
              const matchesCategory =
                !categoryFilter ||
                incident.categories.some((cat) => cat.name === categoryFilter);
              return matchesDate && matchesCategory;
            })
            .map((incident) => (
              <Grid item xs={12} sm={6} md={4} key={incident.id}>
                <IncidentCard
                  incident={incident}
                  onClick={() => handleIncidentClick(incident)}
                />
              </Grid>
            ))
        )}
      </Grid>

      <IncidentDetailsDialog
        open={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        incident={selectedIncident}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LocationPage;
