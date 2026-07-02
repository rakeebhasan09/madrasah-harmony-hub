import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wallet, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS, formatBDT } from "@/lib/madrasah-data";
import { useTeachers, recordSalaryPayment } from "@/lib/madrasah-store";

export const Route = createFileRoute("/_dashboard/salaries")({
  head: () => ({
    meta: [
      { title: "Salary Payment — Madrasah Management System" },
      { name: "description", content: "Record monthly teacher salary payments." },
    ],
  }),
  component: SalariesPage,
});

function SalariesPage() {
  const teachers = useTeachers();
  const [teacherId, setTeacherId] = useState<string>("");
  const [month, setMonth] = useState<string>("");

  const teacher = useMemo(
    () => teachers.find((t) => t.id === teacherId),
    [teachers, teacherId],
  );

  const paidMonths = teacher ? teacher.paidMonths : [];
  const monthIdx = month === "" ? -1 : Number(month);
  const alreadyPaid = monthIdx >= 0 && paidMonths.includes(monthIdx);
  const canRecord = !!teacher && monthIdx >= 0 && !alreadyPaid;

  async function record() {
    if (!teacher || monthIdx < 0) return;
    try {
      await recordSalaryPayment(teacher.id, monthIdx);
      toast.success(
        `Recorded ${formatBDT(teacher.salary)} salary for ${teacher.name} — ${MONTHS[monthIdx]}`,
      );
      setMonth("");
    } catch {
      toast.error("Could not record the payment. Please try again.");
    }
  }

  return (
    <div>
      <DashboardHeader title="Salary Payment" subtitle="Record a teacher's monthly salary payment" />

      <div className="grid gap-6 p-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Record a Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher</label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Salary Month</label>
                <Select value={month} onValueChange={setMonth} disabled={!teacher}>
                  <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i)} disabled={paidMonths.includes(i)}>
                        {m}{paidMonths.includes(i) ? " (paid)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Salary Amount</label>
                <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium tabular-nums">
                  {teacher ? formatBDT(teacher.salary) : "—"}
                </div>
              </div>
            </div>

            {alreadyPaid ? (
              <p className="text-sm text-warning-foreground">
                This month's salary is already marked as paid for this teacher.
              </p>
            ) : null}

            <Button onClick={record} disabled={!canRecord} className="w-full sm:w-auto">
              <Wallet className="h-4 w-4" /> Record Payment
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {teacher ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">{teacher.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.subject} · {teacher.id} · {formatBDT(teacher.salary)}/mo
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MONTHS.map((m, i) => {
                    const paid = paidMonths.includes(i);
                    return (
                      <div
                        key={m}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                      >
                        {paid ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={paid ? "text-foreground" : "text-muted-foreground"}>
                          {m.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
                  <span className="text-muted-foreground">Months paid</span>
                  <Badge variant="secondary">{paidMonths.length} / 12</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a teacher to view their salary payment status.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
