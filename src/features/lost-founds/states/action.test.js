import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setLostFoundsActionCreator,
  asyncSetLostFounds,
  setLostFoundActionCreator,
  setIsLostFoundActionCreator,
  asyncSetLostFound,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
  asyncSetIsLostFoundAdd,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangedActionCreator,
  asyncSetIsLostFoundChange,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  asyncSetIsLostFoundChangeCover,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
  asyncSetIsLostFoundDelete,
  setLostFoundStatsActionCreator,
  asyncSetLostFoundStats,
} from "./action";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("lostFounds action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create action objects correctly", () => {
    expect(setLostFoundsActionCreator([{ id: 1 }])).toEqual({
      type: ActionType.SET_LOST_FOUNDS,
      payload: [{ id: 1 }],
    });
    expect(setLostFoundActionCreator({ id: 1 })).toEqual({
      type: ActionType.SET_LOST_FOUND,
      payload: { id: 1 },
    });
    expect(setIsLostFoundActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND,
      payload: true,
    });
    expect(setIsLostFoundAddActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND_ADD,
      payload: true,
    });
    expect(setIsLostFoundAddedActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND_ADDED,
      payload: true,
    });
    expect(setIsLostFoundChangeActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND_CHANGE,
      payload: true,
    });
    expect(setIsLostFoundChangedActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND_CHANGED,
      payload: true,
    });
    expect(setIsLostFoundChangeCoverActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
      payload: true,
    });
    expect(setIsLostFoundChangedCoverActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
      payload: true,
    });
    expect(setIsLostFoundDeleteActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND_DELETE,
      payload: true,
    });
    expect(setIsLostFoundDeletedActionCreator(true)).toEqual({
      type: ActionType.SET_IS_LOST_FOUND_DELETED,
      payload: true,
    });
    expect(setLostFoundStatsActionCreator({ stats_losts: [] })).toEqual({
      type: ActionType.SET_LOST_FOUND_STATS,
      payload: { stats_losts: [] },
    });
  });

  describe("asyncSetLostFounds", () => {
    it("should dispatch setLostFoundsActionCreator on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue([{ id: 1 }]);

      await asyncSetLostFounds({ status: "lost" })(dispatch);

      expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({ status: "lost" });

      expect(dispatch).toHaveBeenCalledWith(setLostFoundsActionCreator([{ id: 1 }]));
    });

    it("should dispatch empty array on error", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "getLostFounds").mockRejectedValue(new Error("Err"));

      await asyncSetLostFounds()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setLostFoundsActionCreator([]));
    });
  });

  describe("asyncSetLostFound", () => {
    it("should dispatch setLostFoundActionCreator and setIsLostFound on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue({ id: 1 });

      await asyncSetLostFound(1)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setLostFoundActionCreator({ id: 1 }));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundActionCreator(true));
    });

    it("should dispatch null and setIsLostFound on error", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "getLostFoundById").mockRejectedValue(new Error("Err"));

      await asyncSetLostFound(99)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setLostFoundActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundActionCreator(true));
    });
  });

  describe("asyncSetIsLostFoundAdd", () => {
    it("should post lostFound, show success dialog, and dispatch success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "postLostFound").mockResolvedValue({ lost_found_id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncSetIsLostFoundAdd("Title", "Desc", "lost")(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Laporan berhasil ditambahkan!");
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundAddedActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundAddActionCreator(true));
    });

    it("should show error dialog and dispatch false on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "postLostFound").mockRejectedValue(new Error("Gagal tambah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await asyncSetIsLostFoundAdd("Title", "Desc", "lost")(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Gagal tambah");
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundAddedActionCreator(false));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundAddActionCreator(true));
    });
  });

  describe("asyncSetIsLostFoundChange", () => {
    it("should update lostFound, show success dialog, and dispatch success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "putLostFound").mockResolvedValue("Laporan diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncSetIsLostFoundChange(1, "Title", "Desc", "found", true)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Laporan diubah");
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangedActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangeActionCreator(true));
    });

    it("should use fallback success message when api returns empty string", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "putLostFound").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncSetIsLostFoundChange(1, "Title", "Desc", "found", true)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Laporan berhasil diperbarui!");
    });

    it("should show error dialog and dispatch false on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "putLostFound").mockRejectedValue(new Error("Gagal update"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await asyncSetIsLostFoundChange(1, "Title", "Desc", "found", true)(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Gagal update");
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangedActionCreator(false));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangeActionCreator(true));
    });
  });

  describe("asyncSetIsLostFoundChangeCover", () => {
    it("should upload cover, show success dialog, and dispatch success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "postLostFoundCover").mockResolvedValue("Cover diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await asyncSetIsLostFoundChangeCover(1, dummyFile)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Cover diubah");
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangedCoverActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangeCoverActionCreator(true));
    });

    it("should use fallback success message if empty", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "postLostFoundCover").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await asyncSetIsLostFoundChangeCover(1, dummyFile)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Cover berhasil diperbarui!");
    });

    it("should show error dialog and dispatch false on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "postLostFoundCover").mockRejectedValue(new Error("File corrupt"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await asyncSetIsLostFoundChangeCover(1, dummyFile)(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("File corrupt");
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangedCoverActionCreator(false));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangeCoverActionCreator(true));
    });
  });

  describe("asyncSetIsLostFoundDelete", () => {
    it("should delete lostFound, show success dialog, and dispatch success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "deleteLostFound").mockResolvedValue("Laporan dihapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncSetIsLostFoundDelete(1)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Laporan dihapus");
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundDeletedActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundDeleteActionCreator(true));
    });

    it("should use fallback success message if empty", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "deleteLostFound").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncSetIsLostFoundDelete(1)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Laporan berhasil dihapus!");
    });

    it("should show error dialog and dispatch false on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "deleteLostFound").mockRejectedValue(new Error("Gagal hapus"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await asyncSetIsLostFoundDelete(1)(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus");
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundDeletedActionCreator(false));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundDeleteActionCreator(true));
    });
  });

  describe("asyncSetLostFoundStats", () => {
    it("should dispatch stats on success", async () => {
      const dispatch = vi.fn();
      const stats = { stats_losts: [] };
      vi.spyOn(lostFoundApi, "getLostFoundStats").mockResolvedValue(stats);

      await asyncSetLostFoundStats("monthly", { total_data: 6 })(dispatch);

      expect(lostFoundApi.getLostFoundStats).toHaveBeenCalledWith("monthly", {
        total_data: 6,
      });
      expect(dispatch).toHaveBeenCalledWith(setLostFoundStatsActionCreator(stats));
    });

    it("should use defaults and dispatch null on error", async () => {
      const dispatch = vi.fn();
      vi.spyOn(lostFoundApi, "getLostFoundStats").mockRejectedValue(new Error("Err"));

      await asyncSetLostFoundStats()(dispatch);

      expect(lostFoundApi.getLostFoundStats).toHaveBeenCalledWith("daily", {});
      expect(dispatch).toHaveBeenCalledWith(setLostFoundStatsActionCreator(null));
    });
  });
});
