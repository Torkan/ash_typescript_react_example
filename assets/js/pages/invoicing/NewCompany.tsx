import React from "react";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import {
  createCompany,
  createCompanyZodschema,
  validateCreateCompany,
  buildCSRFHeaders,
  CreateCompanyInput,
} from "../../ash_rpc";
import CompanyForm, { CompanyFormData } from "$lib/components/CompanyForm";
import { useAshRpcForm } from "$lib/useAshRpcForm";

interface NewCompanyPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

export default function NewCompany({}: NewCompanyPageProps) {
  const { formData, fieldErrors, handleChange, handleSubmit, error } =
    useAshRpcForm<CompanyFormData, CreateCompanyInput>({
      initialData: {
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
      },
      zodSchema: createCompanyZodschema,
      serverValidation: async (data) => {
        return validateCreateCompany({
          input: data,
          headers: buildCSRFHeaders(),
        });
      },
      onSubmit: async (data) => {
        return createCompany({
          input: data,
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });
      },
      onSuccess: () => {
        router.visit("/companies");
      },
    });

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
