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
  monthlyFee: number;
}

export const CLASSES: ClassInfo[] = [
  { id: "play", name: "Play", monthlyFee: 500 },
  { id: "nursery", name: "Nursery", monthlyFee: 600 },
  { id: "one", name: "One", monthlyFee: 700 },
  { id: "two", name: "Two", monthlyFee: 800 },
  { id: "three", name: "Three", monthlyFee: 900 },
  { id: "four", name: "Four", monthlyFee: 1000 },
  { id: "hifz", name: "Hifz", monthlyFee: 1200 },
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
}

const firstNames = [
  "Abdullah", "Ayesha", "Bilal", "Fatima", "Hamza", "Khadija", "Ibrahim",
  "Maryam", "Yusuf", "Zainab", "Omar", "Aisha", "Tariq", "Sumaiya", "Rayan",
  "Nusaiba", "Saif", "Hafsa", "Imran", "Ruqayyah",
];
const lastNames = ["Rahman", "Hossain", "Islam", "Ahmed", "Chowdhury", "Khan", "Sarker"];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildStudents(): Student[] {
  const rand = seeded(42);
  const students: Student[] = [];
  let idCounter = 1;
  for (const cls of CLASSES) {
    const count = 6 + Math.floor(rand() * 6);
    for (let i = 0; i < count; i++) {
      const fn = firstNames[Math.floor(rand() * firstNames.length)];
      const ln = lastNames[Math.floor(rand() * lastNames.length)];
      const paid: number[] = [];
      for (let m = 0; m < 6; m++) {
        if (rand() > 0.25) paid.push(m);
      }
      students.push({
        id: `STD-${String(idCounter).padStart(4, "0")}`,
        roll: i + 1,
        nameEn: `${fn} ${ln}`,
        nameBn: "শিক্ষার্থী",
        fatherEn: `${lastNames[Math.floor(rand() * lastNames.length)]} Ali`,
        motherEn: `${firstNames[Math.floor(rand() * firstNames.length)]} Begum`,
        classId: cls.id,
        gender: rand() > 0.5 ? "Male" : "Female",
        guardianMobile: `017${Math.floor(10000000 + rand() * 89999999)}`,
        bloodGroup: BLOOD_GROUPS[Math.floor(rand() * BLOOD_GROUPS.length)],
        paidMonths: paid,
      });
      idCounter++;
    }
  }
  return students;
}

export const STUDENTS: Student[] = buildStudents();

export function studentsByClass(classId: ClassId): Student[] {
  return STUDENTS.filter((s) => s.classId === classId);
}

export const TEACHERS: Teacher[] = [
  { id: "TCH-01", name: "Maulana Abdul Karim", subject: "Hifz & Qira'at", mobile: "01711000001", salary: 25000, joined: "2019-01-10" },
  { id: "TCH-02", name: "Ustadha Salma Khatun", subject: "Nursery & Play", mobile: "01711000002", salary: 18000, joined: "2020-03-15" },
  { id: "TCH-03", name: "Mufti Rashedul Islam", subject: "Fiqh & Arabic", mobile: "01711000003", salary: 28000, joined: "2018-07-01" },
  { id: "TCH-04", name: "Hafiz Naimur Rahman", subject: "Hifz", mobile: "01711000004", salary: 24000, joined: "2021-02-20" },
  { id: "TCH-05", name: "Ustadha Tahmina Akter", subject: "Bangla & English", mobile: "01711000005", salary: 17000, joined: "2022-08-05" },
  { id: "TCH-06", name: "Maulana Shahidul Haque", subject: "Class One–Four", mobile: "01711000006", salary: 22000, joined: "2017-09-12" },
];

export function formatBDT(amount: number): string {
  return "৳" + amount.toLocaleString("en-BD");
}
