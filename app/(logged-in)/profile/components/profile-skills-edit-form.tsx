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
import React, { useEffect, useRef } from "react";
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

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prevFieldsLength = useRef(fields.length);
  const initialRenderRef = useRef(true);

  const adjustInputWidth = (index: number) => {
    const input = inputRefs.current[index];
    if (input) {
      // Reset to min width first
      input.style.width = "5rem";

      const style = window.getComputedStyle(input);
      const paddingLeft = parseFloat(style.paddingLeft);
      const paddingRight = parseFloat(style.paddingRight);
      const totalPadding = paddingLeft + paddingRight;

      // Calculate new width based on content
      const newWidth = Math.max(input.scrollWidth + totalPadding, 80);

      // Get parent container width
      const parentWidth =
        input.parentElement?.parentElement?.parentElement?.offsetWidth || 0;

      // Set width with max of 100% of parent
      input.style.width = `${Math.min(newWidth, parentWidth)}px`;
    }
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onFormChange && value.skills) {
        onFormChange(value as z.infer<typeof formSchema>);
        setIsFormValid(form.formState.isValid);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange, setIsFormValid]);

  useEffect(() => {
    // Focus on newly added field
    if (fields.length > prevFieldsLength.current) {
      const newIndex = fields.length - 1;
      inputRefs.current[newIndex]?.focus();
    }
    prevFieldsLength.current = fields.length;
  }, [fields.length]);

  useEffect(() => {
    // Adjust all input widths on initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      setTimeout(() => {
        fields.forEach((_, index) => {
          adjustInputWidth(index);
        });
      }, 0);
    }
  }, [fields]);

  const addSkillField = () => {
    append({ value: "" });
  };

  const removeSkillField = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      // Focus previous input after removal
      if (index > 0) {
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 0);
      }
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

          <div className="flex flex-wrap items-start gap-3">
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
                          className="rounded-full text-sm"
                          style={{ width: "5rem" }}
                          {...fieldProps}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                            if (el) {
                              adjustInputWidth(index);
                            }
                          }}
                          onInput={() => adjustInputWidth(index)}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Backspace" &&
                              fieldProps.value === "" &&
                              fields.length > 1
                            ) {
                              e.preventDefault();
                              removeSkillField(index);
                            }
                          }}
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
