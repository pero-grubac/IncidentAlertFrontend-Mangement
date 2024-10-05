import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Chip,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import enviroments from "../../Enviroments";
import ReactCountryFlag from "react-country-flag";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const GOOGLE_API_KEY = enviroments().REACT_APP_GOOGLE_API_KEY;

const ImagePreviewDialog = ({ open, onClose, imageUrl }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <img
          src={imageUrl}
          alt="Full-size preview"
          style={{ maxWidth: "100%", maxHeight: "80vh" }}
        />
      </DialogContent>
    </Dialog>
  );
};

const IncidentDetailsDialog = ({
  open,
  onClose,
  incident,
  statusList,
  onStatusChange,
  onAcceptIncident,
  onDeleteIncident,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [language, setLanguage] = useState("sr");
  const [translatedTitle, setTranslatedTitle] = useState(incident?.title);
  const [translatedText, setTranslatedText] = useState(incident?.text);
  const [selectedStatus, setSelectedStatus] = useState(incident?.status);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusName, setStatusName] = useState(incident?.statusName);
  const TRANSLATE_URL =
    "https://translation.googleapis.com/language/translate/v2";

  // Handle image click to preview
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Handle closing image preview
  const handleCloseImagePreview = () => {
    setSelectedImage(null);
  };

  const handleStatusChange = (e) => {
    const newStatusId = e.target.value;
    const selectedStatusObj = statusList.find(
      (status) => status.id === newStatusId
    );
    const newStatusName = selectedStatusObj ? selectedStatusObj.name : "";

    setSelectedStatus(newStatusId);
    setStatusName(newStatusName);
    onStatusChange(newStatusName);
  };

  useEffect(() => {
    if (incident?.status) {
      setSelectedStatus(incident.status);
      setStatusName(incident?.statusName);
    }
  }, [incident?.status, incident?.statusName]);

  const handleAcceptIncident = async (id) => {
    try {
      await onAcceptIncident(id);
      onClose();
    } catch (error) {
      console.error("Error accepting incident:", error);
    }
  };

  const handleDeleteIncident = async (id) => {
    try {
      await onDeleteIncident(id);
      onClose();
    } catch (error) {
      console.error("Error deleting incident:", error);
    }
  };
  // Function to translate text using Google Cloud API
  const translateText = async (text, targetLanguage, cancelToken) => {
    try {
      setLoading(true);

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

      setLoading(false);
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      setLoading(false);
      if (axios.isCancel(error)) {
        console.log("Translation request canceled:", error.message);
      } else {
        console.error("Translation error:", error);
      }
      return text;
    }
  };

  // Handle language change
  const handleLanguageChange = async (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    const langCode = newLang === "sr" ? "sr" : "en";

    const cancelTokenSource = axios.CancelToken.source(); // Create a new cancel token
    const translatedTitle = await translateText(
      incident?.title,
      langCode,
      cancelTokenSource.token
    );
    const translatedText = await translateText(
      incident?.text,
      langCode,
      cancelTokenSource.token
    );
    setTranslatedTitle(translatedTitle);
    setTranslatedText(translatedText);
  };

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source(); // Create a cancel token

    const initialTranslation = async () => {
      if (language !== "sr") {
        const translatedTitle = await translateText(
          incident?.title,
          language,
          cancelTokenSource.token
        );
        const translatedText = await translateText(
          incident?.text,
          language,
          cancelTokenSource.token
        );
        setTranslatedTitle(translatedTitle);
        setTranslatedText(translatedText);
      } else {
        setTranslatedTitle(incident?.title);
        setTranslatedText(incident?.text);
      }
    };

    initialTranslation();

    // Cleanup function to cancel the API request when the component unmounts
    return () => {
      cancelTokenSource.cancel(
        "Translation request canceled on component unmount."
      );
    };
  }, [language, incident?.title, incident?.text]);

  const handleReplaceStatus = () => {
    setShowStatusPopup(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "500px",
            padding: 0,
          }}
        >
          {/* Title Section */}
          <Box
            sx={{
              flex: "0 0 auto",
              padding: 2,
              maxHeight: "100px",
              borderBottom: "1px solid #ddd",
              overflowY: "auto",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            <Typography variant="h6" component="div">
              {loading ? "Translating..." : translatedTitle}
            </Typography>
          </Box>

          {/* Text Section */}
          <Box
            sx={{
              flex: "1",
              padding: 2,
              borderBottom: "1px solid #ddd",
              overflowY: "auto",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {loading ? (
              <Typography variant="h6" component="div">
                Translating...
              </Typography>
            ) : (
              <Typography variant="h6" component="div">
                {translatedText}
              </Typography>
            )}
          </Box>

          {/* Date Section */}
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography color="text.secondary" sx={{ fontWeight: "bold" }}>
              {new Date(incident?.dateTime).toLocaleString()}
            </Typography>
          </Box>

          {/* Location Section */}
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Location: {incident?.location?.name}
            </Typography>
          </Box>

          {/* Categories Section */}
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid #ddd",
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Categories:
            </Typography>
            {incident?.categories.map((cat, index) => (
              <Chip
                key={index}
                label={cat.name}
                sx={{
                  backgroundColor: "#008080", // Teal color
                  color: "#fff",
                }}
              />
            ))}
          </Box>

          {/* Status Section */}
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Status:
            </Typography>
            <Chip
              label={statusName}
              color={statusName === "PENDING" ? "warning" : "success"}
            />

            {/* Replace Status Button */}
            <IconButton
              aria-label="replace-status"
              onClick={handleReplaceStatus}
            >
              <SwapHorizIcon />
            </IconButton>
          </Box>

          {/* Status Replacement Popup */}
          <Dialog
            open={showStatusPopup}
            onClose={() => setShowStatusPopup(false)}
          >
            <DialogContent>
              <FormControl fullWidth>
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  displayEmpty
                >
                  {statusList.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowStatusPopup(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Image Preview Section */}
          {incident?.images && incident.images.length > 0 && (
            <Box
              sx={{
                padding: 2,
                borderTop: "1px solid #ddd",
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "center",
              }}
            >
              {incident.images.map((imageUrl, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  <img
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      cursor: "pointer",
                      borderRadius: 4,
                    }}
                    onClick={() => handleImageClick(imageUrl)} // Click handler for image
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Close and Language Selector Section */}
          <Box
            sx={{
              padding: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Language Selector */}
            <FormControl sx={{ width: "120px" }}>
              <Select
                labelId="language-select-label"
                value={language}
                onChange={handleLanguageChange}
                sx={{
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MenuItem value="sr">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ReactCountryFlag
                      countryCode="RS"
                      svg
                      style={{ width: "20px", marginRight: "8px" }}
                    />
                    SR
                  </Box>
                </MenuItem>
                <MenuItem value="en">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ReactCountryFlag
                      countryCode="US"
                      svg
                      style={{ width: "20px", marginRight: "8px" }}
                    />
                    EN
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <DialogActions>
              {/* Close,Delete and Accept buttons */}
              <Button
                variant="contained"
                onClick={() => handleAcceptIncident(incident?.id)}
                color="success"
                sx={{ height: "40px" }}
              >
                Accept
              </Button>
              <Button
                variant="contained"
                onClick={() => handleDeleteIncident(incident?.id)}
                color="error"
                sx={{ height: "40px" }}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onClose}
                sx={{ height: "40px" }}
              >
                Close
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {selectedImage && (
        <ImagePreviewDialog
          open={!!selectedImage}
          onClose={handleCloseImagePreview}
          imageUrl={selectedImage}
        />
      )}
    </>
  );
};

export default IncidentDetailsDialog;
