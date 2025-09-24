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
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const dateSchema = z
  .union([z.date(), z.string().transform((str) => new Date(str))])
  .refine((date) => !isNaN(date.getTime()), {
    message: "Invalid date"
  });

const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  isCurrent: z.boolean().default(false),
  location: z.string().optional()
});

const formSchema = z.object({
  experiences: z
    .array(experienceSchema)
    .min(1, "At least one experience is required")
});

export type ExperienceFormData = z.infer<typeof formSchema>;
export type Experience = z.infer<typeof experienceSchema>;

interface ExperienceEditFormProps {
  experiences: Experience[];
  setIsFormValid: React.Dispatch<React.SetStateAction<boolean>>;
  onFormChange?: (values: ExperienceFormData) => void;
}

const ExperienceEditForm: React.FC<ExperienceEditFormProps> = ({
  experiences,
  onFormChange,
  setIsFormValid
}) => {
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experiences:
        experiences?.length > 0
          ? experiences
          : [
              {
                company: "",
                position: "",
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
    name: "experiences"
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onFormChange && value.experiences) {
        onFormChange(value as ExperienceFormData);
      }
      setIsFormValid(form.formState.isValid);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange, setIsFormValid]);

  const addExperience = () => {
    append({
      company: "",
      position: "",
      // @ts-expect-error
      startDate: undefined,
      endDate: undefined,
      isCurrent: false,
      location: ""
    });
  };

  const removeExperience = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Form {...form}>
      <form id="experience-edit-form" className="space-y-6">
        <div className="space-y-6">
          {fields.map((field, index) => {
            const isCurrent = form.watch(`experiences.${index}.isCurrent`);

            return (
              <div key={field.id} className="relative rounded-lg border p-4">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="absolute -right-2 -top-2 z-10 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
                    aria-label="Remove experience"
                  >
                    <X size={14} />
                  </button>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`experiences.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experiences.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="Job title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`experiences.${index}.location`}
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
                      name={`experiences.${index}.startDate`}
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
                      name={`experiences.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select end date"
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
                    name={`experiences.${index}.isCurrent`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue(
                                  `experiences.${index}.endDate`,
                                  undefined
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          I currently work here
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
            onClick={addExperience}
            className="w-full"
          >
            Add Another Experience
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExperienceEditForm;
