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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { addTeacher } from "@/lib/madrasah-store";

export const Route = createFileRoute("/_dashboard/teachers/new")({
  head: () => ({
    meta: [
      { title: "Register Teacher — Madrasah Management System" },
      { name: "description", content: "Admin form to register a new teacher." },
    ],
  }),
  component: RegisterTeacher,
});

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  subject: z.string().trim().min(1, "Required").max(100),
  mobile: z
    .string()
    .trim()
    .regex(/^01\d{9}$/, "Enter an 11-digit number starting with 01"),
  salary: z.coerce
    .number({ message: "Enter the monthly salary" })
    .min(1, "Enter a valid amount")
    .max(1000000, "Amount too large"),
  joined: z.date({ message: "Select the joining date" }),
});

type FormValues = z.infer<typeof schema>;

function RegisterTeacher() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      subject: "",
      mobile: "",
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

  async function onSubmit(values: FormValues) {
    try {
      await addTeacher({
        name: values.name,
        subject: values.subject,
        mobile: values.mobile,
        salary: values.salary,
        joined: format(values.joined, "yyyy-MM-dd"),
        photoUrl: photo ?? undefined,
      });
      toast.success(`${values.name} registered successfully.`);
      navigate({ to: "/teachers" });
    } catch {
      toast.error("Could not register the teacher. Please try again.");
    }
  }

  return (
    <div>
      <DashboardHeader title="Register Teacher" subtitle="Add a new teacher to the madrasah" />

      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Teacher name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject / Area</FormLabel>
                    <FormControl><Input placeholder="e.g. Hifz, Arabic" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mobile" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl><Input inputMode="numeric" placeholder="017XXXXXXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Salary (৳)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 20000"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="joined" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Joining Date</FormLabel>
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
                          startMonth={new Date(2010, 0)}
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
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/teachers" })}>
                Cancel
              </Button>
              <Button type="submit">
                <UserPlus className="h-4 w-4" /> Register Teacher
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
