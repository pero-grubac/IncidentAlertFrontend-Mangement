import { dailySeries, keywords, periodSeries, rankGroups, topCategory } from "./insights";
import { passwordProblems } from "./password";
import { statusColors, statusOf, statusStyle } from "./status";
import { loadSession, parseToken } from "../api/session";
import { fakeToken } from "../test/render";

describe("session", () => {
  it("reads the user and the role from the token", () => {
    const session = parseToken(fakeToken({ sub: "ana", role: "MODERATOR" }));
    expect(session).toMatchObject({ username: "ana", role: "MODERATOR" });
  });

  it("refuses an expired or broken token", () => {
    expect(parseToken(fakeToken({ exp: Math.floor(Date.now() / 1000) - 10 }))).toBeNull();
    expect(parseToken("not-a-jwt")).toBeNull();
  });

  it("forgets an expired session on load", () => {
    sessionStorage.setItem("incident-alert.session", fakeToken({ exp: 1 }));
    expect(loadSession()).toBeNull();
    expect(sessionStorage.getItem("incident-alert.session")).toBeNull();
  });
});

describe("status", () => {
  it("falls back to pending", () => {
    expect(statusOf({})).toBe("PENDING");
    expect(statusStyle("SOMETHING")).toBe(statusStyle("PENDING"));
  });

  it("uses a darker text color on light backgrounds for contrast", () => {
    expect(statusColors("PENDING", "light").fg).toBe("#B45309");
    expect(statusColors("PENDING", "dark").fg).toBe(statusStyle("PENDING").color);
  });
});

describe("passwordProblems", () => {
  it("lists what the Identity policy still needs", () => {
    expect(passwordProblems("abc")).toEqual(["length", "upper", "digit", "symbol"]);
    expect(passwordProblems("Admin123!")).toEqual([]);
  });
});

describe("keywords", () => {
  it("finds the words a group shares, ignoring filler words", () => {
    const words = keywords([
      { title: "Fire in the city center", text: "A fire broke out" },
      { title: "Forest fire", text: "Fire near the national park" },
      { title: "Smoke", text: "Fire and smoke in the center" },
    ]);
    expect(words[0]).toBe("fire");
    expect(words).toContain("center");
    expect(words).not.toContain("the");
  });
});

describe("rankGroups", () => {
  it("puts the largest group first and numbers them", () => {
    const ranked = rankGroups([
      { groupKey: "Cluster 3", incidents: [{ title: "a", text: "" }] },
      { groupKey: "Cluster 1", incidents: [{ title: "b", text: "" }, { title: "c", text: "" }] },
    ]);
    expect(ranked.map((g) => [g.number, g.groupKey])).toEqual([
      [1, "Cluster 1"],
      [2, "Cluster 3"],
    ]);
  });
});

describe("chart data", () => {
  const perCategory = {
    Total: [
      { categoryName: "Flood", incidentCount: 2 },
      { categoryName: "Fire", incidentCount: 5 },
    ],
    "Last year": [{ categoryName: "Fire", incidentCount: 4 }],
    "Last month": [],
    "Last week": [{ categoryName: "Crime", incidentCount: 1 }],
  };

  it("builds one row per period with a value for every category, busiest category first", () => {
    const { categories, rows } = periodSeries(perCategory);
    expect(categories).toEqual(["Fire", "Flood", "Crime"]);
    expect(rows[0]).toEqual({ period: "Total", Fire: 5, Flood: 2, Crime: 0 });
    expect(rows[3]).toEqual({ period: "Last week", Fire: 0, Flood: 0, Crime: 1 });
  });

  it("fills in the categories a day did not have", () => {
    const { categories, rows } = dailySeries([
      { date: "2026-05-01", total: 2, categories: { Fire: 2 } },
      { date: "2026-05-02", total: 0, categories: {} },
      { date: "2026-05-03", total: 1, categories: { Flood: 1 } },
    ]);
    expect(categories).toEqual(["Fire", "Flood"]);
    expect(rows[1]).toEqual({ date: "2026-05-02", total: 0, Fire: 0, Flood: 0 });
  });

  it("finds the most reported category", () => {
    expect(topCategory(perCategory)).toEqual({ categoryName: "Fire", incidentCount: 5 });
    expect(topCategory({})).toBeNull();
  });
});
