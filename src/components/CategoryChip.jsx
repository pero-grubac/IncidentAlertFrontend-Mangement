import { Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { categoryLabel, categoryStyle, categoryTextColor } from "../lib/categories";
import { useI18n } from "../i18n";

export default function CategoryChip({ name, size = "small", selected, onClick, variant = "soft" }) {
  const { language } = useI18n();
  const { palette } = useTheme();
  const { color, Icon } = categoryStyle(name);
  const solid = variant === "solid" || selected;
  const text = categoryTextColor(name, palette.mode);
  // A solid chip needs dark text on light category colors (e.g. amber) to stay readable.
  const onSolid = palette.mode === "dark" ? "#0B1120" : "#FFFFFF";
  const solidBackground = palette.mode === "dark" ? color : categoryStyle(name).text;

  return (
    <Chip
      size={size}
      label={categoryLabel(name, language)}
      onClick={onClick}
      icon={<Icon sx={{ fontSize: size === "small" ? 15 : 18, color: `${solid ? onSolid : text} !important` }} />}
      aria-pressed={onClick ? Boolean(selected) : undefined}
      sx={{
        color: solid ? onSolid : text,
        backgroundColor: solid ? solidBackground : alpha(color, palette.mode === "dark" ? 0.16 : 0.1),
        border: `1px solid ${solid ? solidBackground : alpha(color, 0.25)}`,
        "&.MuiChip-clickable:hover": {
          backgroundColor: solid ? alpha(solidBackground, 0.88) : alpha(color, palette.mode === "dark" ? 0.24 : 0.18),
        },
      }}
    />
  );
}
