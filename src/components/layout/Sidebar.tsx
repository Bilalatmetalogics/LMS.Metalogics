"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NavItem = { label: string; href: string; icon: string };

const navByRole: Record<string, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Overview", href: "/admin/overview", icon: "analytics" },
    { label: "Courses", href: "/instructor/courses", icon: "school" },
    { label: "Users", href: "/admin/users", icon: "group" },
  ],
  instructor: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Courses", href: "/instructor/courses", icon: "school" },
    { label: "Grades", href: "/instructor/grades", icon: "grade" },
  ],
  student: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Courses", href: "/courses", icon: "auto_stories" },
  ],
};

const roleLabel: Record<string, string> = {
  admin: "Admin Console",
  instructor: "Instructor",
  student: "Student",
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
    <nav className="flex-1 flex flex-col gap-1">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNav}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
              active
                ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-200"
                : "text-zinc-600 hover:bg-zinc-200/50",
            )}
          >
            <span className="material-symbols-outlined text-[20px]">
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

  const logoBlock = (
    <div className="mb-8 px-2 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/METALOGICS-White.png"
          alt="MetaLogics"
          className="w-8 h-8 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div>
        <h1 className="text-[15px] font-black tracking-tight text-[#3525cd] leading-tight">
          MetaLogics
        </h1>
        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
          {roleLabel[role] || role}
        </span>
      </div>
    </div>
  );

  const bottomLinks = (
    <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-zinc-200/50">
      {[
        { label: "Settings", icon: "settings", href: "#" },
        { label: "Help", icon: "help", href: "#" },
      ].map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:bg-zinc-200/50 rounded-lg text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
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

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-[224px] bg-zinc-50 flex flex-col p-4 gap-2 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between mb-0">
          {logoBlock}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-zinc-100 mb-8"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-zinc-500 text-[20px]">
              close
            </span>
          </button>
        </div>
        <NavLinks nav={nav} pathname={pathname} onNav={() => setOpen(false)} />
        {bottomLinks}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[224px] shrink-0 bg-zinc-50 flex-col p-4 gap-2 h-screen sticky top-0">
        {logoBlock}
        <NavLinks nav={nav} pathname={pathname} />
        {bottomLinks}
      </aside>
    </>
  );
}
