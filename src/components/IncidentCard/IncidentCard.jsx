import React from "react";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";

const IncidentCard = ({ incident, onClick }) => {
  return (
    <Card onClick={() => onClick(incident)} style={{ cursor: "pointer" }}>
      <CardContent>
        {/* Title */}
        <Typography
          variant="h5"
          component="div"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 1,
          }}
        >
          {incident.title}
        </Typography>

        {/* Date */}
        <Typography color="text.secondary">
          {new Date(incident.dateTime).toLocaleString()}
        </Typography>

        {/* Location */}
        <Typography variant="body2">
          Location: {incident.location?.name}
        </Typography>

        {/* Categories */}
        <Typography variant="body2">
          Categories: {incident.categories.map((cat) => cat.name).join(", ")}
        </Typography>

        {/* Status Tag */}
        <Chip
          label={incident.statusName} // Display the status name
          color={incident.statusName === "PENDING" ? "warning" : "success"} // Dynamic color
          size="small"
        />
      </CardContent>
    </Card>
  );
};

export default IncidentCard;
