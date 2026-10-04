import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  asyncSetLostFound,
  asyncSetIsLostFoundDelete,
  setIsLostFoundActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import {
  IconArrowLeft,
  IconPhotoUp,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconSearch,
  IconPackage,
  IconUser,
} from "@tabler/icons-react";

function DetailPage() {
  const { lostFoundId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);
  const lostFound = useSelector((state) => state.lostFound);
  const isLostFound = useSelector((state) => state.isLostFound);
  const isLostFoundDelete = useSelector((state) => state.isLostFoundDelete);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    dispatch(asyncSetLostFound(lostFoundId));
  }, [lostFoundId, dispatch]);

  useEffect(() => {
    if (isLostFound) {
      dispatch(setIsLostFoundActionCreator(false));
      if (!lostFound) {
        navigate("/");
      }
    }
  }, [isLostFound, lostFound, navigate, dispatch]);

  useEffect(() => {
    if (isLostFoundDelete) {
      dispatch(setIsLostFoundDeleteActionCreator(false));
      if (isLostFoundDeleted) {
        dispatch(setIsLostFoundDeletedActionCreator(false));
        navigate("/");
      }
    }
  }, [isLostFoundDelete, isLostFoundDeleted, navigate, dispatch]);

  if (!profile || !lostFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  async function handleDelete() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus laporan ini?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsLostFoundDelete(lostFound.id));
    }
  }

  const isLost = lostFound.status === "lost";
  const author = lostFound.author;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Back button & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          data-testid="back-to-lost-founds-link"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft size={18} />
          Kembali ke Daftar Laporan
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="edit-cover-btn"
            onClick={() => setShowCoverModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
          >
            <IconPhotoUp size={16} />
            Ubah Cover
          </button>
          <button
            type="button"
            data-testid="edit-detail-lost-found-btn"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
          >
            <IconEdit size={16} />
            Ubah Data
          </button>
          <button
            type="button"
            data-testid="delete-detail-lost-found-btn"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
          >
            <IconTrash size={16} />
            Hapus
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {lostFound.cover && (
          <div className="w-full bg-slate-900 flex items-center justify-center">
            <img
              src={lostFound.cover}
              alt={lostFound.title}
              className="w-full max-h-[28rem] object-contain"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-slate-400">
                #{lostFound.id}
              </span>
              {isLost ? (
                <span
                  data-testid="detail-status-badge"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                >
                  <IconSearch size={14} />
                  Barang Hilang
                </span>
              ) : (
                <span
                  data-testid="detail-status-badge"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200"
                >
                  <IconPackage size={14} />
                  Barang Ditemukan
                </span>
              )}
              {lostFound.is_completed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <IconCircleCheck size={14} />
                  Selesai
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <IconClock size={14} />
                  Belum Selesai
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lostFound.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <div
                data-testid="detail-reporter"
                className="flex items-center gap-2"
              >
                {author?.photo ? (
                  <img
                    src={author.photo}
                    alt={author.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <IconUser size={14} className="shrink-0" />
                )}
                <span>
                  Pelapor:{" "}
                  <strong className="text-slate-500">
                    {author?.name || "Tidak diketahui"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCalendar size={14} className="shrink-0" />
                <span>
                  Dilaporkan:{" "}
                  <strong className="text-slate-500">
                    {formatDate(lostFound.created_at)}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCalendar size={14} className="shrink-0" />
                <span>
                  Diperbarui:{" "}
                  <strong className="text-slate-500">
                    {formatDate(lostFound.updated_at)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none text-slate-600 bg-slate-50/60 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
            {lostFound.description || "Tidak ada deskripsi rinci untuk laporan ini."}
          </div>
        </div>
      </div>

      {/* Cover Modal */}
      <ChangeCoverModal
        show={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        lostFound={lostFound}
      />

      {/* Edit Modal */}
      <ChangeModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        lostFoundId={lostFound.id}
      />
    </div>
  );
}

export default DetailPage;
