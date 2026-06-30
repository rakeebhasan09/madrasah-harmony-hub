import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CLASSES,
  formatBDT,
} from "@/lib/madrasah-data";
import { useStudents, useTeachers } from "@/lib/madrasah-store";

export const Route = createFileRoute("/_dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — Madrasah Management System" },
      { name: "description", content: "Key stats for students, teachers, fee collection, and finances." },
    ],
  }),
  component: Overview,
});

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  hint: string;
  trend?: "up" | "down";
}

function Overview() {
  const totalStudents = STUDENTS.length;
  const totalTeachers = TEACHERS.length;

  // Expected vs collected fees for the current month (index 5 = June in mock).
  const month = 5;
  let expected = 0;
  let collected = 0;
  for (const cls of CLASSES) {
    const list = studentsByClass(cls.id);
    expected += list.length * cls.monthlyFee;
    collected += list.filter((s) => s.paidMonths.includes(month)).length * cls.monthlyFee;
  }
  const due = expected - collected;
  const salaryTotal = TEACHERS.reduce((sum, t) => sum + t.salary, 0);

  const stats: Stat[] = [
    { label: "Total Students", value: String(totalStudents), icon: Users, hint: `Across ${CLASSES.length} classes` },
    { label: "Total Teachers", value: String(totalTeachers), icon: GraduationCap, hint: "Active staff" },
    { label: "Fees Collected", value: formatBDT(collected), icon: TrendingUp, hint: "This month", trend: "up" },
    { label: "Outstanding Dues", value: formatBDT(due), icon: TrendingDown, hint: "This month", trend: "down" },
  ];

  const collectionPct = expected ? Math.round((collected / expected) * 100) : 0;

  return (
    <div>
      <DashboardHeader title="Overview" subtitle="A snapshot of your madrasah at a glance" />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Students by Class</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/students/new">
                  Register Student <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {CLASSES.map((cls) => {
                const count = studentsByClass(cls.id).length;
                const pct = Math.round((count / totalStudents) * 100);
                return (
                  <Link
                    key={cls.id}
                    to="/class/$classId"
                    params={{ classId: cls.id }}
                    className="block rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{cls.name}</span>
                      <span className="text-muted-foreground">
                        {count} students · {formatBDT(cls.monthlyFee)}/mo
                      </span>
                    </div>
                    <Progress value={pct} />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>This Month's Collection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-semibold text-foreground">{collectionPct}%</span>
                    <span className="text-sm text-muted-foreground">of {formatBDT(expected)}</span>
                  </div>
                  <Progress value={collectionPct} className="mt-3" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-muted-foreground">Collected</p>
                    <p className="mt-0.5 font-semibold text-success">{formatBDT(collected)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-muted-foreground">Due</p>
                    <p className="mt-0.5 font-semibold text-destructive">{formatBDT(due)}</p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link to="/fees">
                    <Wallet className="h-4 w-4" /> Collect Fees
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{formatBDT(salaryTotal)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Payable to {totalTeachers} teachers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
