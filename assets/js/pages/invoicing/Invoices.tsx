import React, { useState, useEffect } from "react";
import {
  listInvoices,
  deleteInvoice,
  finalizeInvoice,
  cancelInvoice,
  buildCSRFHeaders,
  type InvoiceResourceSchema,
} from "../../ash_rpc";

interface InvoicesPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

export default function Invoices({ current_user_id }: InvoicesPageProps) {
  const [invoices, setInvoices] = useState<InvoiceResourceSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "draft" | "finalized" | "cancelled"
  >("all");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await listInvoices({
        fields: [
          "id",
          "serialNumber",
          "state",
          "issueDate",
          "dueDate",
          "customerName",
          "companyName",
          "currency",
        ],
        headers: buildCSRFHeaders(),
      });
      if (result.success) {
        setInvoices(result.data);
      } else {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }
      setError(null);
    } catch (err) {
      setError("Failed to load invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        await loadInvoices();
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
        await loadInvoices();
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
        await loadInvoices();
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

  const filteredInvoices =
    filter === "all"
      ? invoices
      : invoices.filter((inv) => inv.state === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <a
          href="/invoices/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Invoice
        </a>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          All ({invoices.length})
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={`px-3 py-1 rounded ${filter === "draft" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Draft ({invoices.filter((i) => i.state === "draft").length})
        </button>
        <button
          onClick={() => setFilter("finalized")}
          className={`px-3 py-1 rounded ${filter === "finalized" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Finalized ({invoices.filter((i) => i.state === "finalized").length})
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-3 py-1 rounded ${filter === "cancelled" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Cancelled ({invoices.filter((i) => i.state === "cancelled").length})
        </button>
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
            {filteredInvoices.map((invoice) => (
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
                    {invoice.state === "draft" && (
                      <>
                        <a
                          href={`/invoices/${invoice.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </a>
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
                    {invoice.state === "finalized" && (
                      <span className="text-gray-400">View</span>
                    )}
                    {invoice.state === "cancelled" && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No {filter !== "all" ? filter : ""} invoices found.
          </div>
        )}
      </div>
    </div>
  );
}
