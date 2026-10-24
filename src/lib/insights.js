// Small helpers that turn the ML and Statistics responses into what the pages show.

const STOP_WORDS = new Set(
  `the a an and or of in on at to for from with near due over into by is are was were has have had this that
   it its be been there their our your after before during main local
   je su na u i a se da za od do sa iz kod po koji koja koje ali ili nije bio bila`.split(/\s+/),
);

/** The words a group of incidents has most in common, e.g. ["fire", "center"]. */
export function keywords(incidents, limit = 3) {
  const counts = new Map();
  for (const incident of incidents) {
    const words = new Set(
      `${incident.title} ${incident.text}`
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w)),
    );
    for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

/** ML clusters, largest first, numbered for people ("Group 1" rather than "Cluster 4"). */
export function rankGroups(groups) {
  return [...groups]
    .sort((a, b) => b.incidents.length - a.incidents.length || a.groupKey.localeCompare(b.groupKey))
    .map((group, i) => ({ ...group, number: i + 1, keywords: keywords(group.incidents) }));
}

export const PERIODS = ["Total", "Last year", "Last month", "Last week"];

export function topCategory(perCategory) {
  const [first] = [...(perCategory?.Total ?? [])].sort((a, b) => b.incidentCount - a.incidentCount);
  return first ?? null;
}

/** One row per period with a count per category, so each category can be its own colored series. */
export function periodSeries(perCategory) {
  const totals = Object.fromEntries((perCategory?.Total ?? []).map((c) => [c.categoryName, c.incidentCount]));
  const categories = [...new Set(PERIODS.flatMap((p) => (perCategory?.[p] ?? []).map((c) => c.categoryName)))].sort(
    (a, b) => (totals[b] ?? 0) - (totals[a] ?? 0) || a.localeCompare(b),
  );
  const rows = PERIODS.map((period) => ({
    period,
    ...Object.fromEntries(categories.map((c) => [c, (perCategory?.[period] ?? []).find((x) => x.categoryName === c)?.incidentCount ?? 0])),
  }));
  return { categories, rows };
}

/** Daily counts from the Statistics service, as chart rows with one key per category (missing ones are 0). */
export function dailySeries(days) {
  const categories = [...new Set((days ?? []).flatMap((d) => Object.keys(d.categories ?? {})))].sort();
  const rows = (days ?? []).map((d) => ({
    date: d.date,
    total: d.total,
    ...Object.fromEntries(categories.map((c) => [c, d.categories?.[c] ?? 0])),
  }));
  return { categories, rows };
}
