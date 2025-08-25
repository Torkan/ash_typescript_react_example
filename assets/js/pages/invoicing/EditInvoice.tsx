import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
  buildCSRFHeaders,
  InvoiceEditView,
  listCompanies,
  listActiveCustomers,
  getInvoice,
  updateInvoice,
  updateInvoiceZodschema,
  validateUpdateInvoice,
  UpdateInvoiceInput,
  ListCompaniesFields,
  ListActiveCustomersFields,
  GetInvoiceFields,
} from "../../ash_rpc";
import InvoiceForm, { 
  CompanyType, 
  CustomerType, 
  InvoiceFormData
} from "../../lib/components/InvoiceForm";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { useAshRpcForm } from "../../lib/useAshRpcForm";

interface EditInvoicePageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  invoice_id: string;
  invoice: InvoiceEditView | null;
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

const invoiceFields = [
  "id",
  "state",
  "issueDate",
  "dueDate",
  "currency",
  "companyName",
  "customerName",
] satisfies GetInvoiceFields;

export default function EditInvoice({ locale, invoice_id }: EditInvoicePageProps) {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { formData, fieldErrors, handleChange, handleSubmit, error: formError } =
    useAshRpcForm<InvoiceFormData, UpdateInvoiceInput>({
      initialData: {
        issueDate: "",
        dueDate: "",
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
      zodSchema: updateInvoiceZodschema,
      serverValidation: async (data) => {
        return validateUpdateInvoice({
          primaryKey: invoice_id,
          input: data,
          headers: buildCSRFHeaders(),
        });
      },
      onSubmit: async (data) => {
        return updateInvoice({
          primaryKey: invoice_id,
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
  }, [invoice_id]);

  // Update form data when invoice is loaded
  useEffect(() => {
    if (invoice) {
      handleChange({
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency || "NOK",
        companyName: invoice.companyName || "",
        companyAddressLine1: invoice.companyAddressLine1 || "",
        companyAddressLine2: invoice.companyAddressLine2 || "",
        companyCity: invoice.companyCity || "",
        companyPostalCode: invoice.companyPostalCode || "",
        companyCountry: invoice.companyCountry || "",
        companyVatNumber: invoice.companyVatNumber || "",
        companyEmail: invoice.companyEmail || "",
        companyPhone: invoice.companyPhone || "",
        customerName: invoice.customerName || "",
        customerAddressLine1: invoice.customerAddressLine1 || "",
        customerAddressLine2: invoice.customerAddressLine2 || "",
        customerCity: invoice.customerCity || "",
        customerPostalCode: invoice.customerPostalCode || "",
        customerCountry: invoice.customerCountry || "",
        customerVatNumber: invoice.customerVatNumber || "",
        customerEmail: invoice.customerEmail || "",
        customerPhone: invoice.customerPhone || "",
        invoiceLines: invoice.invoiceLines || [],
      });
    }
  }, [invoice, handleChange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [companiesResult, customersResult, invoiceResult] = await Promise.all([
        listCompanies({
          fields: companyFields,
          headers: buildCSRFHeaders(),
        }),
        listActiveCustomers({
          fields: customerFields,
          headers: buildCSRFHeaders(),
        }),
        getInvoice({
          input: { id: invoice_id },
          fields: invoiceFields,
          headers: buildCSRFHeaders(),
        }),
      ]);

      if (!companiesResult.success) {
        throw new Error(companiesResult.errors.map(e => e.message).join(', '));
      }
      if (!customersResult.success) {
        throw new Error(customersResult.errors.map(e => e.message).join(', '));
      }
      if (!invoiceResult.success) {
        throw new Error(invoiceResult.errors.map(e => e.message).join(', '));
      }

      setCompanies(companiesResult.data.results);
      setCustomers(customersResult.data);
      
      setInvoice(invoiceResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/invoices';
  };

  if (loading) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading invoice...</div>
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Retry
          </button>
          <Link
            href="/invoices"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block"
          >
            Back to Invoices
          </Link>
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
        isEditing={true}
      />
    </InvoicingLayout>
  );
}