// Place search and reverse geocoding through OpenStreetMap's Nominatim (no API key needed).
const NOMINATIM = "https://nominatim.openstreetmap.org";

/** A short, readable name such as "Kralja Petra I 12, Banja Luka". */
export function placeName(result) {
  const address = result.address ?? {};
  const street = [address.road ?? address.pedestrian ?? address.square, address.house_number]
    .filter(Boolean)
    .join(" ");
  const local = result.name || street || address.neighbourhood || address.suburb;
  const city = address.city ?? address.town ?? address.village ?? address.municipality ?? address.county;
  const parts = [local, city].filter(Boolean);
  const unique = parts.filter((part, i) => parts.indexOf(part) === i);
  return unique.length ? unique.join(", ") : result.display_name;
}

function toPlace(result) {
  return {
    name: placeName(result),
    description: result.display_name,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
}

async function nominatim(path, params, signal) {
  const query = new URLSearchParams({ format: "jsonv2", addressdetails: "1", "accept-language": "en", ...params });
  const response = await fetch(`${NOMINATIM}/${path}?${query}`, { signal });
  if (!response.ok) throw new Error(`Nominatim responded with ${response.status}`);
  return response.json();
}

export async function searchPlaces(text, signal) {
  if (!text?.trim()) return [];
  const results = await nominatim("search", { q: text.trim(), limit: "5" }, signal);
  return results.map(toPlace);
}

export async function reverseGeocode(latitude, longitude, signal) {
  const fallback = {
    name: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    description: "",
    latitude,
    longitude,
  };
  try {
    const result = await nominatim("reverse", { lat: String(latitude), lon: String(longitude), zoom: "18" }, signal);
    return result?.display_name ? { ...toPlace(result), latitude, longitude } : fallback;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return fallback;
  }
}
