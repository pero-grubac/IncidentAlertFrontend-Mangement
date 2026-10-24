import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { CurrentPath, renderWithProviders, signIn } from "../test/render";
import * as endpoints from "../api/endpoints";
import { RequireAdmin } from "../App";
import AppLayout from "../components/AppLayout";
import { QueueProvider } from "../context/QueueContext";
import { sortAccounts } from "../lib/accounts";
import UsersPage from "./UsersPage";

const accounts = [
  { id: "a", username: "admin", email: "admin@example.com", roleName: "ADMIN", signsInWithGoogle: false },
  { id: "m", username: "maja", email: "maja@example.com", roleName: "MODERATOR", signsInWithGoogle: false },
  { id: "p", username: "petar", email: "petar@student.etf.unibl.org", roleName: "NOTITLE", signsInWithGoogle: true },
];

afterEach(() => sessionStorage.clear());

describe("UsersPage", () => {
  it("lists accounts waiting for approval first", async () => {
    vi.spyOn(endpoints, "getUsers").mockResolvedValue(accounts);
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText("1 waiting for approval")).toBeInTheDocument();
    expect(sortAccounts(accounts).map((u) => u.username)).toEqual(["petar", "maja", "admin"]);
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("approves a pending account", async () => {
    vi.spyOn(endpoints, "getUsers").mockResolvedValue(accounts);
    const approve = vi.spyOn(endpoints, "approveUser").mockResolvedValue({ ...accounts[2], roleName: "MODERATOR" });
    renderWithProviders(<UsersPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Approve" }));

    await waitFor(() => expect(approve).toHaveBeenCalledWith("p"));
    expect(await screen.findByText("petar can now moderate.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  it("revokes a moderator", async () => {
    vi.spyOn(endpoints, "getUsers").mockResolvedValue(accounts);
    const revoke = vi.spyOn(endpoints, "revokeUser").mockResolvedValue({ ...accounts[1], roleName: "NOTITLE" });
    renderWithProviders(<UsersPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Revoke" }));

    await waitFor(() => expect(revoke).toHaveBeenCalledWith("m"));
  });

  it("asks before deleting, and never offers to change an administrator", async () => {
    vi.spyOn(endpoints, "getUsers").mockResolvedValue(accounts);
    const remove = vi.spyOn(endpoints, "deleteUser").mockResolvedValue();
    renderWithProviders(<UsersPage />);
    const user = userEvent.setup();

    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete admin" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete petar" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(remove).toHaveBeenCalledWith("p"));
    await waitFor(() => expect(screen.queryByText("petar")).not.toBeInTheDocument());
  });
});

describe("account administration access", () => {
  const renderShell = () =>
    renderWithProviders(
      <Routes>
        <Route
          element={
            <QueueProvider>
              <AppLayout />
            </QueueProvider>
          }
        >
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <div>accounts page</div>
              </RequireAdmin>
            }
          />
        </Route>
        <Route path="*" element={<CurrentPath />} />
      </Routes>,
      { route: "/users" },
    );

  beforeEach(() => {
    vi.spyOn(endpoints, "getQueue").mockResolvedValue([]);
    // A desktop-sized window, so the navigation drawer is permanently open.
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }));
  });

  it("is in the navigation for administrators", () => {
    signIn({ role: "ADMIN", sub: "admin" });
    renderShell();

    expect(screen.getByText("accounts page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Accounts/ })).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });

  it("is hidden from moderators", () => {
    signIn({ role: "MODERATOR" });
    renderShell();

    expect(screen.queryByRole("link", { name: /Accounts/ })).not.toBeInTheDocument();
    expect(screen.getByTestId("path")).toHaveTextContent("/map");
  });
});
