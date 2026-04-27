"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NavItem = { label: string; href: string; icon: string };

const navByRole: Record<string, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "Overview", href: "/admin/overview", icon: "bar_chart" },
    { label: "Courses", href: "/instructor/courses", icon: "play_circle" },
    { label: "Users", href: "/admin/users", icon: "group" },
  ],
  instructor: [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "My Courses", href: "/instructor/courses", icon: "play_circle" },
    { label: "Grades", href: "/instructor/grades", icon: "grade" },
  ],
  student: [
    { label: "Home", href: "/dashboard", icon: "home" },
    { label: "My Courses", href: "/courses", icon: "play_circle" },
  ],
};

function NavLinks({
  nav,
  pathname,
  onNav,
}: {
  nav: NavItem[];
  pathname: string;
  onNav?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-0.5 px-3">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNav}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              active
                ? "bg-indigo-600 text-white font-semibold"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-medium",
            )}
          >
            <span
              className={cn(
                "material-symbols-outlined text-[20px]",
                active ? "text-white" : "text-zinc-400",
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const nav = navByRole[role] || navByRole.student;
  const [open, setOpen] = useState(false);

  const logo = (
    <div className="px-4 py-5 flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/METALOGICS-SVG-02.png"
        alt="MetaLogics"
        className="h-7 w-auto object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );

  const bottom = (
    <div className="px-3 pb-4 space-y-0.5 border-t border-zinc-100 pt-3">
      <Link
        href="#"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">settings</span>
        Settings
      </Link>
      <div className="px-3 pt-2">
        <p className="text-[10px] font-semibold text-zinc-300 uppercase tracking-widest">
          {role}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-zinc-200 shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined text-zinc-600 text-[20px]">
          menu
        </span>
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-zinc-100 flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between pr-3">
          {logo}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-zinc-100"
          >
            <span className="material-symbols-outlined text-zinc-400 text-[20px]">
              close
            </span>
          </button>
        </div>
        <NavLinks nav={nav} pathname={pathname} onNav={() => setOpen(false)} />
        {bottom}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-zinc-100 flex-col h-screen sticky top-0">
        {logo}
        <NavLinks nav={nav} pathname={pathname} />
        {bottom}
      </aside>
    </>
  );
}
