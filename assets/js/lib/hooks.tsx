import { useState, useCallback, useRef, useEffect } from "react";
import { z } from "zod";
import { buildCSRFHeaders } from "../ash_rpc";

export interface UseAshRpcFormConfig<TFormData, TSubmitResult> {
  initialData: TFormData;
  zodSchema: z.ZodSchema<TFormData>;
  serverValidation?: (data: TFormData) => Promise<{
    success: boolean;
    errors: Array<{
      type: string;
      field?: string;
      message: string;
    }>;
  }>;
  onSubmit: (data: TFormData) => Promise<{
    success: boolean;
    data?: TSubmitResult;
    errors: Array<{
      type: string;
      field?: string;
      message: string;
    }>;
  }>;
  onSuccess: (result: TSubmitResult) => void;
  debounceMs?: number;
}

export type FormFieldErrors<TFormData> = {
  [K in keyof TFormData]?: string[];
};

export function useAshRpcForm<TFormData, TSubmitResult = any>({
  initialData,
  zodSchema,
  serverValidation,
  onSubmit,
  onSuccess,
  debounceMs = 300,
}: UseAshRpcFormConfig<TFormData, TSubmitResult>) {
  const [formData, setFormData] = useState<TFormData>(initialData);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors<TFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const validateForm = useCallback(
    (data: TFormData): FormFieldErrors<TFormData> => {
      const result = zodSchema.safeParse(data);
      const errors: FormFieldErrors<TFormData> = {};

      if (!result.success) {
        // Use treeifyError for cleaner error structure
        const tree = z.treeifyError(result.error);

        // Extract field errors from the tree structure
        if (tree.properties) {
          Object.entries(tree.properties).forEach(([fieldName, fieldError]) => {
            if (fieldError && fieldError.errors && fieldError.errors.length > 0) {
              const key = fieldName as keyof FormFieldErrors<TFormData>;
              errors[key] = fieldError.errors; // Keep all error messages
            }
          });
        }
      }

      return errors;
    },
    [zodSchema]
  );

  const performServerValidation = useCallback(
    async (data: TFormData) => {
      if (!serverValidation) return;

      try {
        const result = await serverValidation(data);

        if (!result.success) {
          const serverErrors: FormFieldErrors<TFormData> = {};

          result.errors.forEach((error) => {
            if (error.type === "validation_error" && error.field) {
              const fieldName = error.field as keyof FormFieldErrors<TFormData>;
              // Ensure we have an array of error messages
              if (!serverErrors[fieldName]) {
                serverErrors[fieldName] = [];
              }
              // Add the error message to the array
              serverErrors[fieldName]!.push(error.message);
            }
          });

          // Merge server errors with existing client-side errors
          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            ...serverErrors,
          }));
        }
      } catch (err) {
        console.error("Server validation error:", err);
      }
    },
    [serverValidation]
  );

  const handleChange = useCallback(
    (newFormData: TFormData) => {
      setFormData(newFormData);

      // Real-time validation - validate as user types
      const validationErrors = validateForm(newFormData);
      setFieldErrors(validationErrors);

      // Only perform server validation if client-side validation passes
      if (Object.keys(validationErrors).length === 0 && serverValidation) {
        // Cancel previous debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set new debounce timer for server validation
        debounceTimerRef.current = setTimeout(() => {
          performServerValidation(newFormData);
        }, debounceMs);
      }
    },
    [validateForm, performServerValidation, serverValidation, debounceMs]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setError(null);

      // Final validation before submit
      const validationErrors = validateForm(formData);
      setFieldErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        setError("Please fix the validation errors below");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await onSubmit(formData);
        if (!result.success) {
          throw new Error(result.errors.map((e) => e.message).join(", "));
        }
        if (result.data) {
          onSuccess(result.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, onSubmit, onSuccess]
  );

  return {
    formData,
    setFormData,
    fieldErrors,
    handleChange,
    handleSubmit,
    isSubmitting,
    error,
    setError,
  };
}