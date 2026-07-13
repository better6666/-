import { BarChart3, Globe2, LayoutDashboard } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "总览", icon: LayoutDashboard },
  { to: "/compare", label: "对比", icon: BarChart3 },
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.18),_transparent_35%),linear-gradient(180deg,_#03111f_0%,_#071827_55%,_#020812_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10">
                <Globe2 className="h-5 w-5 text-cyan-200" />
              </span>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-cyan-200/75">
                  Global Index Board
                </p>
                <h1 className="font-serif text-2xl text-white">国家指数年度涨幅看板</h1>
              </div>
            </Link>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-50"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30 hover:text-white",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
