import React, { useState, useEffect } from "react";
import {
  listCompanies,
  listActiveCustomers,
  listInvoicesByState,
  buildCSRFHeaders,
  ListCompaniesFields,
  ListActiveCustomersFields,
  ListInvoicesByStateFields,
  createCreditNote,
  createCreditNoteZodschema,
  validateCreateCreditNote,
  CreateCreditNoteInput,
} from "../../ash_rpc";
import CreditNoteForm, { 
  CompanyType, 
  CustomerType, 
  InvoiceType, 
  CreditNoteFormData
} from "../../lib/components/CreditNoteForm";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { useAshRpcForm } from "../../lib/useAshRpcForm";

interface NewCreditNotePageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

const companyFields = [
  'id', 'name', 'addressLine1', 'addressLine2', 'city', 
  'postalCode', 'country', 'vatNumber', 'email', 'phone', 'isDefault'
] satisfies ListCompaniesFields;

const customerFields = [
  'id', 'name', 'addressLine1', 'addressLine2', 'city', 
  'postalCode', 'country', 'vatNumber', 'email', 'phone'
] satisfies ListActiveCustomersFields;

const invoiceFields = [
  'id', 'serialNumber', 'customerName', 'companyName', 'currency', 'issueDate'
] satisfies ListInvoicesByStateFields;

export default function NewCreditNote({ locale }: NewCreditNotePageProps) {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { formData, fieldErrors, handleChange, handleSubmit, error: formError } =
    useAshRpcForm<CreditNoteFormData, CreateCreditNoteInput>({
      initialData: {
        issueDate: new Date().toISOString().split("T")[0],
        creditReason: "",
        currency: "NOK",
        originalInvoiceId: null,
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
        creditNoteLines: [],
      },
      zodSchema: createCreditNoteZodschema,
      serverValidation: async (data) => {
        return validateCreateCreditNote({
          input: data,
          headers: buildCSRFHeaders(),
        });
      },
      onSubmit: async (data) => {
        return createCreditNote({
          input: data,
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });
      },
      onSuccess: () => {
        window.location.href = "/credit-notes";
      },
    });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesResult, customersResult, invoicesResult] = await Promise.all([
        listCompanies({
          fields: companyFields,
          headers: buildCSRFHeaders(),
        }),
        listActiveCustomers({
          fields: customerFields,
          headers: buildCSRFHeaders(),
        }),
        listInvoicesByState({
          input: { state: 'finalized' },
          fields: invoiceFields,
          headers: buildCSRFHeaders(),
        }),
      ]);
      
      if (!companiesResult.success) {
        throw new Error(companiesResult.errors.map((e) => e.message).join(", "));
      }
      if (!customersResult.success) {
        throw new Error(customersResult.errors.map((e) => e.message).join(", "));
      }
      if (!invoicesResult.success) {
        throw new Error(invoicesResult.errors.map((e) => e.message).join(", "));
      }
      
      setCompanies(companiesResult.data.results);
      setCustomers(customersResult.data);
      setInvoices(invoicesResult.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/credit-notes';
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
      <CreditNoteForm
        companies={companies}
        customers={customers}
        invoices={invoices}
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