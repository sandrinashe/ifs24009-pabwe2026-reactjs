import { describe, it, expect, vi, beforeEach } from "vitest";
import lostFoundApi from "./lostFoundApi";
import apiHelper from "../../../helpers/apiHelper";

describe("lostFoundApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postLostFound", () => {
    it("should create new lostFound and return data", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { lost_found_id: 10 },
        }),
      });

      const res = await lostFoundApi.postLostFound("Title", "Description", "lost");
      expect(res).toEqual({ lost_found_id: 10 });
    });

    it("should throw error if creation fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      });

      await expect(lostFoundApi.postLostFound("", "", "lost")).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(lostFoundApi.postLostFound("", "", "lost")).rejects.toThrow("Gagal menambahkan laporan");
    });
  });

  describe("postLostFoundCover", () => {
    it("should upload cover with FormData and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah cover",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      const msg = await lostFoundApi.postLostFoundCover(1, dummyFile);
      expect(msg).toBe("Berhasil mengubah cover");
    });

    it("should handle cover file without name property properly", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil",
        }),
      });

      const dummyBlob = new Blob(["dummy"], { type: "image/jpeg" });
      const msg = await lostFoundApi.postLostFoundCover(1, dummyBlob);
      expect(msg).toBe("Berhasil");
    });

    it("should throw error on upload cover fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Format tidak didukung",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(lostFoundApi.postLostFoundCover(1, dummyFile)).rejects.toThrow(
        "Format tidak didukung"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(lostFoundApi.postLostFoundCover(1, dummyFile)).rejects.toThrow(
        "Gagal mengubah cover"
      );
    });
  });

  describe("putLostFound", () => {
    it("should update lostFound and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      });

      const msg = await lostFoundApi.putLostFound(1, "Updated", "Desc", "found", true);
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should correctly handle boolean false for is_completed", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      });

      const msg = await lostFoundApi.putLostFound(1, "Updated", "Desc", "lost", false);
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should throw error on update failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal update laporan",
        }),
      });

      await expect(lostFoundApi.putLostFound(1, "", "", "lost", false)).rejects.toThrow("Gagal update laporan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(lostFoundApi.putLostFound(1, "", "", "lost", false)).rejects.toThrow("Gagal mengubah laporan");
    });
  });

  describe("getLostFounds", () => {
    it("should fetch all lostFounds without filter", async () => {
      const mockLostFounds = [{ id: 1, title: "LostFound 1" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { lost_founds: mockLostFounds },
        }),
      });

      const lostFounds = await lostFoundApi.getLostFounds();
      expect(lostFounds).toEqual(mockLostFounds);
      expect(apiHelper.fetchData.mock.calls[0][0]).toMatch(/\/lost-founds\/$/);
    });

    it("should fetch filtered lostFounds when filter parameters provided", async () => {
      const mockLostFounds = [{ id: 2, title: "LostFound 2", is_completed: 1 }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { lost_founds: mockLostFounds },
        }),
      });

      const lostFounds = await lostFoundApi.getLostFounds({
        status: "lost",
        is_completed: 1,
        is_me: 1,
        keyword: "",
        other: null,
        skip: undefined,
      });
      expect(lostFounds).toEqual(mockLostFounds);
      expect(apiHelper.fetchData.mock.calls[0][0]).toMatch(
        /\/lost-founds\/\?status=lost&is_completed=1&is_me=1$/
      );
    });

    it("should return empty array if data.lostFounds is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {},
        }),
      });

      const lostFounds = await lostFoundApi.getLostFounds();
      expect(lostFounds).toEqual([]);
    });

    it("should throw error on fetch lostFounds fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Akses tidak diizinkan",
        }),
      });

      await expect(lostFoundApi.getLostFounds()).rejects.toThrow("Akses tidak diizinkan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(lostFoundApi.getLostFounds()).rejects.toThrow("Gagal mengambil data laporan");
    });
  });

  describe("getLostFoundById", () => {
    it("should return single lostFound object on success", async () => {
      const mockLostFound = { id: 5, title: "Single" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { lost_found: mockLostFound },
        }),
      });

      const res = await lostFoundApi.getLostFoundById(5);
      expect(res).toEqual(mockLostFound);
    });

    it("should throw error on detail fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Laporan tidak ditemukan",
        }),
      });

      await expect(lostFoundApi.getLostFoundById(999)).rejects.toThrow("Laporan tidak ditemukan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(lostFoundApi.getLostFoundById(999)).rejects.toThrow("Gagal mengambil detail laporan");
    });
  });

  describe("deleteLostFound", () => {
    it("should delete lostFound and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus data",
        }),
      });

      const msg = await lostFoundApi.deleteLostFound(1);
      expect(msg).toBe("Berhasil menghapus data");
    });

    it("should throw error on delete fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus",
        }),
      });

      await expect(lostFoundApi.deleteLostFound(1)).rejects.toThrow("Gagal menghapus");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(lostFoundApi.deleteLostFound(1)).rejects.toThrow("Gagal menghapus laporan");
    });
  });

  describe("getLostFoundStats", () => {
    const stats = { stats_losts: [{ date: "2026-01-01", total: 2 }] };

    it("should fetch daily stats by default", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: stats }),
      });

      const res = await lostFoundApi.getLostFoundStats();
      expect(res).toEqual(stats);
      expect(apiHelper.fetchData.mock.calls[0][0]).toMatch(/\/lost-founds\/stats\/daily$/);
    });

    it("should fetch monthly stats with query params", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: stats }),
      });

      const res = await lostFoundApi.getLostFoundStats("monthly", {
        end_date: "2026-06-30",
        total_data: 6,
      });
      expect(res).toEqual(stats);
      expect(apiHelper.fetchData.mock.calls[0][0]).toMatch(
        /\/lost-founds\/stats\/monthly\?end_date=2026-06-30&total_data=6$/
      );
    });

    it("should return null when data is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success" }),
      });

      expect(await lostFoundApi.getLostFoundStats()).toBeNull();
    });

    it("should throw error on stats failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Tidak diizinkan" }),
      });

      await expect(lostFoundApi.getLostFoundStats()).rejects.toThrow("Tidak diizinkan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      });

      await expect(lostFoundApi.getLostFoundStats()).rejects.toThrow(
        "Gagal mengambil data statistik"
      );
    });
  });
});
