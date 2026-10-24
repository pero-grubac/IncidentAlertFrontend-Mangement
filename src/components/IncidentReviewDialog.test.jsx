import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/render";
import * as endpoints from "../api/endpoints";
import IncidentReviewDialog from "./IncidentReviewDialog";

// Leaflet needs a real layout engine; the mini map is covered by the screenshots, not by jsdom.
vi.mock("./map/LocationMiniMap", () => ({ default: () => <div data-testid="mini-map" /> }));

const incident = {
  id: 11,
  title: "Gas leak",
  text: "Smell of gas in the building.",
  dateTime: "2026-05-01T10:00:00Z",
  status: 2,
  statusName: "PENDING",
  location: { name: "Beograd", latitude: 44.8, longitude: 20.46 },
  categories: [{ id: 5, name: "Other" }],
  images: ["http://localhost:5002/uploads/11/gas.jpg"],
};

function setup(overrides = {}) {
  const handlers = { onClose: vi.fn(), onApproved: vi.fn(), onUpdated: vi.fn(), onDeleted: vi.fn() };
  renderWithProviders(<IncidentReviewDialog incident={{ ...incident, ...overrides }} open {...handlers} />);
  return handlers;
}

describe("IncidentReviewDialog", () => {
  it("shows the report with its status, category and photo", () => {
    setup();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Gas leak")).toBeInTheDocument();
    expect(within(dialog).getByText("Pending")).toBeInTheDocument();
    expect(within(dialog).getByText("Other")).toBeInTheDocument();
    expect(within(dialog).getByAltText("Gas leak — photo 1")).toBeInTheDocument();
    expect(within(dialog).getByTestId("mini-map")).toBeInTheDocument();
  });

  it("speaks Serbian when asked", () => {
    const handlers = { onClose: vi.fn() };
    renderWithProviders(<IncidentReviewDialog incident={incident} open {...handlers} />, { language: "sr" });
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Na čekanju")).toBeInTheDocument();
    expect(within(dialog).getByText("Ostalo")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Odobri i objavi" })).toBeInTheDocument();
  });

  it("approves and publishes", async () => {
    const approve = vi.spyOn(endpoints, "approveIncident").mockResolvedValue();
    const { onApproved, onClose } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Approve & publish" }));

    await waitFor(() => expect(approve).toHaveBeenCalledWith(11));
    expect(onApproved).toHaveBeenCalledWith(11);
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText("Approved — the incident is now on the public map.")).toBeInTheDocument();
  });

  it("rejects, keeping the photos of the incident", async () => {
    const change = vi.spyOn(endpoints, "changeStatus").mockResolvedValue({ id: 11, status: 1, statusName: "REJECTED", images: [] });
    const { onUpdated } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(change).toHaveBeenCalledWith(11, "REJECTED"));
    expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ id: 11, statusName: "REJECTED", images: incident.images }));
  });

  it("moves a rejected report back to pending", async () => {
    const change = vi.spyOn(endpoints, "changeStatus").mockResolvedValue({ id: 11, status: 2, statusName: "PENDING" });
    setup({ status: 1, statusName: "REJECTED" });

    await userEvent.click(screen.getByRole("button", { name: "Back to pending" }));

    await waitFor(() => expect(change).toHaveBeenCalledWith(11, "PENDING"));
  });

  it("asks before deleting", async () => {
    const remove = vi.spyOn(endpoints, "deleteIncident").mockResolvedValue();
    const { onDeleted } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(remove).not.toHaveBeenCalled();
    const confirm = await screen.findByRole("dialog", { name: "Delete this report?" });

    await user.click(within(confirm).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(remove).toHaveBeenCalledWith(11));
    expect(onDeleted).toHaveBeenCalledWith(11);
  });

  it("keeps the dialog open when the API refuses", async () => {
    vi.spyOn(endpoints, "approveIncident").mockRejectedValue({ response: { status: 404, data: { Message: "Incident with id 11 does not exists." } } });
    const { onClose, onApproved } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Approve & publish" }));

    expect(await screen.findByText("Incident with id 11 does not exists.")).toBeInTheDocument();
    expect(onApproved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
