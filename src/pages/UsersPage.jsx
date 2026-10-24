import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { approveUser, deleteUser, getUsers, revokeUser } from "../api/endpoints";
import { errorMessage } from "../api/client";
import { useNotify } from "../context/NotificationContext";
import { roleColors, sortAccounts } from "../lib/accounts";
import { translate, useT } from "../i18n";
import { useTheme } from "@mui/material/styles";

function AccountRow({ user, busy, onApprove, onRevoke, onDelete, index }) {
  const t = useT();
  const { palette } = useTheme();
  const style = roleColors(user.roleName, palette.mode);
  const isAdmin = user.roleName === "ADMIN";

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ px: 2.5, py: 1.75 }} className="ia-rise" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <Stack direction="row" spacing={1.75} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Avatar sx={{ bgcolor: style.bg, color: style.fg, fontWeight: 700 }}>{user.username[0]?.toUpperCase()}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={650} noWrap>
              {user.username}
            </Typography>
            <Chip size="small" label={t(`roles.${user.roleName}`)} sx={{ color: style.fg, bgcolor: style.bg }} />
            {user.signsInWithGoogle && <Chip size="small" variant="outlined" label="Google" />}
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
      </Stack>

      {!isAdmin && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {user.roleName === "NOTITLE" ? (
            <Button variant="contained" color="success" size="small" startIcon={<HowToRegRoundedIcon />} disabled={busy} onClick={() => onApprove(user)} sx={{ color: "#fff" }}>
              {t("accounts.approve")}
            </Button>
          ) : (
            <Button variant="outlined" color="warning" size="small" startIcon={<PersonOffOutlinedIcon />} disabled={busy} onClick={() => onRevoke(user)}>
              {t("accounts.revoke")}
            </Button>
          )}
          <Tooltip title={t("accounts.deleteTooltip")}>
            <span>
              <IconButton aria-label={t("accounts.deleteLabel", { name: user.username })} disabled={busy} onClick={() => onDelete(user)} sx={{ "&:hover": { color: "error.main" } }}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      )}
    </Stack>
  );
}

/** Administrators approve new accounts here before they can moderate. */
export default function UsersPage() {
  const t = useT();
  const notify = useNotify();
  const [users, setUsers] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((e) => {
        setUsers([]);
        notify(errorMessage(e, translate("accounts.loadFailed")), "error");
      });
  }, [notify]);

  const sorted = useMemo(() => sortAccounts(users ?? []), [users]);
  const pending = sorted.filter((u) => u.roleName === "NOTITLE").length;

  const replace = (updated) => setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));

  const run = async (action, success) => {
    setBusy(true);
    try {
      await action();
      notify(success, "success");
    } catch (e) {
      notify(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const approve = (user) => run(async () => replace(await approveUser(user.id)), t("accounts.approved", { name: user.username }));
  const revoke = (user) => run(async () => replace(await revokeUser(user.id)), t("accounts.revoked", { name: user.username }));
  const remove = () =>
    run(async () => {
      await deleteUser(deleting.id);
      setUsers((list) => list.filter((u) => u.id !== deleting.id));
      setDeleting(null);
    }, t("accounts.deleted", { name: deleting.username }));

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader
        eyebrow={t("accounts.eyebrow")}
        title={t("accounts.title")}
        description={t("accounts.description")}
        actions={pending > 0 && <Chip color="warning" label={t("accounts.waiting", { n: pending })} sx={{ fontWeight: 700 }} />}
      />

      <Card>
        {users === null ? (
          [0, 1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={68} sx={{ m: 1.5, borderRadius: 2 }} />)
        ) : sorted.length === 0 ? (
          <EmptyState icon={GroupOutlinedIcon} title={t("accounts.emptyTitle")} />
        ) : (
          <Stack divider={<Divider />}>
            {sorted.map((user, i) => (
              <AccountRow key={user.id} index={i} user={user} busy={busy} onApprove={approve} onRevoke={revoke} onDelete={setDeleting} />
            ))}
          </Stack>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(deleting)}
        danger
        busy={busy}
        title={t("accounts.confirmTitle", { name: deleting?.username })}
        message={t("accounts.confirmText")}
        confirmLabel={t("common.delete")}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </Container>
  );
}
