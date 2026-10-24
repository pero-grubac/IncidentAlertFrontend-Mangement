import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeToken, renderWithProviders, signIn } from "../../test/render";
import * as endpoints from "../../api/endpoints";
import { RequireModerator } from "../../App";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

afterEach(() => sessionStorage.clear());

async function fillLogin(user, username, password) {
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: /sign in/i }));
}

describe("LoginPage", () => {
  it("signs a moderator in and opens the map", async () => {
    const login = vi.spyOn(endpoints, "login").mockResolvedValue(fakeToken({ sub: "moderator" }));
    renderWithProviders(<LoginPage />, { route: "/login", path: "/login" });

    await fillLogin(userEvent.setup(), "moderator", "Admin123!");

    expect(login).toHaveBeenCalledWith("moderator", "Admin123!");
    expect(await screen.findByTestId("path")).toHaveTextContent("/map");
    expect(sessionStorage.getItem("incident-alert.session")).toBeTruthy();
  });

  it("lets an administrator in too", async () => {
    vi.spyOn(endpoints, "login").mockResolvedValue(fakeToken({ sub: "admin", role: "ADMIN" }));
    renderWithProviders(<LoginPage />, { route: "/login", path: "/login" });

    await fillLogin(userEvent.setup(), "admin", "Admin123!");

    expect(await screen.findByTestId("path")).toHaveTextContent("/map");
  });

  it("keeps out a token with any other role", async () => {
    vi.spyOn(endpoints, "login").mockResolvedValue(fakeToken({ sub: "someone", role: "NOTITLE" }));
    renderWithProviders(<LoginPage />, { route: "/login", path: "/login" });

    await fillLogin(userEvent.setup(), "someone", "Admin123!");

    expect(await screen.findByText("This account cannot moderate incidents.")).toBeInTheDocument();
    expect(sessionStorage.getItem("incident-alert.session")).toBeNull();
  });

  it("tells a new account to wait for approval", async () => {
    vi.spyOn(endpoints, "login").mockRejectedValue({
      response: { status: 403, data: "Your account is waiting for an administrator's approval." },
    });
    renderWithProviders(<LoginPage />, { route: "/login", path: "/login" });

    await fillLogin(userEvent.setup(), "newmod", "Str0ng!pw");

    expect(await screen.findByText("Your account is waiting for an administrator's approval.")).toBeInTheDocument();
  });

  it("shows the API's reason when sign-in fails", async () => {
    vi.spyOn(endpoints, "login").mockRejectedValue({ response: { status: 400, data: { Code: 400, Message: "Invalid username or password." } } });
    renderWithProviders(<LoginPage />, { route: "/login", path: "/login" });

    await fillLogin(userEvent.setup(), "moderator", "wrong");

    expect(await screen.findByText("Invalid username or password.")).toBeInTheDocument();
  });

  it("asks for both fields before calling the API", async () => {
    const login = vi.spyOn(endpoints, "login");
    renderWithProviders(<LoginPage />, { route: "/login", path: "/login" });

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Enter your username and password.")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("hides Google sign-in when no client ID is configured", () => {
    renderWithProviders(<LoginPage />, { route: "/login", path: "/login" });
    expect(screen.queryByRole("button", { name: /google/i })).not.toBeInTheDocument();
  });
});

describe("RegisterPage", () => {
  it("checks the password policy before creating the account", async () => {
    const register = vi.spyOn(endpoints, "register");
    renderWithProviders(<RegisterPage />, { route: "/register", path: "/register" });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Username"), "newmod");
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.type(screen.getByLabelText("Repeat password"), "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText(/Needs at least 6 characters/)).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("creates the account and returns to sign-in", async () => {
    const register = vi.spyOn(endpoints, "register").mockResolvedValue();
    renderWithProviders(<RegisterPage />, { route: "/register", path: "/register" });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Username"), "newmod");
    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ng!pw");
    await user.type(screen.getByLabelText("Repeat password"), "Str0ng!pw");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(register).toHaveBeenCalledWith({ username: "newmod", email: "new@example.com", password: "Str0ng!pw" }));
    expect(await screen.findByTestId("path")).toHaveTextContent("/login");
  });
});

describe("RequireModerator", () => {
  it("sends a guest to the sign-in page", () => {
    renderWithProviders(
      <RequireModerator>
        <div>secret</div>
      </RequireModerator>,
      { route: "/statistics", path: "/statistics" },
    );

    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(screen.getByTestId("path")).toHaveTextContent("/login");
  });

  it("lets a moderator in", () => {
    signIn({ role: "MODERATOR" });
    renderWithProviders(
      <RequireModerator>
        <div>secret</div>
      </RequireModerator>,
      { route: "/statistics", path: "/statistics" },
    );

    expect(screen.getByText("secret")).toBeInTheDocument();
  });

  it("does not let another role in", () => {
    signIn({ role: "NOTITLE" });
    renderWithProviders(
      <RequireModerator>
        <div>secret</div>
      </RequireModerator>,
      { route: "/statistics", path: "/statistics" },
    );

    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });
});

