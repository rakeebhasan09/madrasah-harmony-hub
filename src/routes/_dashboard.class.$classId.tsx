import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { UserPlus, Wallet, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getClass,
  formatBDT,
  type ClassId,
} from "@/lib/madrasah-data";
import { useStudents } from "@/lib/madrasah-store";

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

const CURRENT_MONTH = 5; // June in the mock dataset

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => {
                  const paid = s.paidMonths.includes(CURRENT_MONTH);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground">{s.roll}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
