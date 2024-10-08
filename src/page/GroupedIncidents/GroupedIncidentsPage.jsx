import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { getGroupedIncidents } from "../../service/ml.service";
import SimpleIncidentCard from "../../components/SimpleIncidentCard/SimpleIncidentCard";
const GroupedIncidentsPage = () => {
  const [groupedIncidents, setGroupedIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroupedIncidents();
  }, []);

  const fetchGroupedIncidents = async () => {
    try {
      const result = await getGroupedIncidents();
      setGroupedIncidents(result.data);
    } catch (error) {
      console.error("Failed to fetch grouped incidents", error);
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <Box sx={{ padding: 3, height: '100vh', overflowY: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Grouped Incidents
      </Typography>
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
        <Box>
          {groupedIncidents.map((group) => (
            <Box
              key={group.groupKey}
              sx={{
                mb: 3,
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h6" color="primary">
                {group.groupKey}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 2,
                  mt: 2,
                }}
              >
                {group.incidents.map((incident) => (
                  <SimpleIncidentCard key={incident.id} incident={incident} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
export default GroupedIncidentsPage;
