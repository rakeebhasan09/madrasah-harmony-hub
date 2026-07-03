import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CLASSES,
  GENDERS,
  RELIGIONS,
  BLOOD_GROUPS,
  NATIONALITIES,
  MONTHS,
  getClass,
  formatBDT,
  shortId,
  type ClassId,
  type Student,
} from "@/lib/madrasah-data";
import { updateStudent } from "@/lib/madrasah-store";

export function studentInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ---------------- View dialog ----------------

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

export function StudentViewDialog({
  student,
  open,
  onOpenChange,
}: {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!student) return null;
  const cls = getClass(student.classId);
  const paidCount = student.paidMonths.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>{shortId(student.id)}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {student.photoUrl ? <AvatarImage src={student.photoUrl} alt={student.nameEn} /> : null}
            <AvatarFallback className="bg-accent text-lg text-accent-foreground">
              {studentInitials(student.nameEn)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold text-foreground">{student.nameEn}</p>
            <p className="text-sm text-muted-foreground">{student.nameBn}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="secondary">{cls?.name}</Badge>
              <Badge variant="secondary">Roll {student.roll}</Badge>
              <Badge variant="secondary">{formatBDT(student.monthlyFee)}/mo</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-x-6 sm:grid-cols-2">
          <DetailRow label="Father (English)" value={student.fatherEn} />
          <DetailRow label="Father (Bangla)" value={student.fatherBn} />
          <DetailRow label="Mother (English)" value={student.motherEn} />
          <DetailRow label="Mother (Bangla)" value={student.motherBn} />
          <DetailRow label="Date of Birth" value={student.dob} />
          <DetailRow label="Birth Certificate No." value={student.birthCert} />
          <DetailRow label="Gender" value={student.gender} />
          <DetailRow label="Blood Group" value={student.bloodGroup} />
          <DetailRow label="Religion" value={student.religion} />
          <DetailRow label="Nationality" value={student.nationality} />
          <DetailRow label="Father's Mobile" value={student.fatherMobile} />
          <DetailRow label="Mother's Mobile" value={student.motherMobile} />
          <DetailRow label="Guardian's Mobile" value={student.guardianMobile} />
          <DetailRow label="Monthly Fee" value={formatBDT(student.monthlyFee)} />
          <DetailRow label="Present Address" value={student.presentAddress} />
          <DetailRow label="Permanent Address" value={student.permanentAddress} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Payment History (this year)</span>
            <Badge variant="secondary">{paidCount} / 12 paid</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {MONTHS.map((m, i) => {
              const paid = student.paidMonths.includes(i);
              return (
                <div
                  key={m}
                  className={
                    "rounded-md border px-2 py-1.5 text-center text-xs " +
                    (paid
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border text-muted-foreground")
                  }
                >
                  {m.slice(0, 3)}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Edit dialog ----------------

const mobile = z
  .string()
  .trim()
  .regex(/^01\d{9}$/, "Enter an 11-digit number starting with 01");

const schema = z.object({
  nameBn: z.string().trim().min(1, "Required").max(100),
  nameEn: z.string().trim().min(1, "Required").max(100),
  motherBn: z.string().trim().min(1, "Required").max(100),
  motherEn: z.string().trim().min(1, "Required").max(100),
  fatherBn: z.string().trim().min(1, "Required").max(100),
  fatherEn: z.string().trim().min(1, "Required").max(100),
  dob: z.string().trim().min(1, "Required"),
  birthCert: z.string().trim().min(1, "Required").max(30),
  fatherMobile: mobile,
  motherMobile: mobile,
  guardianMobile: mobile,
  classId: z.string().min(1, "Select a class"),
  monthlyFee: z.coerce.number().min(1, "Enter a valid amount").max(100000, "Amount too large"),
  gender: z.string().min(1, "Select gender"),
  religion: z.string().min(1, "Select religion"),
  bloodGroup: z.string().min(1, "Select blood group"),
  nationality: z.string().min(1, "Select nationality"),
  presentAddress: z.string().trim().min(1, "Required").max(300),
  permanentAddress: z.string().trim().min(1, "Required").max(300),
});

type FormValues = z.infer<typeof schema>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage />
    </FormItem>
  );
}

export function StudentEditDialog({
  student,
  open,
  onOpenChange,
}: {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameBn: "",
      nameEn: "",
      motherBn: "",
      motherEn: "",
      fatherBn: "",
      fatherEn: "",
      dob: "",
      birthCert: "",
      fatherMobile: "",
      motherMobile: "",
      guardianMobile: "",
      classId: "",
      monthlyFee: 0,
      gender: "",
      religion: "",
      bloodGroup: "",
      nationality: "Bangladeshi",
      presentAddress: "",
      permanentAddress: "",
    },
  });

  useEffect(() => {
    if (student && open) {
      form.reset({
        nameBn: student.nameBn,
        nameEn: student.nameEn,
        motherBn: student.motherBn,
        motherEn: student.motherEn,
        fatherBn: student.fatherBn,
        fatherEn: student.fatherEn,
        dob: student.dob,
        birthCert: student.birthCert,
        fatherMobile: student.fatherMobile,
        motherMobile: student.motherMobile,
        guardianMobile: student.guardianMobile,
        classId: student.classId,
        monthlyFee: student.monthlyFee,
        gender: student.gender,
        religion: student.religion,
        bloodGroup: student.bloodGroup,
        nationality: student.nationality,
        presentAddress: student.presentAddress,
        permanentAddress: student.permanentAddress,
      });
      setPhoto(student.photoUrl || null);
    }
  }, [student, open, form]);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(values: FormValues) {
    if (!student) return;
    try {
      await updateStudent(student.id, {
        nameEn: values.nameEn,
        nameBn: values.nameBn,
        fatherEn: values.fatherEn,
        fatherBn: values.fatherBn,
        motherEn: values.motherEn,
        motherBn: values.motherBn,
        dob: values.dob,
        birthCert: values.birthCert,
        classId: values.classId as ClassId,
        gender: values.gender,
        religion: values.religion,
        bloodGroup: values.bloodGroup,
        nationality: values.nationality,
        fatherMobile: values.fatherMobile,
        motherMobile: values.motherMobile,
        guardianMobile: values.guardianMobile,
        presentAddress: values.presentAddress,
        permanentAddress: values.permanentAddress,
        monthlyFee: values.monthlyFee,
        photoUrl: photo ?? "",
      });
      toast.success(`${values.nameEn}'s details updated.`);
      onOpenChange(false);
    } catch {
      toast.error("Could not update the student. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update the student's information and save.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted">
                {photo ? (
                  <img src={photo} alt="Student preview" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhoto}
                />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Change Photo
                </Button>
                {photo ? (
                  <Button type="button" variant="ghost" onClick={() => setPhoto(null)}>
                    <X className="h-4 w-4" /> Remove
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="nameBn" render={({ field }) => (
                <Field label="Name (Bangla)"><Input {...field} /></Field>
              )} />
              <FormField control={form.control} name="nameEn" render={({ field }) => (
                <Field label="Name (English)"><Input {...field} /></Field>
              )} />
              <FormField control={form.control} name="fatherBn" render={({ field }) => (
                <Field label="Father (Bangla)"><Input {...field} /></Field>
              )} />
              <FormField control={form.control} name="fatherEn" render={({ field }) => (
                <Field label="Father (English)"><Input {...field} /></Field>
              )} />
              <FormField control={form.control} name="motherBn" render={({ field }) => (
                <Field label="Mother (Bangla)"><Input {...field} /></Field>
              )} />
              <FormField control={form.control} name="motherEn" render={({ field }) => (
                <Field label="Mother (English)"><Input {...field} /></Field>
              )} />
              <FormField control={form.control} name="dob" render={({ field }) => (
                <Field label="Date of Birth"><Input type="date" {...field} /></Field>
              )} />
              <FormField control={form.control} name="birthCert" render={({ field }) => (
                <Field label="Birth Certificate No."><Input {...field} /></Field>
              )} />
              <FormField control={form.control} name="classId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLASSES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="monthlyFee" render={({ field }) => (
                <Field label="Monthly Fee (৳)">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </Field>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BLOOD_GROUPS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="religion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RELIGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="nationality" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NATIONALITIES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fatherMobile" render={({ field }) => (
                <Field label="Father's Mobile"><Input inputMode="numeric" {...field} /></Field>
              )} />
              <FormField control={form.control} name="motherMobile" render={({ field }) => (
                <Field label="Mother's Mobile"><Input inputMode="numeric" {...field} /></Field>
              )} />
              <FormField control={form.control} name="guardianMobile" render={({ field }) => (
                <Field label="Guardian's Mobile"><Input inputMode="numeric" {...field} /></Field>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="presentAddress" render={({ field }) => (
                <Field label="Present Address"><Textarea rows={2} {...field} /></Field>
              )} />
              <FormField control={form.control} name="permanentAddress" render={({ field }) => (
                <Field label="Permanent Address"><Textarea rows={2} {...field} /></Field>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
