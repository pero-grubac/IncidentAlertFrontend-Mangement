import base from "./baseService";

const instance = base.service();

export const getCategories = async () => {
  const response = await instance.get("/Category");
  return response;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getCategories,
};
