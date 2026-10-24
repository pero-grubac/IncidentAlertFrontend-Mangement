import { useState } from "react";
import { Button, Collapse, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { RANGES, rangeFor } from "../lib/dates";
import { useT } from "../i18n";

/** Quick periods (today, 7 days, …) plus a custom from–to range. */
export default function RangeFilter({ value, onChange }) {
  const t = useT();
  const [custom, setCustom] = useState({ start: value.start, end: value.end });
  const showCustom = value.key === "custom" || custom.open;

  const pick = (_event, key) => {
    if (!key) return;
    if (key === "custom") {
      setCustom((c) => ({ ...c, open: true }));
      return;
    }
    setCustom((c) => ({ ...c, open: false }));
    const { days } = RANGES.find((r) => r.key === key);
    if (days === null) {
      onChange(key, null, null);
      return;
    }
    const { start, end } = rangeFor(days);
    onChange(key, start, end);
  };

  const valid = custom.start && custom.end && !custom.end.isBefore(custom.start, "day");

  return (
    <Stack spacing={1.5}>
      <ToggleButtonGroup exclusive fullWidth size="small" value={showCustom ? "custom" : value.key} onChange={pick} aria-label={t("periods.label")}>
        {RANGES.map((r) => (
          <ToggleButton key={r.key} value={r.key}>
            {t(`periods.${r.key}`)}
          </ToggleButton>
        ))}
        <ToggleButton value="custom">{t("periods.custom")}</ToggleButton>
      </ToggleButtonGroup>

      <Collapse in={showCustom} unmountOnExit>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1}>
            <DatePicker
              label={t("common.from")}
              value={custom.start}
              onChange={(start) => setCustom((c) => ({ ...c, start }))}
              disableFuture
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
            <DatePicker
              label={t("common.to")}
              value={custom.end}
              onChange={(end) => setCustom((c) => ({ ...c, end }))}
              disableFuture
              minDate={custom.start ?? undefined}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Stack>
          <Button variant="outlined" disabled={!valid} onClick={() => onChange("custom", custom.start, custom.end)}>
            {t("periods.show")}
          </Button>
        </Stack>
      </Collapse>
    </Stack>
  );
}
