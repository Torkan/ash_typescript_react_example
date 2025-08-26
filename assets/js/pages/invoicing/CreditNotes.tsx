import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { 
  deleteCreditNote,
  finalizeCreditNote,
  cancelCreditNote,
  buildCSRFHeaders,
  CreditNotesListView,
} from "../../ash_rpc";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { getI18n } from "../../lib/i18n";

interface CreditNotesPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  credit_notes: CreditNotesListView;
}


export default function CreditNotes({ credit_notes: initialCreditNotes, locale }: CreditNotesPageProps) {
  const { t } = getI18n(locale);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "draft" | "finalized" | "cancelled">("all");


  const handleFinalize = async (id: string) => {
    if (confirm(t("invoicing.confirmFinalizeCreditNote"))) {
      try {
        const result = await finalizeCreditNote({
          primaryKey: id,
          fields: ['id'],
          headers: buildCSRFHeaders(),
        });
        if (!result.success) {
          throw new Error(result.errors.map(e => e.message).join(', '));
        }
        window.location.reload();
      } catch (err) {
        setError(t("invoicing.failedToFinalizeCreditNote"));
        console.error(err);
      }
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm(t("invoicing.confirmCancelCreditNote"))) {
      try {
        const result = await cancelCreditNote({
          primaryKey: id,
          fields: ['id'],
          headers: buildCSRFHeaders(),
        });
        if (!result.success) {
          throw new Error(result.errors.map(e => e.message).join(', '));
        }
        window.location.reload();
      } catch (err) {
        setError(t("invoicing.failedToCancelCreditNote"));
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("invoicing.confirmDeleteCreditNote"))) {
      try {
        const result = await deleteCreditNote({
          primaryKey: id,
          headers: buildCSRFHeaders(),
        });
        if (!result.success) {
          throw new Error(result.errors.map(e => e.message).join(', '));
        }
        window.location.reload();
      } catch (err) {
        setError(t("invoicing.failedToDeleteCreditNote"));
        console.error(err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const filteredCreditNotes = filter === "all" 
    ? initialCreditNotes 
    : initialCreditNotes.filter(cn => cn.state === filter);

  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("invoicing.creditNotes")}</h1>
        <Link
          href="/credit-notes/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {t("invoicing.newCreditNote")}
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${filter === "all" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t("common.all")} ({initialCreditNotes.length})
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={`px-3 py-1 rounded ${filter === "draft" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t("invoicing.states.draft")} ({initialCreditNotes.filter(cn => cn.state === "draft").length})
        </button>
        <button
          onClick={() => setFilter("finalized")}
          className={`px-3 py-1 rounded ${filter === "finalized" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t("invoicing.states.finalized")} ({initialCreditNotes.filter(cn => cn.state === "finalized").length})
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-3 py-1 rounded ${filter === "cancelled" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {t("invoicing.states.cancelled")} ({initialCreditNotes.filter(cn => cn.state === "cancelled").length})
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invoicing.creditNote")} #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invoicing.customer")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invoicing.company")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invoicing.issueDate")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invoicing.creditReason")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invoicing.currency")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCreditNotes.map((creditNote) => (
              <tr key={creditNote.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {creditNote.serialNumber || t("invoicing.states.draft")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateColor(creditNote.state)}`}>
                    {t(`invoicing.states.${creditNote.state}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {creditNote.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {creditNote.companyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(creditNote.issueDate)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {creditNote.creditReason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {creditNote.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <Link
                      href={`/credit-notes/${creditNote.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t("common.view")}
                    </Link>
                    {creditNote.state === 'draft' && (
                      <>
                        <Link
                          href={`/credit-notes/${creditNote.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t("common.edit")}
                        </Link>
                        <button
                          onClick={() => handleFinalize(creditNote.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          {t("invoicing.finalize")}
                        </button>
                        <button
                          onClick={() => handleCancel(creditNote.id)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          {t("common.cancel")}
                        </button>
                        <button
                          onClick={() => handleDelete(creditNote.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t("common.delete")}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCreditNotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filter !== "all" ? t(`invoicing.noFilteredCreditNotesFound`, { filter: t(`invoicing.states.${filter}`) }) : t("invoicing.noCreditNotesFound")}
          </div>
        )}
      </div>
      </div>
    </InvoicingLayout>
  );
}