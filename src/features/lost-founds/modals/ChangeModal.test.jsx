import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

describe("ChangeModal", () => {
  const mockLostFound = {
    id: 1,
    title: "Initial Title",
    description: "Initial Desc",
    status: "lost",
    is_completed: 0,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(lostFoundAction, "asyncSetLostFound").mockReturnValue(() => {});
  });

  function openModal(onClose = vi.fn(), preloadedState = { lostFound: mockLostFound }) {
    return renderWithProviders(
      <ChangeModal show={true} onClose={onClose} lostFoundId={1} />,
      { preloadedState }
    );
  }

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(
      <ChangeModal show={false} onClose={vi.fn()} lostFoundId={1} />
    );
    expect(container.firstChild).toBeNull();
    expect(lostFoundAction.asyncSetLostFound).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should not fetch detail when lostFoundId is missing", () => {
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} />);
    expect(lostFoundAction.asyncSetLostFound).not.toHaveBeenCalled();
  });

  it("should fetch and populate inputs, then handle changes", () => {
    openModal();
    expect(lostFoundAction.asyncSetLostFound).toHaveBeenCalledWith(1);

    const title = screen.getByTestId("edit-lost-found-title-input");
    const desc = screen.getByTestId("edit-lost-found-description-input");
    const status = screen.getByTestId("edit-lost-found-status-select");
    const toggle = screen.getByTestId("edit-lost-found-completed-toggle");

    expect(title.value).toBe("Initial Title");
    expect(desc.value).toBe("Initial Desc");
    expect(status.value).toBe("lost");
    expect(toggle.checked).toBe(false);

    fireEvent.change(title, { target: { value: "New Title" } });
    fireEvent.change(desc, { target: { value: "New Desc" } });
    fireEvent.change(status, { target: { value: "found" } });
    fireEvent.click(toggle);

    expect(title.value).toBe("New Title");
    expect(desc.value).toBe("New Desc");
    expect(status.value).toBe("found");
    expect(toggle.checked).toBe(true);
  });

  it("should fall back to defaults when lostFound fields are empty", () => {
    openModal(vi.fn(), {
      lostFound: { id: 1, title: null, description: null, status: null, is_completed: 1 },
    });
    expect(screen.getByTestId("edit-lost-found-title-input").value).toBe("");
    expect(screen.getByTestId("edit-lost-found-description-input").value).toBe("");
    expect(screen.getByTestId("edit-lost-found-status-select").value).toBe("lost");
    expect(screen.getByTestId("edit-lost-found-completed-toggle").checked).toBe(true);
  });

  it("should validate empty title and empty description", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    openModal();
    const form = screen.getByTestId("edit-lost-found-modal").querySelector("form");

    fireEvent.change(screen.getByTestId("edit-lost-found-title-input"), { target: { value: "  " } });
    fireEvent.submit(form);
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    fireEvent.change(screen.getByTestId("edit-lost-found-title-input"), { target: { value: "Ok" } });
    fireEvent.change(screen.getByTestId("edit-lost-found-description-input"), { target: { value: " " } });
    fireEvent.submit(form);
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch change with is_completed 0 and 1", () => {
    const changeSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundChange")
      .mockReturnValue(() => {});
    openModal();
    const form = screen.getByTestId("edit-lost-found-modal").querySelector("form");

    fireEvent.submit(form);
    expect(changeSpy).toHaveBeenLastCalledWith(1, "Initial Title", "Initial Desc", "lost", 0);
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-lost-found-completed-toggle"));
    fireEvent.submit(form);
    expect(changeSpy).toHaveBeenLastCalledWith(1, "Initial Title", "Initial Desc", "lost", 1);
  });

  it("should close and refresh list when change succeeded", () => {
    const onClose = vi.fn();
    vi.spyOn(lostFoundAction, "asyncSetLostFounds").mockReturnValue(() => {});
    const { store } = openModal(onClose, {
      lostFound: mockLostFound,
      isLostFoundChange: true,
      isLostFoundChanged: true,
    });
    expect(onClose).toHaveBeenCalled();
    expect(store.getState().isLostFoundChange).toBe(false);
    expect(store.getState().isLostFoundChanged).toBe(false);
  });

  it("should stay open when change failed", () => {
    const onClose = vi.fn();
    openModal(onClose, {
      lostFound: mockLostFound,
      isLostFoundChange: true,
      isLostFoundChanged: false,
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("edit-lost-found-modal")).toBeInTheDocument();
  });

  it("should close modal when close or cancel clicked", () => {
    const onClose = vi.fn();
    openModal(onClose);
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
