import { api, mlApi, SESSION_EXPIRED, statisticsApi } from "./client";
import { changeStatus, createCategory, loginWithGoogle } from "./endpoints";

describe("Management API calls", () => {
  it("changes a status with the JSON string body the API binds", async () => {
    const del = vi.spyOn(api, "delete").mockResolvedValue({ data: { id: 3, statusName: "REJECTED" } });

    await changeStatus(3, "REJECTED");

    expect(del).toHaveBeenCalledWith("/Incident/ChangeStatus/3", {
      data: '"REJECTED"',
      headers: { "Content-Type": "application/json" },
    });
  });

  it("creates a category from a bare JSON string", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: {} });

    await createCategory("Storm");

    expect(post).toHaveBeenCalledWith("/Category", '"Storm"', { headers: { "Content-Type": "application/json" } });
  });

  it("sends only Google's ID token, and tells a new account apart from a signed-in one", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValueOnce({ status: 201, data: "" }).mockResolvedValueOnce({ status: 200, data: "jwt" });

    expect(await loginWithGoogle("google-id-token")).toEqual({ created: true });
    expect(await loginWithGoogle("google-id-token")).toEqual({ token: "jwt" });
    expect(post).toHaveBeenCalledWith("/Login/oauth", { idToken: "google-id-token" });
  });
});

describe("authenticated client", () => {
  it("sends the session token", async () => {
    sessionStorage.setItem("incident-alert.session", "token-123");
    const seen = [];
    const adapter = async (request) => {
      seen.push(request.headers.Authorization);
      return { status: 200, data: [], headers: {}, config: request };
    };

    await api.get("/Category", { adapter });

    expect(seen).toEqual(["Bearer token-123"]);
    sessionStorage.clear();
  });

  it("sends the token to the ML and Statistics services too", async () => {
    sessionStorage.setItem("incident-alert.session", "token-123");
    const seen = [];
    const adapter = async (request) => {
      seen.push(request.headers.Authorization);
      return { status: 200, data: [], headers: {}, config: request };
    };

    await mlApi.get("/Incident/grouped-incidents", { adapter });
    await statisticsApi.get("/Statistics/NumberOfIncidentsPerCategory", { adapter });

    expect(seen).toEqual(["Bearer token-123", "Bearer token-123"]);
    sessionStorage.clear();
  });

  it("announces an expired session on 401", async () => {
    sessionStorage.setItem("incident-alert.session", "token-123");
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED, listener);
    const adapter = async (request) => Promise.reject(Object.assign(new Error("401"), { response: { status: 401 }, config: request }));

    await expect(api.get("/Category", { adapter })).rejects.toThrow();

    expect(listener).toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED, listener);
    sessionStorage.clear();
  });
});
