import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Card, Chip, Container, Divider, Grid2 as Grid, Skeleton, Stack, Typography } from "@mui/material";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { getGroupedIncidents } from "../api/endpoints";
import { errorMessage } from "../api/client";
import { fromNow } from "../lib/dates";
import { rankGroups } from "../lib/insights";
import { translate, useT } from "../i18n";
import { alpha } from "@mui/material/styles";

const GROUP_COLORS = ["#6366F1", "#0EA5E9", "#14B8A6", "#F59E0B", "#EC4899", "#8B5CF6"];

function GroupCard({ group, index }) {
  const t = useT();
  const color = GROUP_COLORS[(group.number - 1) % GROUP_COLORS.length];

  return (
    <Card className="ia-rise" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2.5, pb: 2, borderTop: `4px solid ${color}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography variant="h6">{t("similar.group", { n: group.number })}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {t("similar.reports", { n: group.incidents.length })}
          </Typography>
        </Stack>
        {group.keywords.length > 0 && (
          <Stack direction="row" spacing={0.75} sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap>
            {group.keywords.map((word) => (
              <Chip key={word} size="small" label={word} sx={{ bgcolor: alpha(color, 0.14), color, fontWeight: 650 }} />
            ))}
          </Stack>
        )}
      </Box>
      <Divider />
      <Stack divider={<Divider />} sx={{ flexGrow: 1 }}>
        {group.incidents.map((incident) => (
          <Box key={incident.id} sx={{ px: 2.5, py: 1.5 }}>
            <Typography variant="body2" fontWeight={650}>
              {incident.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {incident.text}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, color: "text.disabled" }}>
              {incident.location?.name && (
                <Stack direction="row" spacing={0.25} alignItems="center" sx={{ minWidth: 0 }}>
                  <PlaceOutlinedIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" noWrap>
                    {incident.location.name}
                  </Typography>
                </Stack>
              )}
              <Typography variant="caption">{fromNow(incident.dateTime)}</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

export default function GroupedIncidentsPage() {
  const t = useT();
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setGroups(null);
    setError(null);
    getGroupedIncidents()
      .then((data) => !cancelled && setGroups(data))
      .catch((e) => {
        if (cancelled) return;
        setGroups([]);
        setError(errorMessage(e, translate("similar.failed")));
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const ranked = useMemo(() => rankGroups(groups ?? []), [groups]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader
        eyebrow={t("similar.eyebrow")}
        title={t("similar.title")}
        description={t("similar.description")}
        actions={
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => setVersion((v) => v + 1)} disabled={groups === null}>
            {t("similar.regroup")}
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {groups === null ? (
        <Grid container spacing={2.5}>
          {[0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6, xl: 4 }}>
              <Skeleton variant="rounded" height={300} />
            </Grid>
          ))}
        </Grid>
      ) : ranked.length === 0 && !error ? (
        <Card>
          <EmptyState icon={HubOutlinedIcon} title={t("similar.emptyTitle")} description={t("similar.emptyText")} />
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {ranked.map((group, i) => (
            <Grid key={group.groupKey} size={{ xs: 12, md: 6, xl: 4 }}>
              <GroupCard group={group} index={i} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
