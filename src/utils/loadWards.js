// Utility to load ward data
import wardsData from "../data/delhi_wards.geojson";

export function loadWards() {
  // In production, this could fetch from an API
  return wardsData;
}

export default wardsData;

