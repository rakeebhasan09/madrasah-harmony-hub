import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search as SearchIcon, Users, GraduationCap } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getClass, formatBDT } from "@/lib/madrasah-data";
import { useStudents, useTeachers } from "@/lib/madrasah-store";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_dashboard/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Search — Madrasah Management System" },
      { name: "description", content: "Search students and teachers." },
    ],
  }),
  component: SearchPage,
});

function initials(name: string) {
  return name
    .replace(/^(Maulana|Mufti|Hafiz|Ustadha|Ustad)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function SearchPage() {
  const { q } = Route.useSearch();
  const students = useStudents();
  const teachers = useTeachers();

  const query = q.trim().toLowerCase();

  const matchedStudents = query
    ? students.filter((s) =>
        [s.nameEn, s.nameBn, s.id, s.guardianMobile, s.fatherEn, s.motherEn]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : [];

  const matchedTeachers = query
    ? teachers.filter((t) =>
        [t.name, t.id, t.subject, t.mobile].join(" ").toLowerCase().includes(query),
      )
    : [];

  const total = matchedStudents.length + matchedTeachers.length;

  return (
    <div>
      <DashboardHeader
        title="Search"
        subtitle={query ? `${total} result${total === 1 ? "" : "s"} for “${q}”` : "Search students and teachers"}
      />

      <div className="space-y-6 p-6">
        {!query ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
              <SearchIcon className="h-8 w-8" />
              <p>Type a name, ID, or mobile number in the search box above.</p>
            </CardContent>
          </Card>
        ) : total === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No students or teachers match “{q}”.
            </CardContent>
          </Card>
        ) : (
          <>
            {matchedStudents.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" /> Students ({matchedStudents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {matchedStudents.map((s) => {
                    const cls = getClass(s.classId);
                    return (
                      <Link
                        key={s.id}
                        to="/class/$classId"
                        params={{ classId: s.classId }}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                            {initials(s.nameEn)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{s.nameEn}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {s.id} · {s.guardianMobile}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{cls?.name}</Badge>
                          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                            {formatBDT(s.monthlyFee)}/mo
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            ) : null}

            {matchedTeachers.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4" /> Teachers ({matchedTeachers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {matchedTeachers.map((t) => (
                    <Link
                      key={t.id}
                      to="/teachers"
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                          {initials(t.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{t.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {t.id} · {t.mobile}
                        </p>
                      </div>
                      <Badge variant="secondary">{t.subject}</Badge>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
