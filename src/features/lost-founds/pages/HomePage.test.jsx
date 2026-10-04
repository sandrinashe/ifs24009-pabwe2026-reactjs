import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const items = [
  {
    id: 1,
    title: "Dompet Hilang",
    description: "Dompet cokelat",
    status: "lost",
    is_completed: 0,
    cover: "https://example.com/1.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
  },
  {
    id: 2,
    title: "Kunci Ditemukan",
    description: "Kunci motor Honda",
    status: "found",
    is_completed: 1,
    cover: null,
    created_at: "2024-02-27T02:34:26.000000Z",
  },
  {
    id: 3,
    title: null,
    description: null,
    status: "lost",
    is_completed: 1,
    cover: null,
    created_at: "2024-02-28T02:34:26.000000Z",
  },
];

const profile = { id: 1, name: "Abdullah" };

describe("HomePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
    window.history.pushState({}, "", "/");
    vi.spyOn(lostFoundAction, "asyncSetLostFounds").mockReturnValue(() => Promise.resolve());
  });

  it("should render nothing when profile is missing", () => {
    const { container } = renderWithProviders(<HomePage />, {
      preloadedState: { profile: null, lostFounds: [] },
    });
    expect(container.firstChild).toBeNull();
  });

  it("should fetch lost founds and show summary counts", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items },
    });
    await waitFor(() => expect(lostFoundAction.asyncSetLostFounds).toHaveBeenCalled());

    expect(screen.getByTestId("summary-total")).toHaveTextContent("3");
    expect(screen.getByTestId("summary-lost")).toHaveTextContent("2");
    expect(screen.getByTestId("summary-found")).toHaveTextContent("1");
    expect(screen.getByTestId("summary-completed")).toHaveTextContent("2");
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();
    expect(screen.getByAltText("Dompet Hilang")).toBeInTheDocument();
  });

  it("should show empty state when there are no reports", async () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: [] },
    });
    expect(await screen.findByText("Belum ada laporan yang cocok.")).toBeInTheDocument();
  });

  it("should show loading indicator while fetching", async () => {
    let resolveFetch;
    lostFoundAction.asyncSetLostFounds.mockReturnValue(
      () => new Promise((resolve) => (resolveFetch = resolve))
    );
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: [] },
    });
    expect(screen.getByText("Memuat daftar laporan...")).toBeInTheDocument();
    await act(async () => resolveFetch());
    expect(await screen.findByText("Belum ada laporan yang cocok.")).toBeInTheDocument();
  });

  it("should not update state if unmounted before fetch finishes", async () => {
    let resolveFetch;
    lostFoundAction.asyncSetLostFounds.mockReturnValue(
      () => new Promise((resolve) => (resolveFetch = resolve))
    );
    const { unmount } = renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: [] },
    });
    unmount();
    await act(async () => resolveFetch());
  });

  it("should filter by status, completion and keyword", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items },
    });

    fireEvent.click(screen.getByTestId("filter-status-found-btn"));
    expect(screen.queryByTestId("lost-found-row-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("lost-found-row-2")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-status-all-btn"));
    fireEvent.click(screen.getByTestId("filter-completed-0-btn"));
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-row-2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-completed-1-btn"));
    expect(screen.queryByTestId("lost-found-row-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("lost-found-row-2")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-completed-all-btn"));
    const search = screen.getByTestId("search-lost-found-input");
    fireEvent.change(search, { target: { value: "honda" } });
    expect(screen.getByTestId("lost-found-row-2")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-row-1")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "dompet" } });
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();

    // item with null title/description is excluded by keyword
    expect(screen.queryByTestId("lost-found-row-3")).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: "" } });
    expect(screen.getByTestId("lost-found-row-3")).toBeInTheDocument();
  });

  it("should switch between table and card layout", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items },
    });

    fireEvent.click(screen.getByTestId("layout-card-btn"));
    expect(screen.getByTestId("lost-found-cards")).toBeInTheDocument();
    expect(screen.getByTestId("lost-found-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("lost-found-card-2")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("layout-table-btn"));
    expect(screen.queryByTestId("lost-found-cards")).not.toBeInTheDocument();
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();
  });

  it("should open and close add modal", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items },
    });
    fireEvent.click(screen.getByTestId("add-lost-found-btn"));
    expect(screen.getByTestId("add-lost-found-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(screen.queryByTestId("add-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should navigate to detail page", () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items },
    });
    fireEvent.click(screen.getByTestId("view-lost-found-1"));
    expect(mockNavigate).toHaveBeenCalledWith("/lost-founds/1");
  });

  it("should open and close edit modal", () => {
    vi.spyOn(lostFoundAction, "asyncSetLostFound").mockReturnValue(() => {});
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items, lostFound: items[0] },
    });
    fireEvent.click(screen.getByTestId("edit-lost-found-1"));
    expect(screen.getByTestId("edit-lost-found-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should delete after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    const deleteSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundDelete")
      .mockReturnValue(() => {});
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items },
    });
    fireEvent.click(screen.getByTestId("delete-lost-found-1"));
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith(1));
  });

  it("should not delete when cancelled", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: false });
    const deleteSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundDelete")
      .mockReturnValue(() => {});
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items },
    });
    fireEvent.click(screen.getByTestId("delete-lost-found-1"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should refresh the list after a report is deleted", () => {
    const { store } = renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items, isLostFoundDelete: true, isLostFoundDeleted: true },
    });
    expect(store.getState().isLostFoundDeleted).toBe(false);
    expect(lostFoundAction.asyncSetLostFounds.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should not refresh list when delete failed", () => {
    const { store } = renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items, isLostFoundDelete: true, isLostFoundDeleted: false },
    });
    expect(store.getState().isLostFoundDelete).toBe(false);
  });

  it("should render the statistics panel when view=stats", () => {
    window.history.pushState({}, "", "/?view=stats");
    vi.spyOn(lostFoundAction, "asyncSetLostFoundStats").mockReturnValue(() => Promise.resolve());
    renderWithProviders(<HomePage />, {
      preloadedState: { profile, lostFounds: items },
    });
    expect(screen.getByTestId("stats-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("add-lost-found-btn")).not.toBeInTheDocument();
  });
});
