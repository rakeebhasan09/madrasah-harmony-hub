import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Baby,
  Blocks,
  BookOpen,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";
import { CLASSES } from "@/lib/madrasah-data";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  params?: Record<string, string>;
  icon: LucideIcon;
  exact?: boolean;
}

const classIcons: Record<string, LucideIcon> = {
  play: Blocks,
  nursery: Baby,
  one: BookOpen,
  two: BookOpen,
  three: BookOpen,
  four: BookOpen,
  hifz: GraduationCap,
};

const topItems: NavItem[] = [
  { label: "Overview", to: "/", icon: LayoutDashboard, exact: true },
];

const classItems: NavItem[] = CLASSES.map((c) => ({
  label: c.name,
  to: "/class/$classId",
  params: { classId: c.id },
  icon: classIcons[c.id] ?? BookOpen,
}));

const bottomItems: NavItem[] = [
  { label: "Teachers", to: "/teachers", icon: Users },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      params={item.params}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (item: NavItem) => {
    const target = item.params
      ? item.to.replace("$classId", item.params.classId)
      : item.to;
    if (item.exact) return pathname === target;
    return pathname === target || pathname.startsWith(target + "/");
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="h-5.5 w-5.5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold text-sidebar-accent-foreground">
            Madrasah
          </p>
          <p className="text-xs text-sidebar-foreground/70">Management System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {topItems.map((item) => (
          <NavLink key={item.label} item={item} active={isActive(item)} />
        ))}

        <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Classes
        </p>
        {classItems.map((item) => (
          <NavLink key={item.label} item={item} active={isActive(item)} />
        ))}

        <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Staff
        </p>
        {bottomItems.map((item) => (
          <NavLink key={item.label} item={item} active={isActive(item)} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs text-sidebar-foreground/60">
          Signed in as <span className="font-medium text-sidebar-accent-foreground">Admin</span>
        </p>
      </div>
    </aside>
  );
}
