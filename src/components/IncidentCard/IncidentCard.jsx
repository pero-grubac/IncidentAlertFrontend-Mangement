import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const IncidentCard = ({ incident, onClick }) => {
  return (
    <Card onClick={() => onClick(incident)} style={{ cursor: "pointer" }}>
      <CardContent>
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

        <Typography color="text.secondary">
          {new Date(incident.dateTime).toLocaleString()}
        </Typography>
        <Typography variant="body2">
          Location: {incident.location?.name}
        </Typography>
        <Typography variant="body2">
          Categories: {incident.categories.map((cat) => cat.name).join(", ")}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default IncidentCard;
