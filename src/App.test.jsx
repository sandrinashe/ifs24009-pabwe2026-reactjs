import { describe, it, expect, vi, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./test-utils";
import apiHelper from "./helpers/apiHelper";

const profile = { id: 1, name: "Tester", email: "t@example.com", photo: null };

describe("App Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render application without crashing", () => {
    const { container } = renderWithProviders(<App />);
    expect(container).toBeDefined();
  });

  it("should render 404 NotFoundPage for invalid route", () => {
    window.history.pushState({}, "Not Found", "/random-invalid-route");
    renderWithProviders(<App />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Halaman Tidak Ditemukan")).toBeInTheDocument();
  });

  it("should render the login page", () => {
    window.history.pushState({}, "", "/auth/login");
    renderWithProviders(<App />);
    expect(screen.getByText("Masuk Akun")).toBeInTheDocument();
  });

  it.each(["/", "/lost-founds/1", "/users", "/profile"])(
    "should lazy-load dashboard route %s",
    async (path) => {
      vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("token");
      vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
      window.history.pushState({}, "", path);
      renderWithProviders(<App />, { preloadedState: { profile } });
      expect(screen.getByText("Memuat halaman...")).toBeInTheDocument();
      expect(await screen.findAllByText("Tester", {}, { timeout: 5000 })).not.toHaveLength(0);
      vi.unstubAllGlobals();
    }
  );
});
