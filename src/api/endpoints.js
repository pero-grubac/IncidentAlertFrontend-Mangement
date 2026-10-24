import { api, mlApi, statisticsApi } from "./client";

// ---------- Authentication ----------

export async function login(username, password) {
  const { data } = await api.post("/Login", { username, password });
  return data;
}

/**
 * Sends the ID token Google issued in the browser; the API verifies it with Google.
 * Returns { token } for an approved account, or { created: true } for a new one that still needs approval.
 */
export async function loginWithGoogle(idToken) {
  const response = await api.post("/Login/oauth", { idToken });
  return response.status === 201 ? { created: true } : { token: response.data };
}

export async function register({ username, email, password }) {
  await api.post("/Register", { username, email, password });
}

// ---------- Accounts (administrators) ----------

export async function getUsers() {
  const { data } = await api.get("/users");
  return data;
}

export async function approveUser(id) {
  const { data } = await api.put(`/users/${encodeURIComponent(id)}/approve`);
  return data;
}

export async function revokeUser(id) {
  const { data } = await api.put(`/users/${encodeURIComponent(id)}/revoke`);
  return data;
}

export async function deleteUser(id) {
  await api.delete(`/users/${encodeURIComponent(id)}`);
}

// ---------- Moderation queue ----------

const INCIDENT = "/Incident";

export async function getQueue() {
  const { data } = await api.get(`${INCIDENT}/getAll`);
  return data;
}

export async function getQueueInRange(start, end) {
  const { data } = await api.get(`${INCIDENT}/GetAllInDateRange`, {
    params: { startDate: start.toISOString(), endDate: end.toISOString() },
  });
  return data;
}

export async function getIncidentsByLocation(name) {
  const { data } = await api.get(`${INCIDENT}/GetAllByLocationName/${encodeURIComponent(name)}`);
  return data;
}

/** Publishes the incident to the public app and removes it from the queue. */
export async function approveIncident(id) {
  await api.put(`${INCIDENT}/Approve/${id}`);
}

export async function deleteIncident(id) {
  await api.delete(`${INCIDENT}/${id}`);
}

/** Moves an incident between PENDING and REJECTED. */
export async function changeStatus(id, status) {
  const { data } = await api.delete(`${INCIDENT}/ChangeStatus/${id}`, {
    data: JSON.stringify(status),
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

// ---------- Categories ----------

export async function getCategories() {
  const { data } = await api.get("/Category");
  return data;
}

export async function createCategory(name) {
  const { data } = await api.post("/Category", JSON.stringify(name), { headers: { "Content-Type": "application/json" } });
  return data;
}

export async function updateCategory(id, name) {
  const { data } = await api.put("/Category", { id, name });
  return data;
}

export async function deleteCategory(id) {
  await api.delete(`/Category/${id}`);
}

// ---------- Insights ----------

export async function getGroupedIncidents() {
  const { data } = await mlApi.get("/Incident/grouped-incidents");
  return data;
}

/** Every place with published incidents and how many, for the hot-spot map. `days` limits it to recent ones. */
export async function getLocationHeat(days) {
  const { data } = await statisticsApi.get("/Statistics/LocationHeat", { params: days ? { days } : undefined });
  return data;
}

/** Published incidents per day (oldest first), each with a count per category. */
export async function getIncidentsPerDay(days = 30) {
  const { data } = await statisticsApi.get("/Statistics/IncidentsPerDay", { params: { days } });
  return data;
}

export async function getStatistics() {
  const [busiest, busiestPerCategory, perCategory] = await Promise.all([
    statisticsApi.get("/Statistics/LocationWithMostIncidents"),
    statisticsApi.get("/Statistics/LocationWithMostIncidentsPerCategory"),
    statisticsApi.get("/Statistics/NumberOfIncidentsPerCategory"),
  ]);
  return { busiest: busiest.data, busiestPerCategory: busiestPerCategory.data, perCategory: perCategory.data };
}
