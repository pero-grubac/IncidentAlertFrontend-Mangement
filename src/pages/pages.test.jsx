import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, signIn } from "../test/render";
import { QueueProvider } from "../context/QueueContext";
import * as endpoints from "../api/endpoints";
import MapPage from "./MapPage";
import CategoriesPage from "./CategoriesPage";
import StatisticsPage from "./StatisticsPage";
import GroupedIncidentsPage from "./GroupedIncidentsPage";

// Leaflet and the SVG charts need a real layout engine; the pages are tested around them.
vi.mock("../components/map/ModerationMap", () => ({
  default: ({ incidents }) => <div data-testid="map">{incidents.length} on the map</div>,
}));
vi.mock("@mui/x-charts/BarChart", () => ({
  BarChart: ({ series }) => <div data-testid="chart">{series.map((s) => s.label).join(",")}</div>,
}));
vi.mock("../components/map/HotspotMap", () => ({
  default: ({ points }) => <div data-testid="hotspots">{points.length} hot spots</div>,
}));
vi.mock("../components/map/LocationMiniMap", () => ({ default: () => null }));

const place = { name: "Tuzla", latitude: 44.53, longitude: 18.67 };
const queue = [
  { id: 1, title: "Bridge closure", text: "Closed.", dateTime: "2026-05-01T10:00:00Z", statusName: "PENDING", location: place, categories: [{ name: "Flood" }], images: [] },
  { id: 2, title: "Spam", text: "Nothing.", dateTime: "2026-05-02T10:00:00Z", statusName: "REJECTED", location: place, categories: [{ name: "Other" }], images: [] },
  { id: 3, title: "Gas leak", text: "Smell.", dateTime: "2026-05-03T10:00:00Z", statusName: "PENDING", location: place, categories: [{ name: "Other" }], images: [] },
];

beforeEach(() => signIn());
afterEach(() => sessionStorage.clear());

describe("MapPage", () => {
  const renderMap = () =>
    renderWithProviders(
      <QueueProvider>
        <MapPage />
      </QueueProvider>,
    );

  it("loads the whole queue and shows pending reports first", async () => {
    const load = vi.spyOn(endpoints, "getQueue").mockResolvedValue(queue);
    renderMap();

    expect(await screen.findByText("Bridge closure")).toBeInTheDocument();
    expect(load).toHaveBeenCalled();
    expect(screen.getByText("Gas leak")).toBeInTheDocument();
    expect(screen.queryByText("Spam")).not.toBeInTheDocument();
    expect(screen.getByText("2 waiting for a decision")).toBeInTheDocument();
    expect(screen.getByTestId("map")).toHaveTextContent("2 on the map");
  });

  it("shows rejected reports on request", async () => {
    vi.spyOn(endpoints, "getQueue").mockResolvedValue(queue);
    renderMap();
    await screen.findByText("Bridge closure");

    await userEvent.click(screen.getByRole("button", { name: /Rejected · 1/ }));

    expect(screen.getByText("Spam")).toBeInTheDocument();
    expect(screen.getByTestId("map")).toHaveTextContent("3 on the map");
  });

  it("removes an approved report from the queue", async () => {
    vi.spyOn(endpoints, "getQueue").mockResolvedValue(queue);
    vi.spyOn(endpoints, "approveIncident").mockResolvedValue();
    renderMap();
    const user = userEvent.setup();

    await user.click(await screen.findByText("Gas leak"));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Approve & publish" }));

    await waitFor(() => expect(screen.queryByText("Gas leak")).not.toBeInTheDocument());
    expect(screen.getByText("1 waiting for a decision")).toBeInTheDocument();
  });

  it("asks for a date range when a period is picked", async () => {
    vi.spyOn(endpoints, "getQueue").mockResolvedValue(queue);
    const ranged = vi.spyOn(endpoints, "getQueueInRange").mockResolvedValue([]);
    renderMap();
    await screen.findByText("Bridge closure");

    await userEvent.click(screen.getByRole("button", { name: "7 days" }));

    await waitFor(() => expect(ranged).toHaveBeenCalled());
    expect(await screen.findByText("All caught up")).toBeInTheDocument();
  });
});

describe("CategoriesPage", () => {
  it("adds a category and refreshes the list", async () => {
    const get = vi
      .spyOn(endpoints, "getCategories")
      .mockResolvedValueOnce([{ id: 1, name: "Fire" }])
      .mockResolvedValueOnce([{ id: 1, name: "Fire" }, { id: 6, name: "Storm" }]);
    const create = vi.spyOn(endpoints, "createCategory").mockResolvedValue({ id: 6, name: "Storm" });
    renderWithProviders(<CategoriesPage />);
    const user = userEvent.setup();
    await screen.findByText("Fire");

    await user.type(screen.getByLabelText("New category"), "Storm");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(create).toHaveBeenCalledWith("Storm"));
    expect(await screen.findByText("Storm")).toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("does not send a duplicate", async () => {
    vi.spyOn(endpoints, "getCategories").mockResolvedValue([{ id: 1, name: "Fire" }]);
    const create = vi.spyOn(endpoints, "createCategory");
    renderWithProviders(<CategoriesPage />);
    const user = userEvent.setup();
    await screen.findByText("Fire");

    await user.type(screen.getByLabelText("New category"), "fire");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText('"fire" already exists.')).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("renames a category inline", async () => {
    vi.spyOn(endpoints, "getCategories").mockResolvedValue([{ id: 1, name: "Fire" }]);
    const update = vi.spyOn(endpoints, "updateCategory").mockResolvedValue({ id: 1, name: "Wildfire" });
    renderWithProviders(<CategoriesPage />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Rename Fire" }));
    const input = screen.getByLabelText("New name for Fire");
    await user.clear(input);
    await user.type(input, "Wildfire{Enter}");

    await waitFor(() => expect(update).toHaveBeenCalledWith(1, "Wildfire"));
  });
});

describe("StatisticsPage", () => {
  beforeEach(() => {
    vi.spyOn(endpoints, "getIncidentsPerDay").mockResolvedValue([{ date: "2026-05-01", total: 1, categories: { Fire: 1 } }]);
    vi.spyOn(endpoints, "getLocationHeat").mockResolvedValue([{ locationName: "Sarajevo", latitude: 43.8, longitude: 18.4, incidentCount: 4 }]);
  });

  it("summarises the statistics service", async () => {
    vi.spyOn(endpoints, "getStatistics").mockResolvedValue({
      busiest: { Total: { locationName: "Sarajevo", incidentCount: 4 }, "Last month": { locationName: "Tuzla", incidentCount: 2 } },
      busiestPerCategory: { Total: { locationName: "Sarajevo", categoryName: "Fire", incidentCount: 3 } },
      perCategory: { Total: [{ categoryName: "Fire", incidentCount: 3 }, { categoryName: "Flood", incidentCount: 1 }] },
    });
    renderWithProviders(<StatisticsPage />);

    expect(await screen.findByText("4 incidents in total")).toBeInTheDocument();
    expect(screen.getAllByText("Sarajevo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tuzla").length).toBeGreaterThan(0);
    expect(screen.getByText("3 incidents of Fire")).toBeInTheDocument();
    const [trend, perCategory] = screen.getAllByTestId("chart");
    expect(trend).toHaveTextContent("Fire");
    expect(perCategory).toHaveTextContent("Fire,Flood");
    expect(screen.getByTestId("hotspots")).toHaveTextContent("1 hot spots");
  });

  it("explains a failure", async () => {
    vi.spyOn(endpoints, "getStatistics").mockRejectedValue({ code: "ERR_NETWORK" });
    renderWithProviders(<StatisticsPage />);

    expect(await screen.findByText("The server cannot be reached right now.")).toBeInTheDocument();
  });
});

describe("GroupedIncidentsPage", () => {
  it("shows the ML groups, largest first, with their keywords", async () => {
    vi.spyOn(endpoints, "getGroupedIncidents").mockResolvedValue([
      { groupKey: "Cluster 4", incidents: [{ id: 9, title: "Bank robbery", text: "Robbery downtown", dateTime: "2026-05-01T10:00:00Z" }] },
      {
        groupKey: "Cluster 2",
        incidents: [
          { id: 1, title: "Road flooding", text: "Flooding on the road", dateTime: "2026-05-01T10:00:00Z" },
          { id: 2, title: "Bridge closure", text: "Bridge closed due to flooding", dateTime: "2026-05-01T10:00:00Z" },
        ],
      },
    ]);
    renderWithProviders(<GroupedIncidentsPage />);

    const first = (await screen.findByText("Group 1")).closest(".MuiCard-root");
    expect(within(first).getByText("2 reports")).toBeInTheDocument();
    expect(within(first).getByText("flooding")).toBeInTheDocument();
    expect(screen.getByText("Group 2")).toBeInTheDocument();
  });
});
