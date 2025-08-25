import { useState, useCallback, useRef, useEffect } from "react";
import { z } from "zod";

export interface UseAshRpcFormConfig<TFormData, TInputData, TSubmitResult> {
  initialData: TFormData;
  zodSchema: z.ZodSchema<TInputData>;
  serverValidation?: (data: TInputData) => Promise<
    | {
        success: true;
      }
    | {
        success: false;
        errors: Array<{
          type: string;
          field?: string;
          errors?: string[];
        }>;
      }
  >;
  onSubmit: (data: TInputData) => Promise<
    | {
        success: true;
        data?: TSubmitResult;
      }
    | {
        success: false;
        errors: Array<{
          type: string;
          field?: string;
          message: string;
        }>;
      }
  >;
  onSuccess: (result: TSubmitResult) => void;
  debounceMs?: number;
}

export type FormFieldErrors<TFormData> = {
  [K in keyof TFormData]?: string[];
};

export function useAshRpcForm<
  TFormData extends TInputData,
  TInputData,
  TSubmitResult = any,
>({
  initialData,
  zodSchema,
  serverValidation,
  onSubmit,
  onSuccess,
  debounceMs = 300,
}: UseAshRpcFormConfig<TFormData, TInputData, TSubmitResult>) {
  const [formData, setFormData] = useState<TFormData>(initialData);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors<TFormData>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const validateForm = useCallback(
    (data: TInputData): FormFieldErrors<TFormData> => {
      const result = zodSchema.safeParse(data);
      const errors: FormFieldErrors<TFormData> = {};

      if (!result.success) {
        const tree = z.treeifyError(result.error);

        // Due to the generics, we have to do a bit of type trickery here
        if ("properties" in tree && tree.properties) {
          Object.entries(tree.properties).forEach(([fieldName, fieldError]) => {
            const errorObj = fieldError as { errors: string[] };
            if (errorObj && errorObj.errors && errorObj.errors.length > 0) {
              const key = fieldName as keyof FormFieldErrors<TFormData>;
              errors[key] = errorObj.errors;
            }
          });
        }
      }

      return errors;
    },
    [zodSchema],
  );

  const performServerValidation = useCallback(
    async (data: TInputData) => {
      if (!serverValidation) return;

      try {
        const result = await serverValidation(data);

        if (!result.success) {
          const serverErrors: FormFieldErrors<TFormData> = {};

          result.errors.forEach((error) => {
            if (error.type === "validation_error" && error.field) {
              const fieldName = error.field as keyof FormFieldErrors<TFormData>;
              serverErrors[fieldName] = error.errors || [];
            }
          });

          setFieldErrors(serverErrors);
        }
      } catch (err) {
        console.error("Server validation error:", err);
      }
    },
    [serverValidation],
  );

  const handleChange = useCallback(
    (newFormData: TFormData) => {
      setFormData(newFormData);

      const validationErrors = validateForm(newFormData as TInputData);
      setFieldErrors(validationErrors);

      // Only perform server validation if client-side validation passes
      if (Object.keys(validationErrors).length === 0 && serverValidation) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          performServerValidation(newFormData as TInputData);
        }, debounceMs);
      }
    },
    [validateForm, performServerValidation, serverValidation, debounceMs],
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setError(null);

      const validationErrors = validateForm(formData as TInputData);
      setFieldErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        setError("Please fix the validation errors below");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await onSubmit(formData as TInputData);
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
    [formData, validateForm, onSubmit, onSuccess],
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
