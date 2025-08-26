import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
  deleteInvoice,
  finalizeInvoice,
  cancelInvoice,
  listInvoices,
  buildCSRFHeaders,
  InvoicesListView,
  invoicesListFields,
} from "../../ash_rpc";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { getI18n } from "../../lib/i18n";

// Type for paginated invoice data from backend
type PaginatedInvoices =
  | {
      results: InvoicesListView;
      hasMore: boolean;
      previousPage?: string;
      nextPage?: string;
      count?: number | null;
      type: "keyset";
    }
  | {
      results: InvoicesListView;
      hasMore: boolean;
      limit: number;
      offset: number;
      count?: number | null;
      type: "offset";
    };

interface InvoicesPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  invoices: PaginatedInvoices;
  // URL parameters for pagination
  after?: string;
  before?: string;
  limit?: string;
  filter_state?: string;
}

interface PaginationInfo {
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: string;
  previousPage?: string;
}

export default function Invoices({
  invoices: initialInvoices,
  locale,
  after,
  before,
  limit = "10",
  filter_state = "all",
}: InvoicesPageProps) {
  const { t } = getI18n(locale);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoicesListView>(
    initialInvoices.results,
  );
  const [filter, setFilter] = useState<
    "all" | "draft" | "finalized" | "cancelled"
  >(filter_state as "all" | "draft" | "finalized" | "cancelled");

  const [pagination, setPagination] = useState<PaginationInfo>({
    hasNext: initialInvoices.hasMore,
    hasPrev:
      initialInvoices.type === "keyset"
        ? !!initialInvoices.previousPage
        : !!before || !!after,
    nextPage:
      initialInvoices.type === "keyset" ? initialInvoices.nextPage : undefined,
    previousPage:
      initialInvoices.type === "keyset"
        ? initialInvoices.previousPage
        : undefined,
  });

  const handleFinalize = async (id: string) => {
    if (
      confirm(
        t("invoicing.confirmFinalizeInvoice"),
      )
    ) {
      try {
        await finalizeInvoice({
          primaryKey: id,
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });
        window.location.reload();
      } catch (err) {
        setError(t("invoicing.failedToFinalizeInvoice"));
        console.error(err);
      }
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm(t("invoicing.confirmCancelInvoice"))) {
      try {
        await cancelInvoice({
          primaryKey: id,
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });
        window.location.reload();
      } catch (err) {
        setError(t("invoicing.failedToCancelInvoice"));
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("invoicing.confirmDeleteInvoice"))) {
      try {
        await deleteInvoice({
          primaryKey: id,
          headers: buildCSRFHeaders(),
        });
        window.location.reload();
      } catch (err) {
        setError(t("invoicing.failedToDeleteInvoice"));
        console.error(err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "finalized":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Update URL and fetch new data when filter or pagination changes
  const updateInvoices = async (newParams: {
    filter?: string;
    after?: string;
    before?: string;
    limit?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Build filter object for the API
      const filterObj =
        newParams.filter && newParams.filter !== "all"
          ? {
              state: {
                eq: newParams.filter as "draft" | "finalized" | "cancelled",
              },
            }
          : undefined;

      // Build pagination object for keyset pagination
      const pageObj: any = { limit: parseInt(newParams.limit || "10") };
      if (newParams.after) {
        pageObj.after = newParams.after;
      } else if (newParams.before) {
        pageObj.before = newParams.before;
      }

      // Fetch invoices using RPC
      const result = await listInvoices({
        fields: invoicesListFields,
        ...(filterObj && { filter: filterObj }),
        sort: "-issueDate", // Most recent first for keyset pagination
        page: pageObj,
        headers: buildCSRFHeaders(),
      });

      if (result.success) {
        console.log(result);
        const paginatedData = result.data;
        const newInvoices = paginatedData.results;
        setInvoices(newInvoices);
        setPagination({
          hasNext: paginatedData.hasMore,
          hasPrev:
            paginatedData.type === "keyset"
              ? !!paginatedData.previousPage
              : !!(newParams.after || newParams.before),
          nextPage:
            paginatedData.type === "keyset"
              ? paginatedData.nextPage
              : undefined,
          previousPage:
            paginatedData.type === "keyset"
              ? paginatedData.previousPage
              : undefined,
        });
      } else {
        setError(result.errors.map((e) => e.message).join(", "));
      }

      // Update URL without page reload
      const urlParams = new URLSearchParams();
      if (newParams.filter && newParams.filter !== "all") {
        urlParams.set("filter_state", newParams.filter);
      }
      if (newParams.after) {
        urlParams.set("after", newParams.after);
      } else if (newParams.before) {
        urlParams.set("before", newParams.before);
      }
      if (newParams.limit && newParams.limit !== "10") {
        urlParams.set("limit", newParams.limit);
      }

      const newUrl = `/invoices${urlParams.toString() ? `?${urlParams.toString()}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    } catch (err) {
      setError(t("invoicing.failedToLoadInvoices"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (
    newFilter: "all" | "draft" | "finalized" | "cancelled",
  ) => {
    setFilter(newFilter);
    updateInvoices({
      filter: newFilter,
      limit: limit,
    });
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasNext && pagination.nextPage) {
      updateInvoices({
        filter: filter !== "all" ? filter : undefined,
        after: pagination.nextPage,
        limit: limit,
      });
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrev && pagination.previousPage) {
      updateInvoices({
        filter: filter !== "all" ? filter : undefined,
        before: pagination.previousPage,
        limit: limit,
      });
    }
  };

  // Since we're using pagination, we display all fetched invoices (they're already filtered)
  const filteredInvoices = invoices;

  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t("invoicing.invoices")}</h1>
          <Link
            href="/invoices/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {t("invoicing.newInvoice")}
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-3 py-1 rounded ${
                filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
              } disabled:opacity-50`}
              disabled={loading}
            >
              {t("common.all")}
            </button>
            <button
              onClick={() => handleFilterChange("draft")}
              className={`px-3 py-1 rounded ${
                filter === "draft" ? "bg-blue-500 text-white" : "bg-gray-200"
              } disabled:opacity-50`}
              disabled={loading}
            >
              {t("invoicing.states.draft")}
            </button>
            <button
              onClick={() => handleFilterChange("finalized")}
              className={`px-3 py-1 rounded ${
                filter === "finalized"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              } disabled:opacity-50`}
              disabled={loading}
            >
              {t("invoicing.states.finalized")}
            </button>
            <button
              onClick={() => handleFilterChange("cancelled")}
              className={`px-3 py-1 rounded ${
                filter === "cancelled"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              } disabled:opacity-50`}
              disabled={loading}
            >
              {t("invoicing.states.cancelled")}
            </button>
          </div>

          {/* Pagination controls */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">
              {t("invoicing.showingInvoices", { count: filteredInvoices.length })}
            </span>
            <button
              onClick={handlePrevPage}
              className={`px-3 py-1 rounded ${
                pagination.hasPrev && !loading
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!pagination.hasPrev || loading}
            >
              {t("invoicing.previous")}
            </button>
            <button
              onClick={handleNextPage}
              className={`px-3 py-1 rounded ${
                pagination.hasNext && !loading
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!pagination.hasNext || loading}
            >
              {t("invoicing.next")}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("invoicing.invoice")} #
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
                  {t("invoicing.dueDate")}
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
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.serialNumber || t("invoicing.states.draft")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateColor(invoice.state)}`}
                    >
                      {t(`invoicing.states.${invoice.state}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t("common.view")}
                      </Link>
                      {invoice.state === "draft" && (
                        <>
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {t("common.edit")}
                          </Link>
                          <button
                            onClick={() => handleFinalize(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            {t("invoicing.finalize")}
                          </button>
                          <button
                            onClick={() => handleCancel(invoice.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            {t("common.cancel")}
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
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

          {loading && (
            <div className="text-center py-8 text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span>{t("invoicing.loadingInvoicesText")}</span>
              </div>
            </div>
          )}

          {!loading && filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {filter !== "all" ? t("invoicing.noFilteredInvoicesFound", { filter: t(`invoicing.states.${filter}`) }) : t("invoicing.noInvoicesFound")}
            </div>
          )}
        </div>
      </div>
    </InvoicingLayout>
  );
}
