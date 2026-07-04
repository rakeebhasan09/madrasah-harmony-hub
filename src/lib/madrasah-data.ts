// Mock data layer for the Madrasah Management System (UI shell — no backend yet).

export type ClassId =
  | "play"
  | "nursery"
  | "one"
  | "two"
  | "three"
  | "four"
  | "hifz";

export interface ClassInfo {
  id: ClassId;
  name: string;
}

export const CLASSES: ClassInfo[] = [
  { id: "play", name: "Play" },
  { id: "nursery", name: "Nursery" },
  { id: "one", name: "One" },
  { id: "two", name: "Two" },
  { id: "three", name: "Three" },
  { id: "four", name: "Four" },
  { id: "hifz", name: "Hifz" },
];

export function getClass(id: string): ClassInfo | undefined {
  return CLASSES.find((c) => c.id === id);
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// The current calendar month (0-11), used for "this month" payment status.
export const CURRENT_MONTH = new Date().getMonth();

export const GENDERS = ["Male", "Female"];
export const RELIGIONS = ["Islam", "Hinduism", "Christianity", "Buddhism", "Other"];
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const NATIONALITIES = ["Bangladeshi", "Other"];

export type FeeStatus = "paid" | "due";

export interface Student {
  id: string;
  roll: number;
  nameEn: string;
  nameBn: string;
  fatherEn: string;
  fatherBn: string;
  motherEn: string;
  motherBn: string;
  dob: string;
  birthCert: string;
  classId: ClassId;
  gender: string;
  religion: string;
  nationality: string;
  fatherMobile: string;
  motherMobile: string;
  guardianMobile: string;
  presentAddress: string;
  permanentAddress: string;
  bloodGroup: string;
  // Data URL / link to the student's profile photo (empty when none).
  photoUrl: string;
  // Individually agreed monthly fee, set at admission time.
  monthlyFee: number;
  // Months (index 0-11) that have been paid this year.
  paidMonths: number[];
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  mobile: string;
  salary: number;
  joined: string;
  // Data URL / link to the teacher's profile photo (empty when none).
  photoUrl: string;
  // Months (index 0-11) that the salary has been paid this year.
  paidMonths: number[];
}

export function formatBDT(amount: number): string {
  return "৳" + amount.toLocaleString("en-BD");
}

// Friendly short code derived from a record's UUID (for display only).
export function shortId(id: string): string {
  return "#" + id.slice(0, 8).toUpperCase();
}
