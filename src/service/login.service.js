import base from "./baseService";

const instance = base.service(false, "application/json");

export const loginUser = async (username, password) => {
  const response = await instance.post("/Login", { username, password });
  return response;
};

export const logout = () => sessionStorage.clear();

export const oauthGmail = async (oiduser) => {
  const response = await instance.post("/Login/oauth", oiduser);
  return response;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  loginUser,
  logout,
  oauthGmail,
};
