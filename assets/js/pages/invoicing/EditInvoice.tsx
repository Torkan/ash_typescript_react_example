import React, { useState, useEffect } from "react";
import {
  listCompanies,
  listActiveCustomers,
  getInvoice,
  buildCSRFHeaders,
  ListCompaniesFields,
  ListActiveCustomersFields,
  GetInvoiceFields,
} from "../../ash_rpc";
import InvoiceForm, { CompanyType, CustomerType } from "../../lib/components/InvoiceForm";
import InvoicingLayout from "../../lib/components/InvoicingLayout";

interface EditInvoicePageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  invoice_id: string;
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

  useEffect(() => {
    loadData();
  }, [invoice_id]);

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

      setCompanies(companiesResult.data);
      setCustomers(customersResult.data);
      
      setInvoice(invoiceResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    window.location.href = '/invoices';
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
            href="/invoices"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block"
          >
            Back to Invoices
          </a>
        </div>
      </InvoicingLayout>
    );
  }

  return (
    <InvoicingLayout locale={locale}>
      <InvoiceForm
        companies={companies}
        customers={customers}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        initialData={invoice}
      />
    </InvoicingLayout>
  );
}