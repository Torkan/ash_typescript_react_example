import React, { useState, useEffect, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { z } from "zod";
import {
  getCompany,
  updateCompany,
  updateCompanyZodschema,
  validateUpdateCompany,
  deleteCompany,
  buildCSRFHeaders,
  GetCompanyFields,
} from "../../ash_rpc";
import CompanyForm, {
  CompanyFormData,
  CompanyFormFieldErrors,
} from "../../lib/components/CompanyForm";

interface EditCompanyPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  company_id: string;
}

const companyFields = [
  "id",
  "name",
  "addressLine1",
  "addressLine2",
  "city",
  "postalCode",
  "country",
  "vatNumber",
  "email",
  "phone",
  "isDefault",
] satisfies GetCompanyFields;

export default function EditCompany({ company_id }: EditCompanyPageProps) {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadCompany();
  }, [company_id]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const loadCompany = async () => {
    if (!company_id) return;

    try {
      setLoading(true);
      const result = await getCompany({
        input: { id: company_id },
        fields: companyFields,
        headers: buildCSRFHeaders(),
      });

      if (result.success && result.data) {
        const company = result.data;
        setFormData({
          name: company.name,
          addressLine1: company.addressLine1,
          addressLine2: company.addressLine2 || "",
          city: company.city,
          postalCode: company.postalCode,
          country: company.country,
          vatNumber: company.vatNumber || "",
          email: company.email || "",
          phone: company.phone || "",
          isDefault: company.isDefault,
        });
      } else if (!result.success) {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }
      setError(null);
    } catch (err) {
      setError("Failed to load company");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data: CompanyFormData): CompanyFormFieldErrors => {
    const result = updateCompanyZodschema.safeParse(data);
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

  const performServerValidation = useCallback(
    async (data: CompanyFormData) => {
      if (!company_id) return;

      try {
        const result = await validateUpdateCompany({
          primaryKey: company_id,
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
    },
    [company_id],
  );

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
    if (!company_id) return;

    setError(null);

    // Final validation before submit
    const validationErrors = validateForm(formData);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the validation errors below");
      return;
    }

    try {
      const result = await updateCompany({
        primaryKey: company_id,
        input: formData,
        fields: ["id"],
        headers: buildCSRFHeaders(),
      });
      if (!result.success) {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }
      router.visit("/companies");
    } catch (err) {
      setError("Failed to update company");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!company_id) return;

    if (confirm("Are you sure you want to delete this company?")) {
      try {
        const result = await deleteCompany({
          primaryKey: company_id,
          headers: buildCSRFHeaders(),
        });
        if (!result.success) {
          throw new Error(result.errors.map((e) => e.message).join(", "));
        }
        router.visit("/companies");
      } catch (err) {
        setError("Failed to delete company");
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    router.visit("/companies");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading company...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/companies"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Companies
          </Link>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete Company
          </button>
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
          isEditing={true}
        />
      </div>
    </div>
  );
}
