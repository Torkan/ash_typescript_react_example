import React, { useState, useEffect } from "react";
import {
  listCompanies,
  listActiveCustomers,
  buildCSRFHeaders,
  ListCompaniesFields,
  ListActiveCustomersFields,
  createInvoice,
  createInvoiceZodschema,
  validateCreateInvoice,
  CreateInvoiceInput,
} from "../../ash_rpc";
import InvoiceForm, {
  CompanyType,
  CustomerType,
  InvoiceFormData,
} from "../../lib/components/InvoiceForm";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { useAshRpcForm } from "../../lib/useAshRpcForm";

interface NewInvoicePageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
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
] satisfies ListCompaniesFields;

const customerFields = [
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
] satisfies ListActiveCustomersFields;

export default function NewInvoice({ locale }: NewInvoicePageProps) {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    formData,
    fieldErrors,
    handleChange,
    handleSubmit,
    error: formError,
  } = useAshRpcForm<InvoiceFormData, CreateInvoiceInput>({
    initialData: {
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      currency: "NOK",
      companyName: "",
      companyAddressLine1: "",
      companyAddressLine2: "",
      companyCity: "",
      companyPostalCode: "",
      companyCountry: "",
      companyVatNumber: "",
      companyEmail: "",
      companyPhone: "",
      customerName: "",
      customerAddressLine1: "",
      customerAddressLine2: "",
      customerCity: "",
      customerPostalCode: "",
      customerCountry: "",
      customerVatNumber: "",
      customerEmail: "",
      customerPhone: "",
      invoiceLines: [],
    },
    zodSchema: createInvoiceZodschema,
    serverValidation: async (data) => {
      return validateCreateInvoice({
        input: data,
        headers: buildCSRFHeaders(),
      });
    },
    onSubmit: async (data) => {
      return createInvoice({
        input: data,
        fields: ["id"],
        headers: buildCSRFHeaders(),
      });
    },
    onSuccess: () => {
      window.location.href = "/invoices";
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesResult, customersResult] = await Promise.all([
        listCompanies({
          fields: companyFields,
          headers: buildCSRFHeaders(),
        }),
        listActiveCustomers({
          fields: customerFields,
          headers: buildCSRFHeaders(),
        }),
      ]);

      if (!companiesResult.success) {
        throw new Error(
          companiesResult.errors.map((e) => e.message).join(", "),
        );
      }
      if (!customersResult.success) {
        throw new Error(
          customersResult.errors.map((e) => e.message).join(", "),
        );
      }

      setCompanies(companiesResult.data.results);
      setCustomers(customersResult.data);
      setError(null);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = "/invoices";
  };

  if (loading) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </InvoicingLayout>
    );
  }

  if (error || formError) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || formError}
          </div>
          <button
            onClick={loadData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </InvoicingLayout>
    );
  }

  return (
    <InvoicingLayout locale={locale}>
      <InvoiceForm
        companies={companies}
        customers={customers}
        formData={formData}
        fieldErrors={fieldErrors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={false}
      />
    </InvoicingLayout>
  );
}
