import axios from "axios";
import environment from "../Enviroments";
const baseUrlConfig = {
  baseUrl: environment().statisticsServiceUrl,
};

export const getLocationWithMostIncidents = async () => {
  const response = await axios.get(
    `${baseUrlConfig.baseUrl}/Statistics/LocationWithMostIncidents`
  );
  return response;
};

export const getLocationWithMostIncidentsPerCategory = async () => {
  const response = await axios.get(
    `${baseUrlConfig.baseUrl}/Statistics/LocationWithMostIncidentsPerCategory`
  );
  return response;
};

export const getNumberOfIncidentsPerCategory = async () => {
  const response = await axios.get(
    `${baseUrlConfig.baseUrl}/Statistics/NumberOfIncidentsPerCategory`
  );
  return response;
};
