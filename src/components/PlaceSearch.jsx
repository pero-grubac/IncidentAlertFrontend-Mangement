import { useEffect, useState } from "react";
import { Autocomplete, Box, CircularProgress, InputAdornment, TextField, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { searchPlaces } from "../lib/geocoding";
import { useT } from "../i18n";

/** Address search with suggestions from OpenStreetMap. */
export default function PlaceSearch({ onSelect, debounce = 350 }) {
  const t = useT();
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (input.trim().length < 3) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    // Show "Searching…" straight away instead of "No places found" while the debounce runs.
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        setOptions(await searchPlaces(input, controller.signal));
      } catch (error) {
        if (error.name !== "AbortError") setOptions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, debounce);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [input, debounce]);

  return (
    <Autocomplete
      options={options}
      filterOptions={(x) => x}
      forcePopupIcon={false}
      getOptionLabel={(option) => option.name ?? ""}
      isOptionEqualToValue={(a, b) => a.description === b.description}
      loading={loading}
      loadingText={t("search.searching")}
      noOptionsText={input.trim().length < 3 ? t("search.tooShort") : t("search.none")}
      inputValue={input}
      onInputChange={(_e, value) => setInput(value)}
      onChange={(_e, value) => value && onSelect(value)}
      renderOption={({ key, ...props }, option) => (
        <Box component="li" key={key} {...props} sx={{ gap: 1.5, alignItems: "flex-start !important" }}>
          <PlaceOutlinedIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }} noWrap>
              {option.description}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={t("search.placeholder")}
          size="small"
          slotProps={{
            htmlInput: { ...params.inputProps, "aria-label": t("search.label") },
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={16} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
