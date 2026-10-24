import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Alert, Box, Card, Container, Grid2 as Grid, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import CategoryChip from "../components/CategoryChip";
import PageHeader from "../components/PageHeader";
import HotspotMap from "../components/map/HotspotMap";
import { getIncidentsPerDay, getLocationHeat, getStatistics } from "../api/endpoints";
import { errorMessage } from "../api/client";
import { categoryLabel, categoryStyle } from "../lib/categories";
import { PERIODS, dailySeries, periodSeries, topCategory } from "../lib/insights";
import { translate, useI18n } from "../i18n";

function Kpi({ icon: Icon, label, value, detail, color, index }) {
  return (
    <Card sx={{ p: 2.5, height: "100%" }} className="ia-rise" style={{ animationDelay: `${index * 60}ms` }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ width: 44, height: 44, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha(color, 0.14), color, flexShrink: 0 }}>
          <Icon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Typography
            variant="h6"
            lineHeight={1.25}
            title={typeof value === "string" ? value : undefined}
            sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", my: 0.25 }}
          >
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {detail}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

function ChartCard({ title, hint, children, index = 0 }) {
  return (
    <Card sx={{ p: { xs: 2, md: 3 }, height: "100%" }} className="ia-rise" style={{ animationDelay: `${200 + index * 80}ms` }}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {hint}
      </Typography>
      {children}
    </Card>
  );
}

const legend = {
  legend: { direction: "row", position: { vertical: "top", horizontal: "left" }, padding: 0, itemMarkWidth: 10, itemMarkHeight: 10, markGap: 6, itemGap: 16 },
};

export default function StatisticsPage() {
  const { t, language } = useI18n();
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState(null);
  const [heat, setHeat] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // The trend and the map are extras: the page still works if one of them fails.
    Promise.allSettled([getStatistics(), getIncidentsPerDay(30), getLocationHeat()]).then(([stats, perDay, places]) => {
      if (cancelled) return;
      if (stats.status === "fulfilled") setData(stats.value);
      else setError(errorMessage(stats.reason, translate("stats.failed")));
      setTrend(perDay.status === "fulfilled" ? perDay.value : []);
      setHeat(places.status === "fulfilled" ? places.value : []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const byPeriod = useMemo(() => periodSeries(data?.perCategory), [data]);
  const daily = useMemo(() => dailySeries(trend), [trend]);
  const top = useMemo(() => topCategory(data?.perCategory), [data]);
  const periodLabel = (p) => t(`stats.periods.${p}`);
  const seriesFor = (categories) =>
    categories.map((c) => ({ dataKey: c, label: categoryLabel(c, language), color: categoryStyle(c).color, stack: "all" }));

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader eyebrow={t("stats.eyebrow")} title={t("stats.title")} description={t("stats.description")} />

      {error && <Alert severity="error">{error}</Alert>}

      {!data && !error && (
        <Grid container spacing={2.5}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={104} />
            </Grid>
          ))}
          <Grid size={12}>
            <Skeleton variant="rounded" height={380} />
          </Grid>
        </Grid>
      )}

      {data && (
        <Stack spacing={3}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Kpi
                index={0}
                icon={PlaceRoundedIcon}
                color="#6366F1"
                label={t("stats.busiest")}
                value={data.busiest.Total?.locationName ?? "—"}
                detail={t("stats.inTotal", { n: data.busiest.Total?.incidentCount ?? 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Kpi
                index={1}
                icon={TrendingUpRoundedIcon}
                color="#0EA5E9"
                label={t("stats.busiestMonth")}
                value={data.busiest["Last month"]?.incidentCount ? data.busiest["Last month"].locationName : "—"}
                detail={t("common.incidents", { n: data.busiest["Last month"]?.incidentCount ?? 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Kpi
                index={2}
                icon={SellRoundedIcon}
                color="#F59E0B"
                label={t("stats.topCategory")}
                value={top ? categoryLabel(top.categoryName, language) : "—"}
                detail={t("common.incidents", { n: top?.incidentCount ?? 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Kpi
                index={3}
                icon={LocalFireDepartmentRoundedIcon}
                color="#E11D48"
                label={t("stats.hotspot")}
                value={data.busiestPerCategory.Total?.incidentCount ? data.busiestPerCategory.Total.locationName : "—"}
                detail={
                  data.busiestPerCategory.Total?.incidentCount
                    ? t("stats.hotspotDetail", {
                        n: data.busiestPerCategory.Total.incidentCount,
                        category: categoryLabel(data.busiestPerCategory.Total.categoryName, language),
                      })
                    : t("stats.noData")
                }
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <ChartCard index={0} title={t("stats.trend")} hint={t("stats.trendHint")}>
                {trend === null ? (
                  <Skeleton variant="rounded" height={300} />
                ) : daily.categories.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
                    {t("stats.none")}
                  </Typography>
                ) : (
                  <BarChart
                    height={300}
                    dataset={daily.rows}
                    xAxis={[
                      {
                        scaleType: "band",
                        dataKey: "date",
                        categoryGapRatio: 0.3,
                        valueFormatter: (value, context) => dayjs(value).format(context.location === "tick" ? "D.M." : "D MMM YYYY"),
                        tickLabelInterval: (_value, index) => index % 5 === 0,
                      },
                    ]}
                    yAxis={[{ tickMinStep: 1 }]}
                    series={seriesFor(daily.categories)}
                    borderRadius={3}
                    grid={{ horizontal: true }}
                    margin={{ top: 56, left: 36, right: 10, bottom: 30 }}
                    slotProps={legend}
                  />
                )}
              </ChartCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <ChartCard index={1} title={t("stats.map")} hint={t("stats.mapHint")}>
                {heat === null ? <Skeleton variant="rounded" height={300} /> : <HotspotMap points={heat} height={300} />}
              </ChartCard>
            </Grid>
          </Grid>

          <ChartCard index={2} title={t("stats.perCategory")} hint={t("stats.perCategoryHint")}>
            {byPeriod.categories.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
                {t("stats.none")}
              </Typography>
            ) : (
              <BarChart
                height={340}
                dataset={byPeriod.rows}
                xAxis={[{ scaleType: "band", dataKey: "period", categoryGapRatio: 0.35, valueFormatter: periodLabel }]}
                yAxis={[{ tickMinStep: 1 }]}
                series={seriesFor(byPeriod.categories).map(({ stack: _stack, ...s }) => s)}
                borderRadius={5}
                grid={{ horizontal: true }}
                margin={{ top: 56, left: 36, right: 10, bottom: 30 }}
                slotProps={legend}
              />
            )}
          </ChartCard>

          <Card className="ia-rise" style={{ animationDelay: "420ms" }}>
            <Box sx={{ p: { xs: 2, md: 3 }, pb: 1 }}>
              <Typography variant="h6">{t("stats.table")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("stats.tableHint")}
              </Typography>
            </Box>
            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ "& td, & th": { borderColor: "divider" }, "& th": { color: "text.secondary", fontWeight: 650 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("stats.period")}</TableCell>
                    <TableCell>{t("stats.place")}</TableCell>
                    <TableCell align="right">{t("stats.count")}</TableCell>
                    <TableCell>{t("stats.placeCategory")}</TableCell>
                    <TableCell align="right">{t("stats.count")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PERIODS.map((period) => {
                    const place = data.busiest[period];
                    const pair = data.busiestPerCategory[period];
                    return (
                      <TableRow key={period} hover>
                        <TableCell sx={{ fontWeight: 650 }}>{periodLabel(period)}</TableCell>
                        <TableCell>{place?.incidentCount ? place.locationName : <Typography color="text.disabled">—</Typography>}</TableCell>
                        <TableCell align="right">{place?.incidentCount ?? 0}</TableCell>
                        <TableCell>
                          {pair?.incidentCount ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <span>{pair.locationName}</span>
                              <CategoryChip name={pair.categoryName} />
                            </Stack>
                          ) : (
                            <Typography color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">{pair?.incidentCount ?? 0}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Stack>
      )}
    </Container>
  );
}
