import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  FormControl,
  MenuItem,
  Select,
  TextField,
  Grid,
  Box,
  Button,
} from "@mui/material";

const FilterSection = ({
  dateFilterStart,
  setDateFilterStart,
  dateFilterEnd,
  setDateFilterEnd,
  categoryFilter,
  setCategoryFilter,
  categories,
  onAddClick,
}) => {
  return (
    <Box sx={{ padding: 2, display: "flex", alignItems: "center", gap: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={2} sx={{ width: "100%" }}>
          <Grid item xs={12} sm={4} md={3}>
            <DatePicker
              label="Start Date"
              value={dateFilterStart}
              onChange={(newValue) => setDateFilterStart(newValue)}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <DatePicker
              label="End Date"
              value={dateFilterEnd}
              onChange={(newValue) => setDateFilterEnd(newValue)}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={6}>
            <FormControl fullWidth size="small">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                displayEmpty
                sx={{ width: "100%", marginTop: 1, marginBottom: 1 }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </LocalizationProvider>
      <Button
        variant="contained"
        color="primary"
        onClick={onAddClick}
        sx={{ height: "fit-content" }}
      >
        Add
      </Button>
    </Box>
  );
};

export default FilterSection;
