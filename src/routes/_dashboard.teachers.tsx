import { createFileRoute } from "@tanstack/react-router";
import { Users, Wallet, Phone } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEACHERS, formatBDT } from "@/lib/madrasah-data";

export const Route = createFileRoute("/_dashboard/teachers")({
  head: () => ({
    meta: [
      { title: "Teachers — Madrasah Management System" },
      { name: "description", content: "Teacher records, subjects, and monthly salaries." },
    ],
  }),
  component: TeachersPage,
});

function initials(name: string) {
  const parts = name.replace(/^(Maulana|Mufti|Hafiz|Ustadha|Ustad)\s+/i, "").split(" ");
  return parts
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function TeachersPage() {
  const salaryTotal = TEACHERS.reduce((s, t) => s + t.salary, 0);

  return (
    <div>
      <DashboardHeader title="Teachers" subtitle="Staff records and salary information" />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-lg font-semibold">{TEACHERS.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Salary Total</p>
                <p className="text-lg font-semibold">{formatBDT(salaryTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="p-4">
            <h2 className="text-base font-semibold">Teacher List</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Subject / Area</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TEACHERS.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                            {initials(t.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {t.mobile}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(t.joined).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatBDT(t.salary)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
