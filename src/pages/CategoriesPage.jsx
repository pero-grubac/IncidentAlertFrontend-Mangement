import { useEffect, useState } from "react";
import { Box, Button, Card, Container, Divider, IconButton, Skeleton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../api/endpoints";
import { errorMessage } from "../api/client";
import { useNotify } from "../context/NotificationContext";
import { categoryLabel, categoryStyle } from "../lib/categories";
import { useI18n } from "../i18n";
import { alpha } from "@mui/material/styles";

function CategoryRow({ category, onSave, onDelete }) {
  const { t, language } = useI18n();
  const label = categoryLabel(category.name, language);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const { color, Icon } = categoryStyle(category.name);

  const save = async () => {
    if (!name.trim() || name.trim() === category.name) {
      setEditing(false);
      setName(category.name);
      return;
    }
    if (await onSave(category.id, name.trim())) setEditing(false);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 1.5 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: alpha(color, 0.14), color, flexShrink: 0 }}>
        <Icon fontSize="small" />
      </Box>
      {editing ? (
        <TextField
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setEditing(false);
              setName(category.name);
            }
          }}
          autoFocus
          sx={{ flexGrow: 1 }}
          slotProps={{ htmlInput: { "aria-label": t("categoriesPage.newName", { name: category.name }) } }}
        />
      ) : (
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography fontWeight={650} noWrap>
            {category.name}
          </Typography>
          {label !== category.name && (
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {label}
            </Typography>
          )}
        </Box>
      )}
      {editing ? (
        <>
          <Tooltip title={t("common.save")}>
            <IconButton onClick={save} color="primary" aria-label={t("common.save")}>
              <CheckRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("common.cancel")}>
            <IconButton
              onClick={() => {
                setEditing(false);
                setName(category.name);
              }}
              aria-label={t("common.cancel")}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          <Tooltip title={t("categoriesPage.rename")}>
            <IconButton onClick={() => setEditing(true)} aria-label={t("categoriesPage.renameLabel", { name: category.name })}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("common.delete")}>
            <IconButton onClick={() => onDelete(category)} aria-label={t("categoriesPage.deleteLabel", { name: category.name })} sx={{ "&:hover": { color: "error.main" } }}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  );
}

export default function CategoriesPage() {
  const { t } = useI18n();
  const notify = useNotify();
  const [categories, setCategories] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = () =>
    getCategories()
      .then((data) => setCategories([...data].sort((a, b) => a.name.localeCompare(b.name))))
      .catch((e) => {
        setCategories([]);
        notify(errorMessage(e, t("categoriesPage.loadFailed")), "error");
      });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories?.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      notify(t("categoriesPage.exists", { name: trimmed }), "warning");
      return;
    }
    setBusy(true);
    try {
      await createCategory(trimmed);
      setName("");
      notify(t("categoriesPage.added", { name: trimmed }), "success");
      await load();
    } catch (e) {
      notify(errorMessage(e, t("categoriesPage.addFailed")), "error");
    } finally {
      setBusy(false);
    }
  };

  const rename = async (id, newName) => {
    try {
      await updateCategory(id, newName);
      notify(t("categoriesPage.renamed", { name: newName }), "success");
      await load();
      return true;
    } catch (e) {
      notify(errorMessage(e, t("categoriesPage.renameFailed")), "error");
      return false;
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await deleteCategory(deleting.id);
      notify(t("categoriesPage.deleted", { name: deleting.name }), "success");
      setDeleting(null);
      await load();
    } catch (e) {
      notify(errorMessage(e, t("categoriesPage.deleteFailed")), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <PageHeader
        eyebrow={t("categoriesPage.eyebrow")}
        title={t("categoriesPage.title")}
        description={t("categoriesPage.description")}
      />

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Stack component="form" direction="row" spacing={1.5} onSubmit={add}>
          <TextField size="small" fullWidth label={t("categoriesPage.newLabel")} placeholder={t("categoriesPage.placeholder")} value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={busy || !name.trim()} sx={{ flexShrink: 0 }}>
            {t("categoriesPage.add")}
          </Button>
        </Stack>
      </Card>

      <Card>
        {categories === null ? (
          [0, 1, 2].map((i) => <Skeleton key={i} variant="rectangular" height={64} sx={{ m: 1.5, borderRadius: 2 }} />)
        ) : categories.length === 0 ? (
          <EmptyState icon={SellOutlinedIcon} title={t("categoriesPage.emptyTitle")} description={t("categoriesPage.emptyText")} />
        ) : (
          <Stack divider={<Divider />}>
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} onSave={rename} onDelete={setDeleting} />
            ))}
          </Stack>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(deleting)}
        danger
        busy={busy}
        title={t("categoriesPage.confirmTitle", { name: deleting?.name })}
        message={t("categoriesPage.confirmText")}
        confirmLabel={t("common.delete")}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </Container>
  );
}
