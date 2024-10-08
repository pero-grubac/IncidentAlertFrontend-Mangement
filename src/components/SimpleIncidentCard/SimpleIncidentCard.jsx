import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const SimpleIncidentCard = ({ incident }) => {
  return (
    <Card sx={{ width: '100%', maxWidth: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '0 0 auto' }}>
        {/* Title */}
        <Typography variant="h5" component="div" gutterBottom>
          {incident.title}
        </Typography>

        {/* Date */}
        <Typography color="text.secondary">
          {new Date(incident.dateTime).toLocaleString()}
        </Typography>

        {/* Location */}
        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
          Location: {incident.location?.name}
        </Typography>
      </CardContent>

      {/* Scrollable Text Section */}
      <Box sx={{ flex: '1 1 auto', overflowY: 'auto', p: 2, maxHeight: 150 }}>
        <Typography variant="body2">
          {incident.text}
        </Typography>
      </Box>
    </Card>
  );
};

export default SimpleIncidentCard;
