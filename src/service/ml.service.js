import axios from "axios";
import environment from "../Enviroments";
const baseUrlConfig = {
  baseUrl: environment().mlServiceUrl,
};

export const getGroupedIncidents = async () => {
  const response = await axios.get(
    `${baseUrlConfig.baseUrl}/Incident/grouped-incidents`
  );
  return response;
};
