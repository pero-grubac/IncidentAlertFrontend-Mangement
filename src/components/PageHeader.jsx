import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "flex-end" }} sx={{ mb: 4 }}>
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography variant="overline" color="primary">
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4" component="h1" sx={{ wordBreak: "break-word" }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
    </Stack>
  );
}
