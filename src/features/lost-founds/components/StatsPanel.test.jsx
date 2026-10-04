import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import StatsPanel, { toSeries } from "./StatsPanel";
import { renderWithProviders } from "../../../test-utils";
import * as lostFoundAction from "../states/action";

describe("toSeries", () => {
  it("should return empty array for non array input", () => {
    expect(toSeries(undefined)).toEqual([]);
    expect(toSeries(null)).toEqual([]);
  });

  it("should normalize labels and totals", () => {
    expect(
      toSeries([
        { date: "2024-10-01", total: 3 },
        { month: "2024-10", count: 2 },
        { label: "X" },
        {},
      ])
    ).toEqual([
      { label: "2024-10-01", total: 3 },
      { label: "2024-10", total: 2 },
      { label: "X", total: 0 },
      { label: "-", total: 0 },
    ]);
  });
});

describe("StatsPanel", () => {
  const stats = {
    stats_losts: [
      { date: "2024-10-01", total: 3 },
      { date: "2024-10-02", total: 1 },
    ],
    stats_losts_completed: [],
    stats_losts_process: [{ date: "2024-10-01", total: 2 }],
    stats_founds: [{ month: "2024-10", total: 4 }],
    stats_founds_completed: [{ label: "A", total: 1 }],
    stats_founds_process: null,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should request daily stats first and render cards", async () => {
    const spy = vi
      .spyOn(lostFoundAction, "asyncSetLostFoundStats")
      .mockReturnValue(() => Promise.resolve());
    renderWithProviders(<StatsPanel />, {
      preloadedState: { lostFoundStats: stats },
    });

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith("daily", expect.objectContaining({ total_data: 7 }))
    );
    expect(screen.getByTestId("stats-card-stats_losts")).toHaveTextContent("4");
    expect(screen.getByTestId("stats-card-stats_losts_completed")).toHaveTextContent(
      "Belum ada data."
    );
    expect(screen.getByTestId("stats-card-stats_founds_process")).toHaveTextContent(
      "Belum ada data."
    );
  });

  it("should switch to monthly period", async () => {
    const spy = vi
      .spyOn(lostFoundAction, "asyncSetLostFoundStats")
      .mockReturnValue(() => Promise.resolve());
    renderWithProviders(<StatsPanel />, {
      preloadedState: { lostFoundStats: stats },
    });
    fireEvent.click(screen.getByTestId("stats-period-monthly"));
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith("monthly", expect.objectContaining({ total_data: 6 }))
    );
  });

  it("should show loading text while stats are fetched", async () => {
    let resolveFetch;
    vi.spyOn(lostFoundAction, "asyncSetLostFoundStats").mockReturnValue(
      () => new Promise((resolve) => (resolveFetch = resolve))
    );
    renderWithProviders(<StatsPanel />, { preloadedState: { lostFoundStats: null } });
    expect(screen.getByText("Memuat statistik...")).toBeInTheDocument();
    await act(async () => resolveFetch());
    expect(await screen.findByTestId("stats-empty")).toBeInTheDocument();
  });

  it("should ignore completion after unmount", async () => {
    let resolveFetch;
    vi.spyOn(lostFoundAction, "asyncSetLostFoundStats").mockReturnValue(
      () => new Promise((resolve) => (resolveFetch = resolve))
    );
    const { unmount } = renderWithProviders(<StatsPanel />, {
      preloadedState: { lostFoundStats: null },
    });
    unmount();
    await act(async () => resolveFetch());
  });
});
