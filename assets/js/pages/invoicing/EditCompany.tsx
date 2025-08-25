import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import {
  getCompany,
  updateCompany,
  updateCompanyZodschema,
  validateUpdateCompany,
  deleteCompany,
  buildCSRFHeaders,
  GetCompanyFields,
  UpdateCompanyInput,
} from "../../ash_rpc";
import CompanyForm, { CompanyFormData } from "$lib/components/CompanyForm";
import { useAshRpcForm } from "$lib/useAshRpcForm";

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

  const {
    formData,
    setFormData,
    fieldErrors,
    handleChange,
    handleSubmit,
    error,
    setError,
  } = useAshRpcForm<CompanyFormData, UpdateCompanyInput>({
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

  useEffect(() => {
    loadCompany();
  }, [company_id]);

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
