import base from "./baseService";

const instance = base.service();

export const getLocations = async () => {
  const response = await instance.get("/Location");
  return response;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getLocations,
};
