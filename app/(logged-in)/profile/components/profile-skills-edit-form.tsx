"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  skills: z
    .array(
      z.object({
        value: z
          .string()
          .min(1, { message: "Skill cannot be empty" })
          .max(50, { message: "Skill must be less than 50 characters" })
      })
    )
    .min(1, { message: "At least one skill is required" })
});

interface SkillsEditFormProps {
  skills: string[];
  setIsFormValid: React.Dispatch<React.SetStateAction<boolean>>;
  onFormChange?: (values: z.infer<typeof formSchema>) => void;
}

const SkillsEditForm: React.FC<SkillsEditFormProps> = ({
  skills,
  onFormChange,
  setIsFormValid
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills:
        skills?.length > 0
          ? skills?.map((skill) => ({ value: skill }))
          : [{ value: "" }, { value: "" }, { value: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills"
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onFormChange && value.skills) {
        onFormChange(value as z.infer<typeof formSchema>);
        setIsFormValid(form.formState.isValid);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  const addSkillField = () => {
    append({ value: "" });
  };

  const removeSkillField = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Form {...form}>
      <form id="skills-edit-form" className="space-y-6">
        <div className="space-y-4">
          <FormDescription>
            Add skills that showcase your expertise and help others understand
            your capabilities
          </FormDescription>

          <div className="flex flex-wrap items-center gap-3">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`skills.${index}.value`}
                render={({ field: fieldProps }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={`Skill ${index + 1}`}
                          className="w-32 rounded-full pr-12 text-sm"
                          {...fieldProps}
                        />

                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSkillField(index)}
                            className="absolute -right-2 -top-2 z-10 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
                            aria-label="Remove skill"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              onClick={addSkillField}
              className="size-8 rounded-full text-base"
              aria-label="Add skill"
              variant="outline-primary"
            >
              +
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SkillsEditForm;
