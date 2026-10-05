import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncSetLostFoundStats } from "../states/action";
import { IconChartBar } from "@tabler/icons-react";

const STAT_GROUPS = [
  { key: "stats_losts", label: "Barang Hilang", bar: "bg-rose-500" },
  { key: "stats_losts_completed", label: "Hilang - Selesai", bar: "bg-emerald-500" },
  { key: "stats_losts_process", label: "Hilang - Proses", bar: "bg-amber-500" },
  { key: "stats_founds", label: "Barang Ditemukan", bar: "bg-sky-500" },
  { key: "stats_founds_completed", label: "Ditemukan - Selesai", bar: "bg-emerald-500" },
  { key: "stats_founds_process", label: "Ditemukan - Proses", bar: "bg-amber-500" },
];

const PERIODS = [
  { key: "daily", label: "Harian", totalData: 7 },
  { key: "monthly", label: "Bulanan", totalData: 6 },
];

export function toSeries(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    label: String(item.date || item.month || item.label || "-"),
    total: Number(item.total ?? item.count ?? 0),
  }));
}

function StatsPanel() {
  const dispatch = useDispatch();
  const lostFoundStats = useSelector((state) => state.lostFoundStats);

  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const current = PERIODS.find((p) => p.key === period);
    setLoading(true);
    Promise.resolve(
      dispatch(
        asyncSetLostFoundStats(period, {
          end_date: new Date().toISOString().slice(0, 10),
          total_data: current.totalData,
        })
      )
    ).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [period, dispatch]);

  return (
    <div data-testid="stats-panel" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Statistik Laporan
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pantau tren laporan barang hilang dan ditemukan.
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 self-start sm:self-auto">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              data-testid={`stats-period-${p.key}`}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === p.key
                  ? "bg-white text-slate-900 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !lostFoundStats ? (
        <p className="py-12 text-center font-medium text-slate-600">
          Memuat statistik...
        </p>
      ) : !lostFoundStats ? (
        <div
          data-testid="stats-empty"
          className="py-12 text-center text-slate-600 bg-white rounded-2xl border border-slate-200/80"
        >
          <IconChartBar size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="font-medium">Data statistik belum tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {STAT_GROUPS.map((group) => {
            const series = toSeries(lostFoundStats[group.key]);
            const max = Math.max(1, ...series.map((s) => s.total));
            const sum = series.reduce((acc, s) => acc + s.total, 0);
            return (
              <div
                key={group.key}
                data-testid={`stats-card-${group.key}`}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-700">
                    {group.label}
                  </h2>
                  <span className="text-2xl font-black text-slate-800">{sum}</span>
                </div>
                {series.length === 0 ? (
                  <p className="text-xs text-slate-600">Belum ada data.</p>
                ) : (
                  <ul className="space-y-2">
                    {series.map((s, index) => (
                      <li key={`${s.label}-${index}`} className="flex items-center gap-3 text-xs">
                        <span className="w-24 shrink-0 text-slate-600 truncate">
                          {s.label}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${group.bar}`}
                            style={{ width: `${(s.total / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-semibold text-slate-700">
                          {s.total}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StatsPanel;
