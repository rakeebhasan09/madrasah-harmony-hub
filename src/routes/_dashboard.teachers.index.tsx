import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Wallet, Phone, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CURRENT_MONTH, formatBDT, shortId, type Teacher } from "@/lib/madrasah-data";
import { useTeachers, removeTeacher } from "@/lib/madrasah-store";

export const Route = createFileRoute("/_dashboard/teachers/")({
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
  const teachers = useTeachers();
  const [pending, setPending] = useState<Teacher | null>(null);
  const salaryTotal = teachers.reduce((s, t) => s + t.salary, 0);

  async function confirmDelete() {
    if (!pending) return;
    try {
      await removeTeacher(pending.id);
      toast.success(`${pending.name} removed.`);
    } catch {
      toast.error("Could not remove the teacher. Please try again.");
    }
    setPending(null);
  }

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
                <p className="text-lg font-semibold">{teachers.length}</p>
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
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <h2 className="text-base font-semibold">Teacher List</h2>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/salaries">
                  <Wallet className="h-4 w-4" /> Pay Salary
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/teachers/new">
                  <UserPlus className="h-4 w-4" /> Register Teacher
                </Link>
              </Button>
            </div>
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
                  <TableHead>This Month</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      No data found. No teachers have been added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((t) => {
                  const paid = t.paidMonths.includes(CURRENT_MONTH);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {t.photoUrl ? <AvatarImage src={t.photoUrl} alt={t.name} /> : null}
                            <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                              {initials(t.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{shortId(t.id)}</p>
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
                      <TableCell>
                        {paid ? (
                          <Badge variant="secondary" className="bg-success/15 text-success">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                            Due
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${t.name}`}
                          onClick={() => setPending(t)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending
                ? `${pending.name} will be removed from the system. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
