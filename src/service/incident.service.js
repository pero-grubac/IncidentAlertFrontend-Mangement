import base from "./baseService";
import multipartService from "./mulitpartBaseService";

const instance = base.service(true, "application/json");
const multipart = multipartService.service(true);
const cntl = "/Incident";

export const getIncidents = async () => {
  const response = await instance.get(`${cntl}/getApproved`);
  return response;
};

export const getIncidentsByLocationName = async (name) => {
  const response = await instance.get(`${cntl}/GetAllByLocationName/${name}`);
  return response;
};

export const getIncidentsByCategoryName = async (name) => {
  const response = await instance.get(`${cntl}/GetByCategoryName/${name}`);
  return response;
};

export const getIncidentsOnDate = async (date) => {
  const response = await instance.get(`${cntl}/GetAllOnDate/${date}`);
  return response;
};

export const getIncidentsInDateRange = async (startDate, endDate) => {
  const response = await instance.get(
    `${cntl}/GetAllInDateRange?startDate=${encodeURIComponent(
      startDate
    )}&endDate=${encodeURIComponent(endDate)}`
  );
  return response;
};

export const createIncident = async (incident) => {
  const response = await multipart.post(`${cntl}`, incident);
  return response;
};

export const acceptIncident = async (id) => {
  const response = await instance.put(`${cntl}/Approve/${id}`);
  return response;
};
export const deleteIncident = async (id) => {
  const response = await instance.delete(`${cntl}/${id}`);
  return response;
};
export const changeStatus = async (id, status) => {
  console.log("status " + status);
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getIncidents,
  getIncidentsByLocationName,
  getIncidentsByCategoryName,
  getIncidentsOnDate,
  getIncidentsInDateRange,
  createIncident,
  acceptIncident,
  deleteIncident,
  changeStatus,
};
