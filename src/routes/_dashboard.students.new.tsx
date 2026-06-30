import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import {
  CLASSES,
  GENDERS,
  RELIGIONS,
  BLOOD_GROUPS,
  NATIONALITIES,
  type ClassId,
} from "@/lib/madrasah-data";
import { addStudent } from "@/lib/madrasah-store";

export const Route = createFileRoute("/_dashboard/students/new")({
  head: () => ({
    meta: [
      { title: "Register Student — Madrasah Management System" },
      { name: "description", content: "Admin form to register a new student." },
    ],
  }),
  component: RegisterStudent,
});

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
  dob: z.date({ message: "Select a date of birth" }),
  birthCert: z.string().trim().min(1, "Required").max(30),
  fatherMobile: mobile,
  motherMobile: mobile,
  guardianMobile: mobile,
  classId: z.string().min(1, "Select a class"),
  gender: z.string().min(1, "Select gender"),
  religion: z.string().min(1, "Select religion"),
  bloodGroup: z.string().min(1, "Select blood group"),
  nationality: z.string().min(1, "Select nationality"),
  presentAddress: z.string().trim().min(1, "Required").max(300),
  permanentAddress: z.string().trim().min(1, "Required").max(300),
  confirmed: z.literal(true, { message: "Please confirm the information is accurate" }),
});

type FormValues = z.infer<typeof schema>;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage />
    </FormItem>
  );
}

function RegisterStudent() {
  const navigate = useNavigate();
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
      birthCert: "",
      fatherMobile: "",
      motherMobile: "",
      guardianMobile: "",
      classId: "",
      gender: "",
      religion: "",
      bloodGroup: "",
      nationality: "Bangladeshi",
      presentAddress: "",
      permanentAddress: "",
    },
  });

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

  function onSubmit(values: FormValues) {
    // UI shell only — no backend yet. Show confirmation and return to class.
    toast.success(`${values.nameEn} registered successfully.`);
    navigate({ to: "/class/$classId", params: { classId: values.classId } });
  }

  return (
    <div>
      <DashboardHeader
        title="Register Student"
        subtitle="Add a new student to the madrasah"
      />

      <div className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-4xl space-y-6"
          >
            {/* Photo + identity */}
            <Card>
              <CardHeader>
                <CardTitle>Student Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-5">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted">
                    {photo ? (
                      <img src={photo} alt="Student preview" className="h-full w-full object-cover" />
                    ) : (
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPhoto}
                    />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                        <Upload className="h-4 w-4" /> Upload Photo
                      </Button>
                      {photo ? (
                        <Button type="button" variant="ghost" onClick={() => setPhoto(null)}>
                          <X className="h-4 w-4" /> Remove
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG or PNG. A clear passport-style photo works best.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Names */}
            <Card>
              <CardHeader>
                <CardTitle>Student & Parent Names</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="nameBn" render={({ field }) => (
                  <Field label="Student's Name (Bangla)"><Input placeholder="শিক্ষার্থীর নাম" {...field} /></Field>
                )} />
                <FormField control={form.control} name="nameEn" render={({ field }) => (
                  <Field label="Student's Name (English)"><Input placeholder="Student name" {...field} /></Field>
                )} />
                <FormField control={form.control} name="fatherBn" render={({ field }) => (
                  <Field label="Father's Name (Bangla)"><Input placeholder="পিতার নাম" {...field} /></Field>
                )} />
                <FormField control={form.control} name="fatherEn" render={({ field }) => (
                  <Field label="Father's Name (English)"><Input placeholder="Father name" {...field} /></Field>
                )} />
                <FormField control={form.control} name="motherBn" render={({ field }) => (
                  <Field label="Mother's Name (Bangla)"><Input placeholder="মাতার নাম" {...field} /></Field>
                )} />
                <FormField control={form.control} name="motherEn" render={({ field }) => (
                  <Field label="Mother's Name (English)"><Input placeholder="Mother name" {...field} /></Field>
                )} />
              </CardContent>
            </Card>

            {/* Personal details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="dob" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className="h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          startMonth={new Date(2005, 0)}
                          endMonth={new Date()}
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(d) => d > new Date()}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="birthCert" render={({ field }) => (
                  <Field label="Birth Certificate Number"><Input placeholder="e.g. 1999..." {...field} /></Field>
                )} />
                <FormField control={form.control} name="classId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLASSES.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
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
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Numbers</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <FormField control={form.control} name="fatherMobile" render={({ field }) => (
                  <Field label="Father's Mobile"><Input inputMode="numeric" placeholder="017XXXXXXXX" {...field} /></Field>
                )} />
                <FormField control={form.control} name="motherMobile" render={({ field }) => (
                  <Field label="Mother's Mobile"><Input inputMode="numeric" placeholder="017XXXXXXXX" {...field} /></Field>
                )} />
                <FormField control={form.control} name="guardianMobile" render={({ field }) => (
                  <Field label="Guardian's Mobile (pick-up & drop-off)"><Input inputMode="numeric" placeholder="017XXXXXXXX" {...field} /></Field>
                )} />
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="presentAddress" render={({ field }) => (
                  <Field label="Present Address"><Textarea rows={3} placeholder="Village, Post, Upazila, District" {...field} /></Field>
                )} />
                <FormField control={form.control} name="permanentAddress" render={({ field }) => (
                  <Field label="Permanent Address"><Textarea rows={3} placeholder="Village, Post, Upazila, District" {...field} /></Field>
                )} />
              </CardContent>
            </Card>

            {/* Confirmation */}
            <Card>
              <CardContent className="p-5">
                <FormField control={form.control} name="confirmed" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                      </FormControl>
                      <label className="text-sm leading-relaxed text-foreground">
                        I confirm that all the information provided above is accurate and complete.
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/" })}>
                Cancel
              </Button>
              <Button type="submit">
                <UserPlus className="h-4 w-4" /> Register Student
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
