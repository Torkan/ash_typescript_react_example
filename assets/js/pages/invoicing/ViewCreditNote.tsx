import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
  buildCSRFHeaders,
  getCreditNote,
  GetCreditNoteFields,
} from "../../ash_rpc";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { getI18n } from "../../lib/i18n";

interface ViewCreditNotePageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  credit_note_id: string;
  credit_note: any | null;
}

const creditNoteFields = [
  "id",
  "serialNumber",
  "state", 
  "originalInvoiceId",
  "issueDate",
  "creditReason",
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
] satisfies GetCreditNoteFields;

export default function ViewCreditNote({ locale, credit_note_id, credit_note: initialCreditNote }: ViewCreditNotePageProps) {
  const { t } = getI18n(locale);
  const [creditNote, setCreditNote] = useState<any>(initialCreditNote);
  const [loading, setLoading] = useState(!initialCreditNote);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialCreditNote) {
      loadCreditNote();
    }
  }, [credit_note_id, initialCreditNote]);

  const loadCreditNote = async () => {
    try {
      setLoading(true);
      setError(null);

      const creditNoteResult = await getCreditNote({
        input: { id: credit_note_id },
        fields: creditNoteFields,
        headers: buildCSRFHeaders(),
      });

      if (!creditNoteResult.success) {
        throw new Error(creditNoteResult.errors.map(e => e.message).join(', '));
      }

      setCreditNote(creditNoteResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("invoicing.failedToLoadCreditNotes"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">{t("invoicing.loadingCreditNote")}</div>
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
            onClick={loadCreditNote}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            {t("invoicing.retry")}
          </button>
          <Link
            href="/credit-notes"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block"
          >
            {t("invoicing.backToCreditNotes")}
          </Link>
        </div>
      </InvoicingLayout>
    );
  }

  if (!creditNote) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            {t("invoicing.creditNoteNotFound")}
          </div>
          <Link
            href="/credit-notes"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block"
          >
            {t("invoicing.backToCreditNotes")}
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

  const getStateTranslation = (state: string) => {
    switch (state) {
      case 'draft':
        return t('invoicing.states.draft');
      case 'finalized':
        return t('invoicing.states.finalized');
      case 'cancelled':
        return t('invoicing.states.cancelled');
      default:
        return state;
    }
  };

  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("invoicing.creditNote")} {creditNote.serialNumber || `#${creditNote.id.slice(-8)}`}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/credit-notes/${credit_note_id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {t("common.edit")}
            </Link>
            <Link
              href="/credit-notes"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              {t("invoicing.backToCreditNotes")}
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">{t("invoicing.creditNoteDetails")}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(creditNote.state)}`}>
                {getStateTranslation(creditNote.state)}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Credit Note Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">{t("invoicing.creditNoteInformation")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.issueDate")}</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(creditNote.issueDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.currency")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.currency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.originalInvoiceId")}</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {creditNote.originalInvoiceId ? 
                      <Link 
                        href={`/invoices/${creditNote.originalInvoiceId}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {creditNote.originalInvoiceId.slice(-8)}
                      </Link> 
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.creditReason")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.creditReason || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">{t("invoicing.companyInformation")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.companyName")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.vatNumber")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.companyVatNumber || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.addressLine1")}</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{creditNote.companyAddressLine1}</p>
                    {creditNote.companyAddressLine2 && <p>{creditNote.companyAddressLine2}</p>}
                    <p>{creditNote.companyCity}, {creditNote.companyPostalCode}</p>
                    <p>{creditNote.companyCountry}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("common.email")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.companyEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.phone")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.companyPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">{t("invoicing.customerInformation")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.customerName")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.vatNumber")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.customerVatNumber || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.addressLine1")}</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{creditNote.customerAddressLine1}</p>
                    {creditNote.customerAddressLine2 && <p>{creditNote.customerAddressLine2}</p>}
                    <p>{creditNote.customerCity}, {creditNote.customerPostalCode}</p>
                    <p>{creditNote.customerCountry}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("common.email")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("invoicing.phone")}</label>
                  <p className="mt-1 text-sm text-gray-900">{creditNote.customerPhone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InvoicingLayout>
  );
}