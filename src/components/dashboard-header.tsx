import { Link, useNavigate } from "@tanstack/react-router";
import { UserPlus, Wallet, LogOut, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold text-foreground">{title}</h1>
        {subtitle ? (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <div className="relative hidden lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search students…" className="w-56 pl-9" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button asChild variant="outline">
          <Link to="/fees">
            <Wallet className="h-4 w-4" />
            Collect Fee
          </Link>
        </Button>
        <Button asChild>
          <Link to="/students/new">
            <UserPlus className="h-4 w-4" />
            Register Student
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Log out"
          onClick={() => navigate({ to: "/login" })}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
