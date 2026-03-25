"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const navByRole: Record<string, NavItem[]> = {
  admin: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Courses",
      href: "/courses",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <Users className="w-4 h-4" />,
    },
  ],
  instructor: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "My Courses",
      href: "/instructor/courses",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: "Grades",
      href: "/instructor/grades",
      icon: <ClipboardList className="w-4 h-4" />,
    },
  ],
  student: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "My Courses",
      href: "/courses",
      icon: <BookOpen className="w-4 h-4" />,
    },
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
    <nav className="flex-1 px-2 py-3 space-y-0.5">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNav}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === item.href || pathname.startsWith(item.href + "/")
              ? "bg-indigo-50 text-indigo-700 font-medium"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
          )}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const nav = navByRole[role] || navByRole.student;
  const [open, setOpen] = useState(false);

  const logo = (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
        <GraduationCap className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-semibold text-zinc-900">
        MetaLogics-Trainings
      </span>
    </div>
  );

  const roleTag = (
    <div className="px-2 py-3 border-t border-zinc-200">
      <span className="px-3 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {role}
      </span>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="md:hidden fixed top-3.5 left-4 z-50 p-2 rounded-lg bg-white border border-zinc-200 shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4 text-zinc-600" />
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
          "md:hidden fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200">
          {logo}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-zinc-100"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        <NavLinks nav={nav} pathname={pathname} onNav={() => setOpen(false)} />
        {roleTag}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-zinc-200 bg-white flex-col">
        <div className="h-14 flex items-center px-4 border-b border-zinc-200">
          {logo}
        </div>
        <NavLinks nav={nav} pathname={pathname} />
        {roleTag}
      </aside>
    </>
  );
}
