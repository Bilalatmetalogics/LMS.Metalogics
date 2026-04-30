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
    {
      label: "Certificates",
      href: "/admin/certificates",
      icon: "workspace_premium",
    },
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
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
              active
                ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold border border-[var(--sidebar-primary)]/30"
                : "text-[var(--sidebar-foreground)] hover:text-white hover:bg-[var(--sidebar-accent)]/60 font-medium border border-transparent",
            )}
          >
            <span
              className={cn(
                "material-symbols-outlined text-[20px]",
                active
                  ? "text-[var(--sidebar-primary)]"
                  : "text-[var(--sidebar-foreground)]/60",
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
    <div className="px-4 py-5 flex items-center gap-2.5 border-b border-white/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/METALOGICS-White.png"
        alt="MetaLogics"
        className="h-7 w-auto object-contain"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = "none";
          el.parentElement!.innerHTML =
            '<span class="text-white font-black text-lg tracking-tight">metalogics</span>';
        }}
      />
    </div>
  );

  const bottom = (
    <div className="px-3 pb-4 space-y-0.5 border-t border-[var(--sidebar-border)] pt-3">
      <Link
        href="/settings/profile"
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border",
          pathname === "/settings/profile"
            ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold border-[var(--sidebar-primary)]/30"
            : "text-[var(--sidebar-foreground)]/60 hover:text-white hover:bg-[var(--sidebar-accent)]/60 border-transparent",
        )}
      >
        <span className="material-symbols-outlined text-[20px]">
          account_circle
        </span>
        Profile
      </Link>
      <Link
        href="/settings/password"
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border",
          pathname === "/settings/password"
            ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold border-[var(--sidebar-primary)]/30"
            : "text-[var(--sidebar-foreground)]/60 hover:text-white hover:bg-[var(--sidebar-accent)]/60 border-transparent",
        )}
      >
        <span className="material-symbols-outlined text-[20px]">key</span>
        Change Password
      </Link>
      <div className="px-3 pt-3">
        <span className="text-[10px] font-semibold text-[var(--sidebar-foreground)]/40 uppercase tracking-widest">
          {role}
        </span>
      </div>
    </div>
  );

  const sidebarClasses =
    "flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]";

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 border border-white/10 shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined text-slate-300 text-[20px]">
          menu
        </span>
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-56 flex flex-col transition-transform duration-200",
          sidebarClasses,
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between pr-3">
          {logo}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              close
            </span>
          </button>
        </div>
        <NavLinks nav={nav} pathname={pathname} onNav={() => setOpen(false)} />
        {bottom}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex w-56 shrink-0 flex-col h-screen sticky top-0",
          sidebarClasses,
        )}
      >
        {logo}
        <NavLinks nav={nav} pathname={pathname} />
        {bottom}
      </aside>
    </>
  );
}
