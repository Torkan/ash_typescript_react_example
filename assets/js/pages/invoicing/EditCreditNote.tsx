import React, { useState, useEffect } from "react";
import { 
  listCompanies,
  listActiveCustomers,
  listInvoicesByState,
  getCreditNote,
  buildCSRFHeaders,
  ListCompaniesFields,
  ListActiveCustomersFields,
  ListInvoicesByStateFields,
  GetCreditNoteFields,
} from "../../ash_rpc";
import CreditNoteForm, { CompanyType, CustomerType, InvoiceType } from "../../lib/components/CreditNoteForm";
import InvoicingLayout from "../../lib/components/InvoicingLayout";

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

  useEffect(() => {
    loadData();
  }, [credit_note_id]);

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

      setCompanies(companiesResult.data);
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

  const handleSuccess = () => {
    window.location.href = '/credit-notes';
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

  if (error) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={loadData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Retry
          </button>
          <a
            href="/credit-notes"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block"
          >
            Back to Credit Notes
          </a>
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
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        initialData={creditNote}
      />
    </InvoicingLayout>
  );
}