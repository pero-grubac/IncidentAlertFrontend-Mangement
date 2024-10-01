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
} from "@mui/material";
import axios from "axios";
import enviroments from "../../Enviroments";
import ReactCountryFlag from "react-country-flag";

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

const IncidentDetailsDialog = ({ open, onClose, incident }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [language, setLanguage] = useState("sr");
  const [translatedTitle, setTranslatedTitle] = useState(incident?.title);
  const [translatedText, setTranslatedText] = useState(incident?.text);
  const [loading, setLoading] = useState(false);
  const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

  // Handle image click to preview
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Handle closing image preview
  const handleCloseImagePreview = () => {
    setSelectedImage(null);
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
    const translatedTitle = await translateText(incident?.title, langCode, cancelTokenSource.token);
    const translatedText = await translateText(incident?.text, langCode, cancelTokenSource.token);
    setTranslatedTitle(translatedTitle);
    setTranslatedText(translatedText);
  };

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source(); // Create a cancel token

    const initialTranslation = async () => {
      if (language !== "sr") {
        const translatedTitle = await translateText(incident?.title, language, cancelTokenSource.token);
        const translatedText = await translateText(incident?.text, language, cancelTokenSource.token);
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
      cancelTokenSource.cancel("Translation request canceled on component unmount.");
    };
  }, [language, incident?.title, incident?.text]);

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
            <Typography color="text.secondary">
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
            <Typography variant="body2">
              Location: {incident?.location?.name}
            </Typography>
          </Box>

          {/* Categories Section */}
          <Box
            sx={{
              padding: 2,
              overflowY: "auto",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            <Typography variant="body2">
              Categories: {incident?.categories.map((cat) => cat.name).join(", ")}
            </Typography>
          </Box>

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

            <Button variant="contained" onClick={onClose} sx={{ height: "40px" }}>
              Close
            </Button>
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
