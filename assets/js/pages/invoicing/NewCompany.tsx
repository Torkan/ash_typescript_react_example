import React, { useState, useCallback, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { z } from "zod";
import {
  createCompany,
  createCompanyZodschema,
  validateCreateCompany,
  buildCSRFHeaders,
} from "../../ash_rpc";
import CompanyForm, {
  CompanyFormData,
  CompanyFormFieldErrors,
} from "../../lib/components/CompanyForm";

interface NewCompanyPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

export default function NewCompany({}: NewCompanyPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CompanyFormFieldErrors>({});
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "Norway",
    vatNumber: "",
    email: "",
    phone: "",
    isDefault: false,
  });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const validateForm = (data: CompanyFormData): CompanyFormFieldErrors => {
    const result = createCompanyZodschema.safeParse(data);
    const errors: CompanyFormFieldErrors = {};

    if (!result.success) {
      // Use treeifyError for cleaner error structure
      const tree = z.treeifyError(result.error);

      // Extract field errors from the tree structure
      if (tree.properties) {
        Object.entries(tree.properties).forEach(([fieldName, fieldError]) => {
          if (fieldError && fieldError.errors && fieldError.errors.length > 0) {
            const key = fieldName as keyof CompanyFormFieldErrors;
            errors[key] = fieldError.errors; // Keep all error messages
          }
        });
      }
    }

    return errors;
  };

  const performServerValidation = useCallback(async (data: CompanyFormData) => {
    try {
      const result = await validateCreateCompany({
        input: data,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        const serverErrors: CompanyFormFieldErrors = {};

        result.errors.forEach((error) => {
          if (error.type === "validation_error" && error.field) {
            const fieldName = error.field as keyof CompanyFormFieldErrors;
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
  }, []);

  const handleChange = (newFormData: CompanyFormData) => {
    setFormData(newFormData);

    // Real-time validation - validate as user types
    const validationErrors = validateForm(newFormData);
    setFieldErrors(validationErrors);

    // Only perform server validation if client-side validation passes
    if (Object.keys(validationErrors).length === 0) {
      // Cancel previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer for server validation
      debounceTimerRef.current = setTimeout(() => {
        performServerValidation(newFormData);
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Final validation before submit
    const validationErrors = validateForm(formData);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the validation errors below");
      return;
    }

    try {
      const result = await createCompany({
        input: formData,
        fields: ["id"],
        headers: buildCSRFHeaders(),
      });
      if (!result.success) {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }
      router.visit("/companies");
    } catch (err) {
      setError("Failed to create company");
      console.error(err);
    }
  };

  const handleCancel = () => {
    router.visit("/companies");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/companies"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Companies
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <CompanyForm
          formData={formData}
          fieldErrors={fieldErrors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={false}
        />
      </div>
    </div>
  );
}
