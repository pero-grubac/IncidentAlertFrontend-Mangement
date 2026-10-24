import { useCallback, useEffect, useState } from "react";
import { Box, Dialog, IconButton, Stack, Typography } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useT } from "../i18n";

const arrow = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  bgcolor: "rgba(15, 23, 42, 0.55)",
  color: "#fff",
  backdropFilter: "blur(4px)",
  "&:hover": { bgcolor: "rgba(15, 23, 42, 0.75)" },
};

function Arrows({ count, onPrevious, onNext, size = "medium" }) {
  const t = useT();
  if (count < 2) return null;
  return (
    <>
      <IconButton size={size} aria-label={t("gallery.previous")} onClick={onPrevious} sx={{ ...arrow, left: 12 }}>
        <ChevronLeftRoundedIcon />
      </IconButton>
      <IconButton size={size} aria-label={t("gallery.next")} onClick={onNext} sx={{ ...arrow, right: 12 }}>
        <ChevronRightRoundedIcon />
      </IconButton>
    </>
  );
}

function Counter({ current, total }) {
  const t = useT();
  if (total < 2) return null;
  return (
    <Typography
      variant="caption"
      sx={{ position: "absolute", left: 12, bottom: 12, px: 1, py: 0.25, borderRadius: 2, bgcolor: "rgba(15,23,42,.65)", color: "#fff", fontWeight: 700 }}
    >
      {t("gallery.counter", { n: current + 1, total })}
    </Typography>
  );
}

/** Incident photos: a large photo with arrows and thumbnails, and a full-screen view (← → to browse, Esc to close). */
export default function Gallery({ images, title, height = 280 }) {
  const t = useT();
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const count = images?.length ?? 0;

  useEffect(() => setCurrent(0), [images]);

  const previous = useCallback(() => setCurrent((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % count), [count]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") previous();
    if (event.key === "ArrowRight") next();
  };

  if (!count) return null;

  return (
    <Box onKeyDown={onKeyDown}>
      <Box sx={{ position: "relative", bgcolor: "#0F172A" }}>
        <Box
          component="button"
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={t("gallery.open")}
          sx={{ display: "block", width: "100%", p: 0, border: 0, cursor: "zoom-in", bgcolor: "transparent" }}
        >
          <Box
            component="img"
            key={images[current]}
            src={images[current]}
            alt={t("gallery.alt", { title, n: current + 1 })}
            className="ia-fade"
            sx={{ display: "block", width: "100%", height, objectFit: "cover" }}
          />
        </Box>
        <Arrows count={count} onPrevious={previous} onNext={next} size="small" />
        <Counter current={current} total={count} />
      </Box>

      {count > 1 && (
        <Stack direction="row" spacing={1} sx={{ px: 3, pt: 1.5, overflowX: "auto" }}>
          {images.map((src, i) => (
            <Box
              key={src}
              component="button"
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={t("gallery.show", { n: i + 1 })}
              aria-current={i === current ? "true" : undefined}
              sx={{
                p: 0,
                border: 2,
                borderColor: i === current ? "primary.main" : "transparent",
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                flexShrink: 0,
                opacity: i === current ? 1 : 0.7,
                transition: "opacity .15s",
                "&:hover": { opacity: 1 },
              }}
            >
              <Box component="img" src={src} alt="" sx={{ display: "block", width: 64, height: 48, objectFit: "cover" }} />
            </Box>
          ))}
        </Stack>
      )}

      <Dialog
        open={zoomed}
        onClose={() => setZoomed(false)}
        maxWidth="lg"
        // Key presses inside the dialog bubble (through the React tree) to the handler on the gallery.
        slotProps={{ paper: { sx: { bgcolor: "transparent", boxShadow: "none", overflow: "visible", position: "relative" } } }}
      >
        <Box
          component="img"
          src={images[current]}
          alt={t("gallery.full", { title })}
          sx={{ display: "block", maxWidth: "100%", maxHeight: "86vh", borderRadius: 3 }}
        />
        <Arrows count={count} onPrevious={previous} onNext={next} />
        <Counter current={current} total={count} />
        <IconButton aria-label={t("common.close")} onClick={() => setZoomed(false)} sx={{ ...arrow, top: 12, right: 12, transform: "none" }}>
          <CloseRoundedIcon />
        </IconButton>
      </Dialog>
    </Box>
  );
}
