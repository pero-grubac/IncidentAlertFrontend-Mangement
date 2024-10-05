import React, { useState, useEffect } from "react";
import FilterSection from "../../components/FilterSection/FilterSection";
import IncidentCard from "../../components/IncidentCard/IncidentCard";
import IncidentDetailsDialog from "../../components/IncidentDetailsDialog/IncidentDetailsDialog";
import { Box, CircularProgress } from "@mui/material";
import {
  getIncidentsByLocationName,
  acceptIncident,
  deleteIncident,
  changeStatus,
} from "../../service/incident.service";
import { getStatusList } from "../../service/status.service";
import { useParams } from "react-router-dom";
import { getCategories } from "../../service/category.service";
import { Snackbar, Alert } from "@mui/material";
import enviroments from "../../Enviroments";

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
  const onStatusChange = async (newStatus) => {
    try {
      const response = await changeStatus(selectedIncident.id, newStatus);
      if (response.status === 200) {
        const updatedIncident = response.data;
        setIncidents((prevIncidents) =>
          prevIncidents.map((incident) =>
            incident.id === updatedIncident.id ? updatedIncident : incident
          )
        );
        showMessage("Status updated successfully.", "success");
      } else {
        showMessage("Something went wrong.", "error");
      }
    } catch (error) {
      showMessage("Something went wrong.", "error");
    }
  };
  const onAcceptIncident = async (id) => {
    try {
      const response = await acceptIncident(id);
      if (response.status === 200) {
        setIncidents((prevIncidents) =>
          prevIncidents.filter((incident) => incident.id !== id)
        );
        showMessage("Incident accepted successfully.", "success");
        setSelectedIncident(null);
      } else {
        showMessage("Something went wrong.", "error");
      }
    } catch (error) {
      showMessage("Something went wrong.", "error");
    }
  };
  const onDeleteIncident = async (id) => {
    try {
      const response = await deleteIncident(id);
      if (response.status === 200) {
        setIncidents((prevIncidents) =>
          prevIncidents.filter((incident) => incident.id !== id)
        );
        setSelectedIncident(null);
        showMessage("Incident deleted successfully.", "success");
      } else {
        showMessage("Something went wrong.", "error");
      }
    } catch (error) {
      showMessage("Something went wrong.", "error");
    }
  };
  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  const showMessage = (msg, type) => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(type);
    setOpenSnackbar(true);
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

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2, // Add some spacing between the incident cards
            padding: 2,
          }}
        >
          {incidents
            .filter((incident) => {
              const matchesDate =
                (!dateFilterStart ||
                  new Date(incident.dateTime) >= new Date(dateFilterStart)) &&
                (!dateFilterEnd ||
                  new Date(incident.dateTime) <= new Date(dateFilterEnd));
              const matchesCategory =
                !categoryFilter ||
                incident.categories.some((cat) => cat.name === categoryFilter);
              const matchesStatus =
                !statusFilter || incident.status === statusFilter;
              return matchesDate && matchesCategory && matchesStatus;
            })
            .map((incident) => (
              <Box
                key={incident.id}
                sx={{ flexBasis: "30%", minWidth: "280px" }}
              >
                <IncidentCard
                  incident={incident}
                  onClick={() => handleIncidentClick(incident)}
                />
              </Box>
            ))}
        </Box>
      )}

      <IncidentDetailsDialog
        open={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        incident={selectedIncident}
        statusList={statusList}
        onStatusChange={onStatusChange}
        onAcceptIncident={onAcceptIncident}
        onDeleteIncident={onDeleteIncident}
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
