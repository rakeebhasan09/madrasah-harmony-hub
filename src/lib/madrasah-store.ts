// Reactive in-memory store for the UI shell (no backend yet).
// Lets registrations, deletions, payments and search reflect across all pages
// during the current session.
import { useSyncExternalStore } from "react";
import {
  STUDENTS,
  TEACHERS,
  type ClassId,
  type Student,
  type Teacher,
} from "./madrasah-data";

let students: Student[] = [...STUDENTS];
let teachers: Teacher[] = [...TEACHERS];

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStudents(): Student[] {
  return useSyncExternalStore(
    subscribe,
    () => students,
    () => students,
  );
}

export function useTeachers(): Teacher[] {
  return useSyncExternalStore(
    subscribe,
    () => teachers,
    () => teachers,
  );
}

export interface NewStudentInput {
  nameEn: string;
  nameBn: string;
  fatherEn: string;
  motherEn: string;
  classId: ClassId;
  gender: string;
  guardianMobile: string;
  bloodGroup: string;
  monthlyFee: number;
}

export function addStudent(input: NewStudentInput): Student {
  const classCount = students.filter((s) => s.classId === input.classId).length;
  const nextNum = students.length + 1;
  const student: Student = {
    id: `STD-${String(1000 + nextNum)}`,
    roll: classCount + 1,
    paidMonths: [],
    ...input,
  };
  students = [...students, student];
  emit();
  return student;
}

export interface NewTeacherInput {
  name: string;
  subject: string;
  mobile: string;
  salary: number;
  joined: string;
}

export function addTeacher(input: NewTeacherInput): Teacher {
  const nextNum = teachers.length + 1;
  const teacher: Teacher = {
    id: `TCH-${String(nextNum).padStart(2, "0")}`,
    paidMonths: [],
    ...input,
  };
  teachers = [...teachers, teacher];
  emit();
  return teacher;
}

export function removeTeacher(id: string) {
  teachers = teachers.filter((t) => t.id !== id);
  emit();
}

export function recordStudentPayment(studentId: string, month: number) {
  students = students.map((s) =>
    s.id === studentId
      ? { ...s, paidMonths: Array.from(new Set([...s.paidMonths, month])).sort((a, b) => a - b) }
      : s,
  );
  emit();
}

export function recordSalaryPayment(teacherId: string, month: number) {
  teachers = teachers.map((t) =>
    t.id === teacherId
      ? { ...t, paidMonths: Array.from(new Set([...t.paidMonths, month])).sort((a, b) => a - b) }
      : t,
  );
  emit();
}
