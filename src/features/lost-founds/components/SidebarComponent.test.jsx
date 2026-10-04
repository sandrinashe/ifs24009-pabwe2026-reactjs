import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

describe("SidebarComponent", () => {
  it("should render navigation links properly", () => {
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );

    expect(screen.getByText("Dashboard / Laporan")).toBeInTheDocument();
    expect(screen.getByText("Statistik")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Profil Saya")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("should mark dashboard as active on root path", () => {
    window.history.pushState({}, "", "/");
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );
    expect(screen.getByTestId("nav-dashboard")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("nav-stats")).not.toHaveAttribute("aria-current");
  });

  it("should mark stats as active when view=stats", () => {
    window.history.pushState({}, "", "/?view=stats");
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );
    expect(screen.getByTestId("nav-stats")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("nav-dashboard")).not.toHaveAttribute("aria-current");
  });

  it("should mark dashboard active on detail path, users and profile", () => {
    window.history.pushState({}, "", "/lost-founds/3");
    const first = renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );
    expect(screen.getByTestId("nav-dashboard")).toHaveAttribute("aria-current", "page");
    first.unmount();

    window.history.pushState({}, "", "/users");
    const second = renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );
    expect(screen.getByTestId("nav-users")).toHaveAttribute("aria-current", "page");
    second.unmount();

    window.history.pushState({}, "", "/profile");
    renderWithProviders(
      <SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />
    );
    expect(screen.getByTestId("nav-profile")).toHaveAttribute("aria-current", "page");
    window.history.pushState({}, "", "/");
  });

  it("should render backdrop and call onCloseMobile when backdrop clicked on mobile", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(
      <SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />
    );

    const backdrop = screen.getByTestId("sidebar-backdrop");
    fireEvent.click(backdrop);
    expect(onCloseMobile).toHaveBeenCalled();
  });

  it("should call onCloseMobile when clicking navigation link", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(
      <SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />
    );

    fireEvent.click(screen.getByText("Pengguna"));
    expect(onCloseMobile).toHaveBeenCalled();
  });
});
