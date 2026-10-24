import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export default function EmptyState({ title, description, icon: Icon = InboxOutlinedIcon, action, compact }) {
  return (
    <Stack alignItems="center" textAlign="center" spacing={1} className="ia-rise" sx={{ py: compact ? 3 : 8, px: 2 }}>
      <Box
        sx={(theme) => ({
          width: 52,
          height: 52,
          borderRadius: 3,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: "primary.main",
          mb: 0.5,
        })}
      >
        <Icon />
      </Box>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" maxWidth={360}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}
