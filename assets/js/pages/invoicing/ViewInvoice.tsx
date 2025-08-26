import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
  buildCSRFHeaders,
  getInvoice,
  GetInvoiceFields,
} from "../../ash_rpc";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { getI18n } from "../../lib/i18n";

interface ViewInvoicePageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  invoice_id: string;
  invoice: any | null;
}

const invoiceFields = [
  "id",
  "serialNumber", 
  "state",
  "issueDate",
  "dueDate",
  "currency",
  "companyName",
  "companyAddressLine1",
  "companyAddressLine2", 
  "companyCity",
  "companyPostalCode",
  "companyCountry",
  "companyVatNumber",
  "companyEmail",
  "companyPhone",
  "customerName",
  "customerAddressLine1",
  "customerAddressLine2",
  "customerCity", 
  "customerPostalCode",
  "customerCountry",
  "customerVatNumber",
  "customerEmail",
  "customerPhone",
] satisfies GetInvoiceFields;

export default function ViewInvoice({ locale, invoice_id, invoice: initialInvoice }: ViewInvoicePageProps) {
  const { t } = getI18n(locale);
  const [invoice, setInvoice] = useState<any>(initialInvoice);
  const [loading, setLoading] = useState(!initialInvoice);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialInvoice) {
      loadInvoice();
    }
  }, [invoice_id, initialInvoice]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);

      const invoiceResult = await getInvoice({
        input: { id: invoice_id },
        fields: invoiceFields,
        headers: buildCSRFHeaders(),
      });

      if (!invoiceResult.success) {
        throw new Error(invoiceResult.errors.map(e => e.message).join(', '));
      }

      setInvoice(invoiceResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invoicing.failedToLoadInvoices"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">{t("invoicing.loadingInvoice")}</div>
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
            onClick={loadInvoice}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            {t("invoicing.retry")}
          </button>
          <Link
            href="/invoices"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block"
          >
            {t("invoicing.backToInvoices")}
          </Link>
        </div>
      </InvoicingLayout>
    );
  }

  if (!invoice) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            {t("invoicing.invoiceNotFound")}
          </div>
          <Link
            href="/invoices"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block"
          >
            {t("invoicing.backToInvoices")}
          </Link>
        </div>
      </InvoicingLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalized':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("invoicing.invoice")} {invoice.serialNumber || `#${invoice.id.slice(-8)}`}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/invoices/${invoice_id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {t("common.edit")}
            </Link>
            <Link
              href="/invoices"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              {t("invoicing.backToInvoices")}
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">{t("invoicing.invoiceDetails")}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(invoice.state)}`}>
                {invoice.state.charAt(0).toUpperCase() + invoice.state.slice(1)}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Invoice Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">{t("invoicing.invoiceInformation")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.currency}</p>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">{t("invoicing.companyInformation")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">VAT Number</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.companyVatNumber || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{invoice.companyAddressLine1}</p>
                    {invoice.companyAddressLine2 && <p>{invoice.companyAddressLine2}</p>}
                    <p>{invoice.companyCity}, {invoice.companyPostalCode}</p>
                    <p>{invoice.companyCountry}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.companyEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.companyPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">{t("invoicing.customerInformation")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">VAT Number</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.customerVatNumber || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{invoice.customerAddressLine1}</p>
                    {invoice.customerAddressLine2 && <p>{invoice.customerAddressLine2}</p>}
                    <p>{invoice.customerCity}, {invoice.customerPostalCode}</p>
                    <p>{invoice.customerCountry}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{invoice.customerPhone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InvoicingLayout>
  );
}