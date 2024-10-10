import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  getLocationWithMostIncidents,
  getLocationWithMostIncidentsPerCategory,
  getNumberOfIncidentsPerCategory,
} from "../../service/statistics.service";

const StatisticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [locationIncidents, setLocationIncidents] = useState({});
  const [categoryIncidents, setCategoryIncidents] = useState({});
  const [incidentsPerCategory, setIncidentsPerCategory] = useState({});

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [locationResponse, categoryResponse, incidentsResponse] =
          await Promise.all([
            getLocationWithMostIncidents(),
            getLocationWithMostIncidentsPerCategory(),
            getNumberOfIncidentsPerCategory(),
          ]);
        setLocationIncidents(locationResponse.data);
        setCategoryIncidents(categoryResponse.data);
        setIncidentsPerCategory(incidentsResponse.data || {});
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        paddingBottom: 8,
        overflowY: "auto",
        height: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Incident Statistics
      </Typography>

      {/* Table for Location with Most Incidents */}
      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h6" gutterBottom>
          Location with Most Incidents
        </Typography>
        <TableContainer component={Paper} sx={{ backgroundColor: "#f1f1f1" }}>
          <Table stickyHeader aria-label="location incidents table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#4caf50" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Period</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Incident Count
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(locationIncidents).map((period) => (
                <TableRow
                  key={period}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#fffff" },
                    "&:nth-of-type(even)": { backgroundColor: "#e8f5e9" },
                  }}
                >
                  <TableCell>{period}</TableCell>
                  <TableCell>
                    {locationIncidents[period]?.locationName || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {locationIncidents[period]?.incidentCount || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Table for Location with Most Incidents per Category */}
      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h6" gutterBottom>
          Location with Most Incidents per Category
        </Typography>
        <TableContainer component={Paper} sx={{ backgroundColor: "#f1f1f1" }}>
          <Table stickyHeader aria-label="location category incidents table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#2196f3" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Period</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Incident Count
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(categoryIncidents).map((period) => (
                <TableRow
                  key={period}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#fffff" },
                    "&:nth-of-type(even)": { backgroundColor: "#e3f2fd" },
                  }}
                >
                  <TableCell>{period}</TableCell>
                  <TableCell>
                    {categoryIncidents[period]?.locationName || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {categoryIncidents[period]?.categoryName || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {categoryIncidents[period]?.incidentCount || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Table for Number of Incidents per Category - No Scroll */}
      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h6" gutterBottom>
          Number of Incidents per Category
        </Typography>
        <TableContainer component={Paper} sx={{ backgroundColor: "#f1f1f1" }}>
          <Table stickyHeader aria-label="incidents per category table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#ff9800" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Period</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Incident Count
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(incidentsPerCategory).map((period) =>
                incidentsPerCategory[period]?.length > 0 ? (
                  incidentsPerCategory[period].map((category, index) => (
                    <TableRow
                      key={`${period}-${index}`}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#fffff" },
                        "&:nth-of-type(even)": { backgroundColor: "#fff3e0" },
                      }}
                    >
                      <TableCell>{period}</TableCell>
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell>{category.incidentCount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key={`${period}-empty`}>
                    <TableCell>{period}</TableCell>
                    <TableCell colSpan={2}>
                      No incidents found for this period.
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ marginTop: 10 }}></Box>
    </Box>
  );
};

export default StatisticsPage;
