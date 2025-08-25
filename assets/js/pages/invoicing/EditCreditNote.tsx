import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
  buildCSRFHeaders,
  listCompanies,
  listActiveCustomers,
  listInvoicesByState,
  getCreditNote,
  updateCreditNote,
  updateCreditNoteZodschema,
  validateUpdateCreditNote,
  UpdateCreditNoteInput,
  ListCompaniesFields,
  ListActiveCustomersFields,
  ListInvoicesByStateFields,
  GetCreditNoteFields,
} from "../../ash_rpc";
import CreditNoteForm, { 
  CompanyType, 
  CustomerType, 
  InvoiceType, 
  CreditNoteFormData
} from "../../lib/components/CreditNoteForm";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { useAshRpcForm } from "../../lib/useAshRpcForm";

interface EditCreditNotePageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  credit_note_id: string;
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

const creditNoteFields = [
  'id', 'state', 'originalInvoiceId', 'issueDate', 
  'creditReason', 'currency', 'companyName', 'customerName'
] satisfies GetCreditNoteFields;

export default function EditCreditNote({ locale, credit_note_id }: EditCreditNotePageProps) {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [creditNote, setCreditNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { formData, fieldErrors, handleChange, handleSubmit, error: formError } =
    useAshRpcForm<CreditNoteFormData, UpdateCreditNoteInput>({
      initialData: {
        issueDate: "",
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
      zodSchema: updateCreditNoteZodschema,
      serverValidation: async (data) => {
        return validateUpdateCreditNote({
          primaryKey: credit_note_id,
          input: data,
          headers: buildCSRFHeaders(),
        });
      },
      onSubmit: async (data) => {
        return updateCreditNote({
          primaryKey: credit_note_id,
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
  }, [credit_note_id]);

  // Update form data when credit note is loaded
  useEffect(() => {
    if (creditNote) {
      handleChange({
        issueDate: creditNote.issueDate,
        creditReason: creditNote.creditReason || "",
        currency: creditNote.currency || "NOK",
        originalInvoiceId: creditNote.originalInvoiceId || null,
        companyName: creditNote.companyName || "",
        companyAddressLine1: creditNote.companyAddressLine1 || "",
        companyAddressLine2: creditNote.companyAddressLine2 || "",
        companyCity: creditNote.companyCity || "",
        companyPostalCode: creditNote.companyPostalCode || "",
        companyCountry: creditNote.companyCountry || "",
        companyVatNumber: creditNote.companyVatNumber || "",
        companyEmail: creditNote.companyEmail || "",
        companyPhone: creditNote.companyPhone || "",
        customerName: creditNote.customerName || "",
        customerAddressLine1: creditNote.customerAddressLine1 || "",
        customerAddressLine2: creditNote.customerAddressLine2 || "",
        customerCity: creditNote.customerCity || "",
        customerPostalCode: creditNote.customerPostalCode || "",
        customerCountry: creditNote.customerCountry || "",
        customerVatNumber: creditNote.customerVatNumber || "",
        customerEmail: creditNote.customerEmail || "",
        customerPhone: creditNote.customerPhone || "",
        creditNoteLines: creditNote.creditNoteLines || [],
      });
    }
  }, [creditNote, handleChange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [companiesResult, customersResult, invoicesResult, creditNoteResult] = await Promise.all([
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
        getCreditNote({
          input: { id: credit_note_id },
          fields: creditNoteFields,
          headers: buildCSRFHeaders(),
        }),
      ]);

      if (!companiesResult.success) {
        throw new Error(companiesResult.errors.map(e => e.message).join(', '));
      }
      if (!customersResult.success) {
        throw new Error(customersResult.errors.map(e => e.message).join(', '));
      }
      if (!invoicesResult.success) {
        throw new Error(invoicesResult.errors.map(e => e.message).join(', '));
      }
      if (!creditNoteResult.success) {
        throw new Error(creditNoteResult.errors.map(e => e.message).join(', '));
      }

      setCompanies(companiesResult.data.results);
      setCustomers(customersResult.data);
      setInvoices(invoicesResult.data);
      setCreditNote(creditNoteResult.data);
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
          <div className="text-lg">Loading credit note...</div>
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
            href="/credit-notes"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block"
          >
            Back to Credit Notes
          </Link>
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
        isEditing={true}
      />
    </InvoicingLayout>
  );
}