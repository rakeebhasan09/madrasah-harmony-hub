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
  motherEn: string;
  classId: ClassId;
  gender: string;
  guardianMobile: string;
  bloodGroup: string;
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
  // Months (index 0-11) that the salary has been paid this year.
  paidMonths: number[];
}

export function formatBDT(amount: number): string {
  return "৳" + amount.toLocaleString("en-BD");
}
