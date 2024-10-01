import base from "./baseService";

const instance = base.service(false, "application/json");

export const register = async (username, password, email) => {
  const response = await instance.post("/Register", {
    username,
    password,
    email,
  });
  return response;
};
