"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional(),
  grade: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  isCurrent: z.boolean().default(false),
  location: z.string().optional()
});

const formSchema = z.object({
  education: z
    .array(educationSchema)
    .min(1, "At least one education entry is required")
});

export type EducationFormData = z.infer<typeof formSchema>;
export type Education = z.infer<typeof educationSchema>;

interface EducationEditFormProps {
  education: Education[];
  setIsFormValid: React.Dispatch<React.SetStateAction<boolean>>;
  onFormChange?: (values: EducationFormData) => void;
}

const degreeOptions = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Professional Degree",
  "Certificate",
  "Other"
];

const EducationEditForm: React.FC<EducationEditFormProps> = ({
  education,
  onFormChange,
  setIsFormValid
}) => {
  const form = useForm<EducationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      education:
        education?.length > 0
          ? education
          : [
              {
                institution: "",
                degree: "",
                fieldOfStudy: "",
                grade: "",
                startDate: undefined,
                endDate: undefined,
                isCurrent: false,
                location: ""
              }
            ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education"
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onFormChange && value.education) {
        onFormChange(value as EducationFormData);
      }
      setIsFormValid(form.formState.isValid);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange, setIsFormValid]);

  const addEducation = () => {
    append({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      grade: "",
      // @ts-expect-error
      startDate: undefined,
      endDate: undefined,
      isCurrent: false,
      location: ""
    });
  };

  const removeEducation = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Form {...form}>
      <form id="education-edit-form" className="space-y-6">
        <div className="space-y-6">
          {fields.map((field, index) => {
            const isCurrent = form.watch(`education.${index}.isCurrent`);

            return (
              <div key={field.id} className="relative rounded-lg border p-4">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="absolute -right-2 -top-2 z-10 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
                    aria-label="Remove education"
                  >
                    <X size={14} />
                  </button>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input placeholder="University name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select degree" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {degreeOptions.map((degree) => (
                                <SelectItem key={degree} value={degree}>
                                  {degree}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`education.${index}.fieldOfStudy`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field of Study (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Computer Science, Business, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.grade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="3.8 GPA, First Class, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`education.${index}.location`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State/Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`education.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select start date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select graduation date"
                              disabled={isCurrent}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`education.${index}.isCurrent`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue(
                                  `education.${index}.endDate`,
                                  undefined
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          I currently study here
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={addEducation}
            className="w-full"
          >
            Add Another Education
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EducationEditForm;
