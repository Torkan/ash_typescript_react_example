import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import {
  updateCompany,
  updateCompanyZodschema,
  validateUpdateCompany,
  deleteCompany,
  buildCSRFHeaders,
  UpdateCompanyInput,
  CompanyEditView,
} from "../../ash_rpc";
import CompanyForm, { CompanyFormData } from "$lib/components/CompanyForm";
import { useAshRpcForm } from "$lib/useAshRpcForm";
import InvoicingLayout from "../../lib/components/InvoicingLayout";

interface EditCompanyPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  company_id: string;
  company: CompanyEditView | null;
}

export default function EditCompany({ company_id, company, locale }: EditCompanyPageProps) {
  const [error, setError] = useState<string | null>(null);

  if (!company) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">Company not found</div>
        </div>
      </InvoicingLayout>
    );
  }

  const {
    formData,
    fieldErrors,
    handleChange,
    handleSubmit,
    error: formError,
  } = useAshRpcForm<CompanyFormData, UpdateCompanyInput>({
    initialData: {
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
    },
    zodSchema: updateCompanyZodschema,
    serverValidation: async (data) => {
      return validateUpdateCompany({
        primaryKey: company_id,
        input: data,
        headers: buildCSRFHeaders(),
      });
    },
    onSubmit: async (data) => {
      return updateCompany({
        primaryKey: company_id,
        input: data,
        fields: ["id"],
        headers: buildCSRFHeaders(),
      });
    },
    onSuccess: () => {
      router.visit("/companies");
    },
  });

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

  return (
    <InvoicingLayout locale={locale}>
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

          {(error || formError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || formError}
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
    </InvoicingLayout>
  );
}
