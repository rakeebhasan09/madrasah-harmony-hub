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
import {
  CLASSES,
  MONTHS,
  getClass,
  formatBDT,
  type ClassId,
} from "@/lib/madrasah-data";
import { useStudents, recordStudentPayment } from "@/lib/madrasah-store";

export const Route = createFileRoute("/_dashboard/fees")({
  head: () => ({
    meta: [
      { title: "Fee Collection — Madrasah Management System" },
      { name: "description", content: "Record monthly student fee payments." },
    ],
  }),
  component: FeesPage,
});

function FeesPage() {
  const students = useStudents();
  const [classId, setClassId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [month, setMonth] = useState<string>("");

  const classStudents = classId
    ? students.filter((s) => s.classId === (classId as ClassId))
    : [];
  const student = useMemo(
    () => students.find((s) => s.id === studentId),
    [students, studentId],
  );
  const cls = student ? getClass(student.classId) : undefined;

  const paidMonths = student ? student.paidMonths : [];

  const monthIdx = month === "" ? -1 : Number(month);
  const alreadyPaid = monthIdx >= 0 && paidMonths.includes(monthIdx);
  const canRecord = !!student && monthIdx >= 0 && !alreadyPaid;

  function record() {
    if (!student || monthIdx < 0) return;
    recordStudentPayment(student.id, monthIdx);
    toast.success(
      `Recorded ${formatBDT(student.monthlyFee)} for ${student.nameEn} — ${MONTHS[monthIdx]}`,
    );
    setMonth("");
  }

  return (
    <div>
      <DashboardHeader title="Fee Collection" subtitle="Record a student's monthly fee payment" />

      <div className="grid gap-6 p-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Record a Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select
                  value={classId}
                  onValueChange={(v) => {
                    setClassId(v);
                    setStudentId("");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Student</label>
                <Select value={studentId} onValueChange={setStudentId} disabled={!classId}>
                  <SelectTrigger>
                    <SelectValue placeholder={classId ? "Select student" : "Select class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.roll}. {s.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Month</label>
                <Select value={month} onValueChange={setMonth} disabled={!student}>
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
                <label className="text-sm font-medium">Amount (set at admission)</label>
                <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium tabular-nums">
                  {student ? formatBDT(student.monthlyFee) : "—"}
                </div>
              </div>
            </div>

            {alreadyPaid ? (
              <p className="text-sm text-warning-foreground">
                This month is already marked as paid for this student.
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
            {student ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">{student.nameEn}</p>
                  <p className="text-sm text-muted-foreground">
                    {cls?.name} · Roll {student.roll} · {student.id} · {formatBDT(student.monthlyFee)}/mo
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
                Select a class and student to view their payment status.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
