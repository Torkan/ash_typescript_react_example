import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
  deleteInvoice,
  finalizeInvoice,
  cancelInvoice,
  buildCSRFHeaders,
  InvoicesListView,
} from "../../ash_rpc";
import InvoicingLayout from "../../lib/components/InvoicingLayout";

// Type for paginated invoice data from backend
type PaginatedInvoices = {
  results: InvoicesListView;
  hasMore: boolean;
  previousPage?: string;
  nextPage?: string;
  count?: number | null;
  type: "keyset";
} | {
  results: InvoicesListView;
  hasMore: boolean;
  limit: number;
  offset: number;
  count?: number | null;
  type: "offset";
};

interface InvoicesOffsetPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  invoices: PaginatedInvoices;
  // URL parameters for pagination
  offset?: string;
  limit?: string;
  filter_state?: string;
}

interface OffsetPaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  offset: number;
  limit: number;
  totalCount: number;
}

export default function InvoicesOffset({
  invoices: initialInvoices,
  locale,
  offset = "0",
  limit = "10",
  filter_state = "all",
}: InvoicesOffsetPageProps) {
  const [error, setError] = useState<string | null>(null);
  const invoices = initialInvoices.results;
  const filter = filter_state as "all" | "draft" | "finalized" | "cancelled";
  
  const offsetNum = parseInt(offset);
  const limitNum = parseInt(limit);
  const currentPage = Math.floor(offsetNum / limitNum) + 1;
  const totalCount = initialInvoices.count || 0;
  const totalPages = Math.ceil(totalCount / limitNum);
  
  const pagination: OffsetPaginationInfo = {
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    offset: offsetNum,
    limit: limitNum,
    totalCount: totalCount,
  };

  const handleFinalize = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to finalize this invoice? This action cannot be undone.",
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
        setError("Failed to finalize invoice");
        console.error(err);
      }
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this invoice?")) {
      try {
        await cancelInvoice({
          primaryKey: id,
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });
        window.location.reload();
      } catch (err) {
        setError("Failed to cancel invoice");
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this draft invoice?")) {
      try {
        await deleteInvoice({
          primaryKey: id,
          headers: buildCSRFHeaders(),
        });
        window.location.reload();
      } catch (err) {
        setError("Failed to delete invoice");
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

  // Helper function to build URL with query parameters
  const buildUrl = (newParams: {
    filter?: string;
    offset?: number;
    limit?: number;
  }) => {
    const urlParams = new URLSearchParams();
    
    const filterValue = newParams.filter || filter;
    if (filterValue && filterValue !== "all") {
      urlParams.set("filter_state", filterValue);
    }
    
    const offsetValue = newParams.offset ?? offsetNum;
    if (offsetValue > 0) {
      urlParams.set("offset", offsetValue.toString());
    }
    
    const limitValue = newParams.limit ?? limitNum;
    if (limitValue !== 10) {
      urlParams.set("limit", limitValue.toString());
    }

    return `/invoices-offset${urlParams.toString() ? `?${urlParams.toString()}` : ""}`;
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - 2);
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Since we're using pagination, we display all fetched invoices (they're already filtered)
  const filteredInvoices = invoices;

  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Invoices (Offset Pagination)</h1>
          <div className="flex gap-2">
            <Link
              href="/invoices"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Keyset Version
            </Link>
            <Link
              href="/invoices/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              New Invoice
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={buildUrl({ filter: "all", offset: 0 })}
              className={`px-3 py-1 rounded ${
                filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              All
            </Link>
            <Link
              href={buildUrl({ filter: "draft", offset: 0 })}
              className={`px-3 py-1 rounded ${
                filter === "draft" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Draft
            </Link>
            <Link
              href={buildUrl({ filter: "finalized", offset: 0 })}
              className={`px-3 py-1 rounded ${
                filter === "finalized" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Finalized
            </Link>
            <Link
              href={buildUrl({ filter: "cancelled", offset: 0 })}
              className={`px-3 py-1 rounded ${
                filter === "cancelled" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Cancelled
            </Link>
          </div>
          
          {/* Pagination info */}
          <div className="flex gap-2 items-center text-sm text-gray-500">
            <span>
              Showing {pagination.offset + 1}-{Math.min(pagination.offset + invoices.length, pagination.totalCount)} of {pagination.totalCount} invoices
            </span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.serialNumber || "Draft"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateColor(invoice.state)}`}
                    >
                      {invoice.state}
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
                        View
                      </Link>
                      {invoice.state === "draft" && (
                        <>
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleFinalize(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Finalize
                          </button>
                          <button
                            onClick={() => handleCancel(invoice.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {invoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No {filter !== "all" ? filter : ""} invoices found.
            </div>
          )}
        </div>

        {/* Offset Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-2">
              {pagination.hasPrev ? (
                <Link
                  href={buildUrl({ offset: Math.max(0, pagination.offset - pagination.limit) })}
                  className="px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="px-3 py-1 rounded bg-gray-200 text-gray-400 cursor-not-allowed">
                  ← Previous
                </span>
              )}
              
              {/* Page numbers */}
              {generatePageNumbers().map((page) => (
                page === pagination.currentPage ? (
                  <span
                    key={page}
                    className="px-3 py-1 rounded bg-blue-500 text-white"
                  >
                    {page}
                  </span>
                ) : (
                  <Link
                    key={page}
                    href={buildUrl({ offset: (page - 1) * pagination.limit })}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    {page}
                  </Link>
                )
              ))}
              
              {pagination.hasNext ? (
                <Link
                  href={buildUrl({ offset: pagination.offset + pagination.limit })}
                  className="px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
                >
                  Next →
                </Link>
              ) : (
                <span className="px-3 py-1 rounded bg-gray-200 text-gray-400 cursor-not-allowed">
                  Next →
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>
        )}
      </div>
    </InvoicingLayout>
  );
}