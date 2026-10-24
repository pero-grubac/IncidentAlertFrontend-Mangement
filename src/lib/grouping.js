/** One marker per place: incidents are grouped by their location name. */
export function groupByLocation(incidents) {
  const groups = new Map();
  for (const incident of incidents) {
    const location = incident.location;
    if (!location) continue;
    const key = location.name;
    if (!groups.has(key)) groups.set(key, { location, incidents: [] });
    groups.get(key).incidents.push(incident);
  }
  for (const group of groups.values()) {
    group.incidents.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  }
  return [...groups.values()];
}
