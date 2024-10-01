import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Typography,
  LinearProgress,  IconButton,

} from "@mui/material";

import { useParams } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete"; 
const AddIncidentDialog = ({
  open,
  onClose,
  newIncidentText,
  setNewIncidentText,
  newIncidentTitle,
  setNewIncidentTitle,
  selectedCategories,
  setSelectedCategories,
  categories,
  onAddIncident,
  newIncidentDateTime,
  setNewIncidentDateTime,
  selectedImages,
  setSelectedImages,
}) => {
  const { locationName } = useParams();
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleCategoryChange = (event) => {
    setSelectedCategories(event.target.value);

  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const previews = [];
    const progress = {};
    const errors = {};
  
    files.forEach((file, index) => {
      if (file.size > 2 * 1024 * 1024) {
        errors[index] = "Image is too large (max 2MB).";
      } else {
        const previewUrl = URL.createObjectURL(file);
        previews.push({ file, previewUrl });
  
        progress[index] = 0;
        setUploadProgress((prev) => ({ ...prev, [index]: 0 })); // Initialize progress to 0
  
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prevProgress) => {
            const newProgress = prevProgress[index] + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...prevProgress, [index]: 100 };
            }
            return { ...prevProgress, [index]: newProgress };
          });
        }, 200);
      }
    });
  
    setUploadError(errors);
    setImagePreviews(previews);
    setSelectedImages(files);
  };
  const handleRemoveImage = (index) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    const updatedFiles = selectedImages.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    setSelectedImages(updatedFiles);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: 2,
          height: "550px",
        }}
      >
        {/* Title Section */}
        <Box
          sx={{
            flex: "1",
            marginBottom: 2,
          }}
        >
          <TextField
            fullWidth
            label="Incident Title"
            multiline
            minRows={1}
            maxRows={1}
            value={newIncidentTitle}
            onChange={(e) => setNewIncidentTitle(e.target.value)}
          />
        </Box>
        {/* Text Section */}
        <Box
          sx={{
            flex: "1",
            marginBottom: 2,
          }}
        >
          <TextField
            fullWidth
            label="Incident Text"
            multiline
            minRows={8}
            maxRows={8}
            value={newIncidentText}
            onChange={(e) => setNewIncidentText(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                height: "100%",
                minHeight: "150px",
              },
              "& .MuiFormControl-root": {
                margin: 0,
                padding: 0,
              },
            }}
          />
        </Box>

        {/* Location Section */}
        <Box
          sx={{
            padding: 2,

            border: "1px solid #ddd", // Add border around the box
            borderRadius: 1, // Optional: to add rounded corners
            marginBottom: 2,
          }}
        >
          <Typography variant="body2">Location: {locationName}</Typography>
        </Box>

        {/* Category Section */}
        <Box sx={{ marginBottom: 2 }}>
          <FormControl fullWidth size="small">
            <Select
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Typography key={value}>{value}</Typography>
                  ))}
                </Box>
              )}
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Select Categories</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  <Checkbox
                    checked={selectedCategories
                      .map((cat) => cat.name)
                      .includes(category.name)}
                  />
                  <ListItemText primary={category.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          {imagePreviews.map((preview, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
              <img
                src={preview.previewUrl}
                alt="Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  marginRight: "10px",
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">{preview.file.name}</Typography>
                {uploadError[index] ? (
                  <Typography color="error">{uploadError[index]}</Typography>
                ) : (
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress[index] || 0}
                    sx={{ marginTop: 1 }}
                  />
                )}
              </Box>
              <IconButton onClick={() => handleRemoveImage(index)} aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        {/* DateTime Section and Add Button Side by Side */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2px", // Adjust the padding here
            marginBottom: 1,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ flex: 1, marginRight: 1 }}>
              <DateTimePicker
                label="Incident Date and Time"
                value={newIncidentDateTime || dayjs()}
                onChange={(newValue) => setNewIncidentDateTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>
          
          <Button
            variant="contained"
            component="label"
            color="primary"
            sx={{ marginRight: 2 }} // Add some space between buttons
          >
            Add Images
            <input
              type="file"
              hidden
              accept="image/onm image/jpg"
              multiple
              onChange={handleImageUpload}
            />
          </Button>
          <Button variant="contained" color="primary" onClick={onAddIncident}>
            Add Incident
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncidentDialog;
