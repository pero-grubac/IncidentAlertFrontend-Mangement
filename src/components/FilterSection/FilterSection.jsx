import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FormControl, MenuItem, Select, TextField, Box } from "@mui/material";

const FilterSection = ({
  dateFilterStart,
  setDateFilterStart,
  dateFilterEnd,
  setDateFilterEnd,
  categoryFilter,
  setCategoryFilter,
  categories,
  statusList,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        gap: 2,
        flexWrap: "wrap", // To ensure responsiveness if the screen is too small
        alignItems: "center",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Start Date Filter */}
        <Box sx={{ flex: 1, minWidth: "200px" }}>
          <DatePicker
            label="Start Date"
            value={dateFilterStart}
            onChange={(newValue) => setDateFilterStart(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" fullWidth />
            )}
          />
        </Box>

        {/* End Date Filter */}
        <Box sx={{ flex: 1, minWidth: "200px" }}>
          <DatePicker
            label="End Date"
            value={dateFilterEnd}
            onChange={(newValue) => setDateFilterEnd(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" fullWidth />
            )}
          />
        </Box>

        {/* Category Filter */}
        <Box sx={{ flex: 1, minWidth: "200px" }}>
          <FormControl fullWidth size="small">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Status Filter */}
        <Box sx={{ flex: 1, minWidth: "200px" }}>
          <FormControl fullWidth size="small">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {statusList.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default FilterSection;
