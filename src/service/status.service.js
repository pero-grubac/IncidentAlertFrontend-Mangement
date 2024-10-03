import base from "./baseService";

const instance = base.service(true, "application/json");

export const getStatusList = async () => {
  const response = await instance.get("/Status");
  return response;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getStatusList,
};
