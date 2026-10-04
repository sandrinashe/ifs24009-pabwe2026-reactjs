import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ lostFoundId: "1" }),
  };
});

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockLostFound = {
    id: 1,
    title: "Dompet Hilang",
    description: "Dompet cokelat di kantin",
    status: "lost",
    is_completed: 1,
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    author: { name: "Budi", photo: "https://example.com/budi.jpg" },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
    vi.spyOn(lostFoundAction, "asyncSetLostFound").mockReturnValue(() => {});
  });

  it("should render loading spinner if profile or lostFound is missing", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: null, lostFound: null },
    });
    expect(screen.queryByText("Dompet Hilang")).not.toBeInTheDocument();
  });

  it("should render lost report details with cover, reporter, completion and dates", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: mockLostFound },
    });

    expect(lostFoundAction.asyncSetLostFound).toHaveBeenCalledWith("1");
    expect(screen.getByText("Dompet Hilang")).toBeInTheDocument();
    expect(screen.getByText("Dompet cokelat di kantin")).toBeInTheDocument();
    expect(screen.getByText("Barang Hilang")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByAltText("Dompet Hilang")).toHaveAttribute("src", mockLostFound.cover);
    expect(screen.getByAltText("Budi")).toBeInTheDocument();
  });

  it("should render found, unfinished badge and fallbacks without cover/author/description", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        lostFound: {
          ...mockLostFound,
          status: "found",
          is_completed: 0,
          cover: null,
          description: "",
          author: null,
        },
      },
    });

    expect(screen.getByText("Barang Ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Belum Selesai")).toBeInTheDocument();
    expect(screen.getByText("Tidak diketahui")).toBeInTheDocument();
    expect(screen.getByText("Tidak ada deskripsi rinci untuk laporan ini.")).toBeInTheDocument();
    expect(screen.queryByAltText("Dompet Hilang")).not.toBeInTheDocument();
  });

  it("should render author without photo using icon", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: {
        profile: mockProfile,
        lostFound: { ...mockLostFound, author: { name: "Sari", photo: null } },
      },
    });
    expect(screen.getByText("Sari")).toBeInTheDocument();
    expect(screen.queryByAltText("Sari")).not.toBeInTheDocument();
  });

  it("should open and close cover and edit modals", () => {
    vi.spyOn(lostFoundAction, "asyncSetLostFounds").mockReturnValue(() => {});
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: mockLostFound },
    });

    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-detail-lost-found-btn"));
    expect(screen.getByTestId("edit-lost-found-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should navigate home when detail loaded but lostFound is null", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: null, isLostFound: true },
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should stay when detail loaded and lostFound exists", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: mockLostFound, isLostFound: true },
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should navigate home after delete succeeded", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: mockLostFound, isLostFoundDelete: true, isLostFoundDeleted: true },
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should stay when delete failed", () => {
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: mockLostFound, isLostFoundDelete: true, isLostFoundDeleted: false },
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should dispatch delete when confirmed", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true });
    const deleteSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundDelete")
      .mockReturnValue(() => {});
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: mockLostFound },
    });

    fireEvent.click(screen.getByTestId("delete-detail-lost-found-btn"));
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith(1));
  });

  it("should not dispatch delete when cancelled", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: false });
    const deleteSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundDelete")
      .mockReturnValue(() => {});
    renderWithProviders(<DetailPage />, {
      preloadedState: { profile: mockProfile, lostFound: mockLostFound },
    });

    fireEvent.click(screen.getByTestId("delete-detail-lost-found-btn"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
