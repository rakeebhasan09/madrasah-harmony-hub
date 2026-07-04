// Backend-connected store for the Madrasah Management System.
// Reads/writes students & teachers from Lovable Cloud (Supabase) and keeps a
// reactive in-memory cache so all pages update after any CRUD operation.
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type ClassId, type Student, type Teacher } from "./madrasah-data";

let students: Student[] = [];
let teachers: Teacher[] = [];

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---- Mapping helpers -------------------------------------------------------

type StudentRow = {
  id: string;
  name_en: string;
  name_bn: string;
  father_en: string;
  father_bn: string;
  mother_en: string;
  mother_bn: string;
  dob: string | null;
  birth_cert: string;
  class_id: string;
  gender: string;
  religion: string;
  nationality: string;
  father_mobile: string;
  mother_mobile: string;
  guardian_mobile: string;
  present_address: string;
  permanent_address: string;
  blood_group: string;
  photo_url: string;
  monthly_fee: number;
  paid_months: number[] | null;
};

type TeacherRow = {
  id: string;
  name: string;
  subject: string;
  mobile: string;
  salary: number;
  joined: string | null;
  photo_url: string;
  paid_months: number[] | null;
};

function mapStudent(row: StudentRow, roll: number): Student {
  return {
    id: row.id,
    roll,
    nameEn: row.name_en,
    nameBn: row.name_bn,
    fatherEn: row.father_en,
    fatherBn: row.father_bn,
    motherEn: row.mother_en,
    motherBn: row.mother_bn,
    dob: row.dob ?? "",
    birthCert: row.birth_cert,
    classId: row.class_id as ClassId,
    gender: row.gender,
    religion: row.religion,
    nationality: row.nationality,
    fatherMobile: row.father_mobile,
    motherMobile: row.mother_mobile,
    guardianMobile: row.guardian_mobile,
    presentAddress: row.present_address,
    permanentAddress: row.permanent_address,
    bloodGroup: row.blood_group,
    photoUrl: row.photo_url,
    monthlyFee: row.monthly_fee,
    paidMonths: row.paid_months ?? [],
  };
}

function mapTeacher(row: TeacherRow): Teacher {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    mobile: row.mobile,
    salary: row.salary,
    joined: row.joined ?? "",
    photoUrl: row.photo_url,
    paidMonths: row.paid_months ?? [],
  };
}

// ---- Loaders (newest first for display) ------------------------------------

async function loadStudents() {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Failed to load students", error);
    return;
  }
  // Assign per-class roll numbers by admission order (oldest = 1),
  // then store newest-first for display.
  const perClass: Record<string, number> = {};
  const mapped = (data ?? []).map((row) => {
    const classId = (row as StudentRow).class_id;
    perClass[classId] = (perClass[classId] ?? 0) + 1;
    return mapStudent(row as StudentRow, perClass[classId]);
  });
  students = mapped.reverse();
  emit();
}

async function loadTeachers() {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load teachers", error);
    return;
  }
  teachers = (data ?? []).map((row) => mapTeacher(row as TeacherRow));
  emit();
}

// Kick off the initial load once, on the client only.
if (typeof window !== "undefined") {
  void loadStudents();
  void loadTeachers();
}

// ---- Hooks -----------------------------------------------------------------

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

// ---- Mutations -------------------------------------------------------------

export interface NewStudentInput {
  nameEn: string;
  nameBn: string;
  fatherEn: string;
  fatherBn: string;
  motherEn: string;
  motherBn: string;
  dob?: string;
  birthCert: string;
  classId: ClassId;
  gender: string;
  religion: string;
  bloodGroup: string;
  nationality: string;
  fatherMobile: string;
  motherMobile: string;
  guardianMobile: string;
  presentAddress: string;
  permanentAddress: string;
  monthlyFee: number;
  photoUrl?: string;
}

export async function addStudent(input: NewStudentInput): Promise<void> {
  const { error } = await supabase.from("students").insert({
    name_en: input.nameEn,
    name_bn: input.nameBn,
    father_en: input.fatherEn,
    father_bn: input.fatherBn,
    mother_en: input.motherEn,
    mother_bn: input.motherBn,
    dob: input.dob ?? null,
    birth_cert: input.birthCert,
    class_id: input.classId,
    gender: input.gender,
    religion: input.religion,
    blood_group: input.bloodGroup,
    nationality: input.nationality,
    father_mobile: input.fatherMobile,
    mother_mobile: input.motherMobile,
    guardian_mobile: input.guardianMobile,
    present_address: input.presentAddress,
    permanent_address: input.permanentAddress,
    monthly_fee: input.monthlyFee,
    photo_url: input.photoUrl ?? "",
  });
  if (error) throw error;
  await loadStudents();
}

export async function updateStudent(id: string, input: NewStudentInput): Promise<void> {
  const { error } = await supabase
    .from("students")
    .update({
      name_en: input.nameEn,
      name_bn: input.nameBn,
      father_en: input.fatherEn,
      father_bn: input.fatherBn,
      mother_en: input.motherEn,
      mother_bn: input.motherBn,
      dob: input.dob ?? null,
      birth_cert: input.birthCert,
      class_id: input.classId,
      gender: input.gender,
      religion: input.religion,
      blood_group: input.bloodGroup,
      nationality: input.nationality,
      father_mobile: input.fatherMobile,
      mother_mobile: input.motherMobile,
      guardian_mobile: input.guardianMobile,
      present_address: input.presentAddress,
      permanent_address: input.permanentAddress,
      monthly_fee: input.monthlyFee,
      photo_url: input.photoUrl ?? "",
    })
    .eq("id", id);
  if (error) throw error;
  await loadStudents();
}

export interface NewTeacherInput {
  name: string;
  subject: string;
  mobile: string;
  salary: number;
  joined: string;
  photoUrl?: string;
}

export async function addTeacher(input: NewTeacherInput): Promise<void> {
  const { error } = await supabase.from("teachers").insert({
    name: input.name,
    subject: input.subject,
    mobile: input.mobile,
    salary: input.salary,
    joined: input.joined,
    photo_url: input.photoUrl ?? "",
  });
  if (error) throw error;
  await loadTeachers();
}

export async function removeTeacher(id: string): Promise<void> {
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) throw error;
  await loadTeachers();
}

export async function recordStudentPayment(studentId: string, month: number): Promise<void> {
  const current = students.find((s) => s.id === studentId);
  const months = Array.from(new Set([...(current?.paidMonths ?? []), month])).sort(
    (a, b) => a - b,
  );
  const { error } = await supabase
    .from("students")
    .update({ paid_months: months })
    .eq("id", studentId);
  if (error) throw error;
  await loadStudents();
}

export async function recordSalaryPayment(teacherId: string, month: number): Promise<void> {
  const current = teachers.find((t) => t.id === teacherId);
  const months = Array.from(new Set([...(current?.paidMonths ?? []), month])).sort(
    (a, b) => a - b,
  );
  const { error } = await supabase
    .from("teachers")
    .update({ paid_months: months })
    .eq("id", teacherId);
  if (error) throw error;
  await loadTeachers();
}
