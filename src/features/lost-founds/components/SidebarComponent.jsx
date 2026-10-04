import { Link, useLocation } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconChartBar,
  IconUsers,
  IconUserCircle,
  IconChevronRight,
} from "@tabler/icons-react";

const navItems = [
  {
    key: "dashboard",
    to: "/",
    label: "Dashboard / Laporan",
    icon: IconLayoutDashboard,
    isActive: ({ pathname, view }) =>
      (pathname === "/" && view !== "stats") ||
      pathname.startsWith("/lost-founds"),
  },
  {
    key: "stats",
    to: "/?view=stats",
    label: "Statistik",
    icon: IconChartBar,
    isActive: ({ pathname, view }) => pathname === "/" && view === "stats",
  },
  {
    key: "users",
    to: "/users",
    label: "Pengguna",
    icon: IconUsers,
    isActive: ({ pathname }) => pathname.startsWith("/users"),
  },
  {
    key: "profile",
    to: "/profile",
    label: "Profil Saya",
    icon: IconUserCircle,
    isActive: ({ pathname }) => pathname.startsWith("/profile"),
  },
];

function SidebarComponent({ isSidebarOpen, onCloseMobile }) {
  const location = useLocation();
  const view = new URLSearchParams(location.search).get("view");

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          data-testid="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Menu Utama
              </p>
              <nav className="mt-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.isActive({
                    pathname: location.pathname,
                    view,
                  });
                  return (
                    <Link
                      key={item.key}
                      to={item.to}
                      data-testid={`nav-${item.key}`}
                      aria-current={active ? "page" : undefined}
                      onClick={onCloseMobile}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={20}
                          className={
                            active
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-600"
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {active && <IconChevronRight size={16} />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer note in sidebar */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/60">
            <p className="text-xs font-semibold text-indigo-900">
              Delcom Lost &amp; Founds
            </p>
            <p className="text-xs text-indigo-700/80 mt-0.5">
              Praktikum PABWE 2026
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;
