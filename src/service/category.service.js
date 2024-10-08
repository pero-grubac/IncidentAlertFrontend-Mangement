import base from "./baseService";

const instance = base.service(true, "application/json");

export const getCategories = async () => {
  const response = await instance.get("/Category");
  return response;
};

export const createCategory = async (name) => {
  const response = await instance.post("/Category", name);
  return response;
};

export const updateCategory = async (id, name) => {
  const response = await instance.put("/Category", { id, name });
  return response;
};

export const deleteCategory = async (id) => {
  const response = await instance.delete(`/Category/${id}`);
  return response;
};
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
