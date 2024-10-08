import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../service/category.service";
import { Snackbar, Alert } from "@mui/material";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  const showMessage = (msg, type) => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(type);
    setOpenSnackbar(true);
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      setCategories(result.data);
    } catch (error) {
      showMessage("Couldn't get categories.", "error");
    }
  };

  const handleAddCategory = async () => {
    try {
      await createCategory(newCategoryName);
      setNewCategoryName("");
      fetchCategories();
    } catch (error) {
      showMessage("Couldn't add category.", "error");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setUpdatedCategoryName(category.name);
  };

  const handleUpdateCategory = async () => {
    if (editingCategory) {
      try {
        await updateCategory(editingCategory.id, updatedCategoryName);
        setEditingCategory(null);
        setUpdatedCategoryName("");
        fetchCategories();
      } catch (error) {
        showMessage("Couldn't update category.", "error");
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (error) {
      showMessage("Couldn't delete category.", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Categories
      </Typography>

      <Box sx={{ display: "flex", mb: 3 }}>
        <TextField
          label="New Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCategory}
          sx={{ ml: 2 }}
        >
          Add Category
        </Button>
      </Box>

      <List>
        {categories.map((category) => (
          <React.Fragment key={category.id}>
            <ListItem
              sx={{
                border: "1px solid #ddd",
                borderRadius: 2,
                mb: 1,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {editingCategory?.id === category.id ? (
                <Box sx={{ display: "flex", flex: 1, alignItems: "center" }}>
                  <TextField
                    value={updatedCategoryName}
                    onChange={(e) => setUpdatedCategoryName(e.target.value)}
                    sx={{ mr: 2, flex: 1 }}
                  />
                  <Button variant="contained" onClick={handleUpdateCategory}>
                    Save
                  </Button>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {category.name}
                </Typography>
              )}

              <Box>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditCategory(category)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryPage;
