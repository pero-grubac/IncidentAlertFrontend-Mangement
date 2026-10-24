import { useRef } from "react";
import { Box, ButtonBase, Paper } from "@mui/material";
import { SHEET_STEPS, sheetHeight } from "../lib/sheet";

/**
 * A panel docked to the bottom of the screen on phones. Drag the handle up or down
 * (or tap it) to move between a peek, half the screen and almost the whole screen.
 */
export default function BottomSheet({ step, onStepChange, expandLabel, collapseLabel, header, children }) {
  const start = useRef(null);
  const index = SHEET_STEPS.indexOf(step);

  const move = (delta) => onStepChange(SHEET_STEPS[Math.max(0, Math.min(SHEET_STEPS.length - 1, index + delta))]);
  const cycle = () => onStepChange(index === SHEET_STEPS.length - 1 ? "peek" : SHEET_STEPS[index + 1]);

  return (
    <Paper
      elevation={8}
      data-testid="bottom-sheet"
      data-step={step}
      sx={(theme) => ({
        position: "absolute",
        zIndex: 1000,
        left: 0,
        right: 0,
        bottom: 0,
        height: sheetHeight(step),
        borderRadius: "20px 20px 0 0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: theme.palette.surface.glass,
        backdropFilter: "blur(12px)",
        borderTop: `1px solid ${theme.palette.divider}`,
        transition: "height .28s cubic-bezier(0.2, 0.7, 0.2, 1)",
        paddingBottom: "env(safe-area-inset-bottom)",
      })}
    >
      <ButtonBase
        onClick={cycle}
        onTouchStart={(e) => (start.current = e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (start.current == null) return;
          const delta = e.changedTouches[0].clientY - start.current;
          start.current = null;
          if (Math.abs(delta) > 32) move(delta < 0 ? 1 : -1);
        }}
        aria-label={index === SHEET_STEPS.length - 1 ? collapseLabel : expandLabel}
        aria-expanded={step !== "peek"}
        sx={{ width: "100%", py: 1.25, flexShrink: 0, touchAction: "none" }}
      >
        <Box sx={{ width: 40, height: 5, borderRadius: 3, bgcolor: "text.disabled" }} />
      </ButtonBase>
      {header}
      <Box sx={{ flexGrow: 1, overflowY: step === "peek" ? "hidden" : "auto", minHeight: 0 }}>{children}</Box>
    </Paper>
  );
}
