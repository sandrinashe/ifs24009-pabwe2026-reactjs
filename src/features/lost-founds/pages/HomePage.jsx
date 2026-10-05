import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddModal from "../modals/AddModal";
import ChangeModal from "../modals/ChangeModal";
import StatsPanel from "../components/StatsPanel";
import {
  asyncSetIsLostFoundDelete,
  asyncSetLostFounds,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
import {
  IconPlus,
  IconListDetails,
  IconSearch,
  IconPackage,
  IconCircleCheck,
  IconEye,
  IconPencil,
  IconTrash,
  IconFilter,
  IconLoader2,
  IconLayoutGrid,
  IconTable,
} from "@tabler/icons-react";

const STATUS_FILTERS = [
  { key: "", label: "Semua" },
  { key: "lost", label: "Hilang" },
  { key: "found", label: "Ditemukan" },
];

const COMPLETED_FILTERS = [
  { key: "", label: "Semua" },
  { key: "0", label: "Proses" },
  { key: "1", label: "Selesai" },
];

function StatusBadge({ status }) {
  return status === "lost" ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
      Hilang
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
      Ditemukan
    </span>
  );
}

function CompletedBadge({ isCompleted }) {
  return isCompleted ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Selesai
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Proses
    </span>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const profile = useSelector((state) => state.profile);
  const lostFounds = useSelector((state) => state.lostFounds);
  const isLostFoundDelete = useSelector((state) => state.isLostFoundDelete);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [loadingList, setLoadingList] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [completedFilter, setCompletedFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState("table");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingList(true);
    Promise.resolve(dispatch(asyncSetLostFounds())).finally(() => {
      if (isMounted) setLoadingList(false);
    });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (isLostFoundDelete) {
      dispatch(setIsLostFoundDeleteActionCreator(false));
      if (isLostFoundDeleted) {
        dispatch(setIsLostFoundDeletedActionCreator(false));
        dispatch(asyncSetLostFounds());
      }
    }
  }, [isLostFoundDelete, isLostFoundDeleted, dispatch]);

  if (!profile) return null;

  if (searchParams.get("view") === "stats") {
    return (
      <div className="animate-in fade-in duration-300">
        <StatsPanel />
      </div>
    );
  }

  async function handleDelete(lostFoundId) {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus laporan ini?"
    );
    if (result.isConfirmed) {
      dispatch(asyncSetIsLostFoundDelete(lostFoundId));
    }
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredList = lostFounds.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (completedFilter && String(item.is_completed ? 1 : 0) !== completedFilter) {
      return false;
    }
    if (!query) return true;
    const title = (item.title || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    return title.includes(query) || description.includes(query);
  });

  const totalCount = lostFounds.length;
  const lostCount = lostFounds.filter((i) => i.status === "lost").length;
  const foundCount = lostFounds.filter((i) => i.status === "found").length;
  const completedCount = lostFounds.filter((i) => i.is_completed).length;

  const summaryCards = [
    {
      key: "total",
      label: "Total Laporan",
      value: totalCount,
      valueClass: "text-slate-800",
      boxClass: "bg-indigo-50 text-indigo-600",
      icon: IconListDetails,
    },
    {
      key: "lost",
      label: "Barang Hilang",
      value: lostCount,
      valueClass: "text-rose-600",
      boxClass: "bg-rose-50 text-rose-600",
      icon: IconSearch,
    },
    {
      key: "found",
      label: "Barang Ditemukan",
      value: foundCount,
      valueClass: "text-sky-600",
      boxClass: "bg-sky-50 text-sky-600",
      icon: IconPackage,
    },
    {
      key: "completed",
      label: "Selesai",
      value: completedCount,
      valueClass: "text-emerald-600",
      boxClass: "bg-emerald-50 text-emerald-600",
      icon: IconCircleCheck,
    },
  ];

  function renderActions(item) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          data-testid={`view-lost-found-${item.id}`}
          onClick={() => navigate(`/lost-founds/${item.id}`)}
          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Lihat Detail"
        >
          <IconEye size={18} />
        </button>
        <button
          type="button"
          data-testid={`edit-lost-found-${item.id}`}
          onClick={() => {
            setSelectedId(item.id);
            setShowChangeModal(true);
          }}
          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          title="Ubah Laporan"
        >
          <IconPencil size={18} />
        </button>
        <button
          type="button"
          data-testid={`delete-lost-found-${item.id}`}
          onClick={() => handleDelete(item.id)}
          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Hapus Laporan"
        >
          <IconTrash size={18} />
        </button>
      </div>
    );
  }

  function renderSegment(testPrefix, options, value, onChange) {
    return (
      <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
        {options.map((option) => (
          <button
            key={option.key || "all"}
            type="button"
            data-testid={`${testPrefix}-${option.key || "all"}-btn`}
            onClick={() => onChange(option.key)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              value === option.key
                ? "bg-white text-slate-900 shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  const isEmpty = filteredList.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laporan Lost &amp; Founds
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Kelola dan pantau laporan barang hilang dan barang temuan.
          </p>
        </div>
        <button
          type="button"
          data-testid="add-lost-found-btn"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <IconPlus size={18} stroke={2.5} />
          <span>Tambah Laporan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              data-testid={`summary-${card.key}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {card.label}
                </p>
                <h2 className={`text-3xl font-black mt-1 ${card.valueClass}`}>
                  {card.value}
                </h2>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.boxClass}`}
              >
                <Icon size={26} stroke={2} />
              </div>
            </div>
          );
        })}
      </div>

      {/* List & Controls Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <IconSearch
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              />
              <input
                type="text"
                data-testid="search-lost-found-input"
                aria-label="Cari laporan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau deskripsi laporan..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 self-start">
              <button
                type="button"
                data-testid="layout-table-btn"
                onClick={() => setLayout("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  layout === "table" ? "bg-white text-slate-900 shadow-xs" : ""
                }`}
              >
                <IconTable size={16} /> Tabel
              </button>
              <button
                type="button"
                data-testid="layout-card-btn"
                onClick={() => setLayout("card")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  layout === "card" ? "bg-white text-slate-900 shadow-xs" : ""
                }`}
              >
                <IconLayoutGrid size={16} /> Kartu
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <IconFilter size={16} /> Jenis:
              </span>
              {renderSegment("filter-status", STATUS_FILTERS, statusFilter, setStatusFilter)}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Penyelesaian:
              </span>
              {renderSegment(
                "filter-completed",
                COMPLETED_FILTERS,
                completedFilter,
                setCompletedFilter
              )}
            </div>
          </div>
        </div>

        {loadingList && isEmpty ? (
          <div className="px-6 py-12 text-center text-slate-600">
            <IconLoader2 size={36} className="mx-auto text-indigo-600 animate-spin mb-2" />
            <p className="font-medium text-slate-600">Memuat daftar laporan...</p>
          </div>
        ) : isEmpty ? (
          <div className="px-6 py-12 text-center text-slate-600">
            <IconListDetails size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-medium">Belum ada laporan yang cocok.</p>
          </div>
        ) : layout === "card" ? (
          <div
            data-testid="lost-found-cards"
            className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredList.map((item) => (
              <div
                key={`lost-found-${item.id}`}
                data-testid={`lost-found-card-${item.id}`}
                className="rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {item.cover && (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <CompletedBadge isCompleted={item.is_completed} />
                  </div>
                  <p className="font-semibold text-slate-800 leading-snug">{item.title}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  <p className="text-xs text-slate-600 mt-auto pt-2">
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="px-4 pb-3 text-right">{renderActions(item)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-center w-16">ID</th>
                  <th className="px-5 py-3.5">Judul</th>
                  <th className="px-5 py-3.5">Jenis</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Dilaporkan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr
                    key={`lost-found-${item.id}`}
                    data-testid={`lost-found-row-${item.id}`}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-5 py-4 text-center font-mono text-xs font-bold text-slate-600">
                      #{item.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.cover && (
                          <img
                            src={item.cover}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 leading-snug">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-xs text-slate-600">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <CompletedBadge isCompleted={item.is_completed} />
                    </td>
                    <td className="px-5 py-4 text-right">{renderActions(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddModal show={showAddModal} onClose={() => setShowAddModal(false)} />
      <ChangeModal
        show={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        lostFoundId={selectedId}
      />
    </div>
  );
}

export default HomePage;
