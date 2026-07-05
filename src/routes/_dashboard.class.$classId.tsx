import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { UserPlus, Wallet, Users, CheckCircle2, AlertCircle, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentViewDialog, StudentEditDialog } from "@/components/student-dialogs";
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
import {
  getClass,
  formatBDT,
  shortId,
  CURRENT_MONTH,
  type ClassId,
  type Student,
} from "@/lib/madrasah-data";
import { useStudents, removeStudent } from "@/lib/madrasah-store";

export const Route = createFileRoute("/_dashboard/class/$classId")({
  head: ({ params }) => {
    const cls = getClass(params.classId);
    const name = cls ? cls.name : "Class";
    return {
      meta: [
        { title: `Class ${name} — Madrasah Management System` },
        { name: "description", content: `Student list and fee status for class ${name}.` },
      ],
    };
  },
  loader: ({ params }) => {
    const cls = getClass(params.classId);
    if (!cls) throw notFound();
    return { cls };
  },
  component: ClassPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Class not found.</div>
  ),
  errorComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Could not load this class.</div>
  ),
});




function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function ClassPage() {
  const { cls } = Route.useLoaderData();
  const allStudents = useStudents();
  const students = allStudents.filter((s) => s.classId === (cls.id as ClassId));
  const paidCount = students.filter((s) => s.paidMonths.includes(CURRENT_MONTH)).length;
  const monthlyTotal = students.reduce((sum, s) => sum + s.monthlyFee, 0);

  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

  async function confirmDelete() {
    if (!deleteStudent) return;
    try {
      await removeStudent(deleteStudent.id);
      toast.success(`${deleteStudent.nameEn} removed.`);
    } catch {
      toast.error("Could not remove the student. Please try again.");
    }
    setDeleteStudent(null);
  }

  return (
    <div>
      <DashboardHeader
        title={`Class ${cls.name}`}
        subtitle={`${students.length} students · Monthly fees ${formatBDT(monthlyTotal)}`}
      />


      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="text-lg font-semibold">{students.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid this month</p>
                <p className="text-lg font-semibold">{paidCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold">{students.length - paidCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <h2 className="text-base font-semibold">Student List</h2>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/fees">
                  <Wallet className="h-4 w-4" /> Collect Fee
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/students/new">
                  <UserPlus className="h-4 w-4" /> Register Student
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Roll</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Blood</TableHead>
                  <TableHead>Guardian Mobile</TableHead>
                  <TableHead className="text-right">Monthly Fee</TableHead>
                  <TableHead className="text-right">This Month</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      No data found. No students are enrolled in this class yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((s) => {
                    const paid = s.paidMonths.includes(CURRENT_MONTH);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="text-muted-foreground">{s.roll}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {s.photoUrl ? <AvatarImage src={s.photoUrl} alt={s.nameEn} /> : null}
                              <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                                {initials(s.nameEn)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{s.nameEn}</p>
                              <p className="text-xs text-muted-foreground">{shortId(s.id)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{s.gender}</TableCell>
                        <TableCell>{s.bloodGroup}</TableCell>
                        <TableCell className="tabular-nums">{s.guardianMobile}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatBDT(s.monthlyFee)}</TableCell>
                        <TableCell className="text-right">
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewStudent(s)}
                            >
                              <Eye className="h-4 w-4" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditStudent(s)}
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </Button>
                          </div>
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

      <StudentViewDialog
        student={viewStudent}
        open={!!viewStudent}
        onOpenChange={(open) => !open && setViewStudent(null)}
      />
      <StudentEditDialog
        student={editStudent}
        open={!!editStudent}
        onOpenChange={(open) => !open && setEditStudent(null)}
      />
    </div>
  );
}
