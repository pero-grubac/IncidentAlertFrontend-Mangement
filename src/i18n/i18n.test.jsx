import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/render";
import { translate } from ".";
import { messages } from "./messages";
import SettingsMenu from "../components/SettingsMenu";
import RegisterPage from "../pages/auth/RegisterPage";

function keysOf(node, prefix = "") {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const isPlural = value && typeof value === "object" && "other" in value;
    return value && typeof value === "object" && !isPlural ? keysOf(value, path) : [path];
  });
}

describe("translations", () => {
  it("has every English text in Serbian too", () => {
    expect(keysOf(messages.sr).sort()).toEqual(keysOf(messages.en).sort());
  });

  it("uses the Serbian plural forms", () => {
    expect(translate("map.waiting", { n: 1 }, "sr")).toBe("1 prijava čeka odluku");
    expect(translate("map.waiting", { n: 3 }, "sr")).toBe("3 prijave čekaju odluku");
    expect(translate("map.waiting", { n: 6 }, "sr")).toBe("6 prijava čeka odluku");
  });

  it("explains a weak password in Serbian", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { language: "sr", route: "/register", path: "/register" });

    await user.type(screen.getByLabelText("Korisničko ime"), "novi");
    await user.type(screen.getByLabelText("E-pošta"), "novi@example.com");
    await user.type(screen.getByLabelText("Lozinka"), "abc");
    await user.click(screen.getByRole("button", { name: "Napravi nalog" }));

    expect(screen.getByText("Nedostaje: bar 6 znakova, veliko slovo, cifra, simbol.")).toBeInTheDocument();
  });
});

describe("SettingsMenu", () => {
  afterEach(() => localStorage.clear());

  it("switches language and theme", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsMenu />, { mode: null });

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(within(screen.getByRole("group", { name: "Theme" })).getByRole("button", { name: /Dark/ }));
    await user.click(within(screen.getByRole("group", { name: "Language" })).getByRole("button", { name: /Srpski/ }));

    expect(document.documentElement.dataset.mode).toBe("dark");
    expect(document.documentElement.lang).toBe("sr");
    expect(screen.getByRole("group", { name: "Tema" })).toBeInTheDocument();
  });
});
