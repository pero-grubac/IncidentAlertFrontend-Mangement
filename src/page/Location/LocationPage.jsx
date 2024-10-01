import React, { useState, useEffect } from "react";
import FilterSection from "../../components/FilterSection/FilterSection";
import IncidentCard from "../../components/IncidentCard/IncidentCard";
import IncidentDetailsDialog from "../../components/IncidentDetailsDialog/IncidentDetailsDialog";
import AddIncidentDialog from "../../components/AddIncidentDialog/AddIncidentDialog";
import { Box, Grid, CircularProgress } from "@mui/material";
import {
  getIncidentsByLocationName,
  createIncident,
} from "../../service/incident.service";
import { useParams } from "react-router-dom";
import { getCategories } from "../../service/category.service";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [newIncidentText, setNewIncidentText] = useState("");
  const [newIncidentTitle, setNewIncidentTitle] = useState("");
  const [newIncidentDateTime, setNewIncidentDateTime] = useState(dayjs());
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { locationName } = useParams();
  const location = useLocation();
  const locationData = location.state?.location;
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

    fetchIncidents();
    fetchCategories();
  }, [locationName]);
  const translateText = async (text, targetLanguage, cancelToken) => {
    try {
      const response = await axios.post(
        TRANSLATE_URL,
        {
          q: text,
          target: targetLanguage,
          format: "text",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            key: GOOGLE_API_KEY,
          },
          cancelToken,
        }
      );

      return response.data.data.translations[0].translatedText;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Translation request canceled:", error.message);
      } else {
        console.error("Translation error:", error);
      }
      return text;
    }
  };
  const handleAddIncident = async () => {
    if (
      !newIncidentTitle ||
      !newIncidentText ||
      !newIncidentDateTime ||
      selectedCategories.length === 0
    ) {
      setSnackbarMessage(
        "Please fill in all fields before adding the incident."
      );
      setOpenSnackbar(true);
      return;
    }
    // translate title and date
    const cancelTokenSource = axios.CancelToken.source(); // Create a new cancel token
    const translatedTitle = await translateText(
      newIncidentTitle,
      "sr",
      cancelTokenSource.token
    );
    const translatedText = await translateText(
      newIncidentText,
      "sr",
      cancelTokenSource.token
    );
    const formData = new FormData();
    // const filesArray = Array.from(selectedImages);
    // Append incident data
    formData.append("title", translatedTitle);
    formData.append("text", translatedText);
    formData.append("dateTime", newIncidentDateTime.toISOString());
    formData.append("location.id", locationData.id);
    formData.append("location.latitude", locationData.latitude);
    formData.append("location.longitude", locationData.longitude);
    formData.append("location.name", locationData.name);
    //  formData.append("categories", selectedCategories);
    console.log(newIncidentDateTime.toISOString());
    for (let i = 0; i < selectedCategories.length; i++) {
      formData.append(`categories`, selectedCategories[i]);
    }
    for (let i = 0; i < selectedImages.length; i++) {
      formData.append(`images`, selectedImages[i]);
    }

    try {
      await createIncident(formData);
      setSnackbarMessage("Incident added successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.log(error.response || error.message);
      setSnackbarMessage("Failed to add incident");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
    setNewIncidentText("");
    setNewIncidentTitle("");
    // setNewIncidentDateTime("");
    setSelectedCategories([]);
    setSelectedImages([]);

    setIsAddIncidentOpen(false);
  };
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
        onAddClick={() => setIsAddIncidentOpen(true)}
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

      <AddIncidentDialog
        open={isAddIncidentOpen}
        onClose={() => setIsAddIncidentOpen(false)}
        newIncidentText={newIncidentText}
        setNewIncidentText={setNewIncidentText}
        newIncidentTitle={newIncidentTitle}
        setNewIncidentTitle={setNewIncidentTitle}
        newIncidentDateTime={newIncidentDateTime}
        setNewIncidentDateTime={setNewIncidentDateTime}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={categories}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        onAddIncident={handleAddIncident}
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
