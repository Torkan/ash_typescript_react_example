import React, { useState, useEffect } from "react";
import { 
  listCreditNotes,
  deleteCreditNote,
  finalizeCreditNote,
  cancelCreditNote,
  buildCSRFHeaders,
  type CreditNoteResourceSchema 
} from "../../ash_rpc";

interface CreditNotesPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

export default function CreditNotes({}: CreditNotesPageProps) {
  const [creditNotes, setCreditNotes] = useState<CreditNoteResourceSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "draft" | "finalized" | "cancelled">("all");

  useEffect(() => {
    loadCreditNotes();
  }, []);

  const loadCreditNotes = async () => {
    try {
      setLoading(true);
      const result = await listCreditNotes({
        fields: ['id', 'serialNumber', 'state', 'issueDate', 'creditReason',
                 'customerName', 'companyName', 'currency', 'originalInvoiceId'],
        headers: buildCSRFHeaders(),
      });
      if (result.success) {
        setCreditNotes(result.data);
      } else {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }
      setError(null);
    } catch (err) {
      setError("Failed to load credit notes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (id: string) => {
    if (confirm("Are you sure you want to finalize this credit note? This action cannot be undone.")) {
      try {
        const result = await finalizeCreditNote({
          primaryKey: id,
          fields: ['id'],
          headers: buildCSRFHeaders(),
        });
        if (!result.success) {
          throw new Error(result.errors.map(e => e.message).join(', '));
        }
        await loadCreditNotes();
      } catch (err) {
        setError("Failed to finalize credit note");
        console.error(err);
      }
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this credit note?")) {
      try {
        const result = await cancelCreditNote({
          primaryKey: id,
          fields: ['id'],
          headers: buildCSRFHeaders(),
        });
        if (!result.success) {
          throw new Error(result.errors.map(e => e.message).join(', '));
        }
        await loadCreditNotes();
      } catch (err) {
        setError("Failed to cancel credit note");
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this draft credit note?")) {
      try {
        const result = await deleteCreditNote({
          primaryKey: id,
          headers: buildCSRFHeaders(),
        });
        if (!result.success) {
          throw new Error(result.errors.map(e => e.message).join(', '));
        }
        await loadCreditNotes();
      } catch (err) {
        setError("Failed to delete credit note");
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
    ? creditNotes 
    : creditNotes.filter(cn => cn.state === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading credit notes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Credit Notes</h1>
        <a
          href="/credit-notes/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Credit Note
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
          className={`px-3 py-1 rounded ${filter === "all" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All ({creditNotes.length})
        </button>
        <button
          onClick={() => setFilter("draft")}
          className={`px-3 py-1 rounded ${filter === "draft" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Draft ({creditNotes.filter(cn => cn.state === "draft").length})
        </button>
        <button
          onClick={() => setFilter("finalized")}
          className={`px-3 py-1 rounded ${filter === "finalized" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Finalized ({creditNotes.filter(cn => cn.state === "finalized").length})
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-3 py-1 rounded ${filter === "cancelled" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Cancelled ({creditNotes.filter(cn => cn.state === "cancelled").length})
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credit Note #
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
                Reason
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
            {filteredCreditNotes.map((creditNote) => (
              <tr key={creditNote.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {creditNote.serialNumber || 'Draft'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateColor(creditNote.state)}`}>
                    {creditNote.state}
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
                    {creditNote.state === 'draft' && (
                      <>
                        <a
                          href={`/credit-notes/${creditNote.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => handleFinalize(creditNote.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Finalize
                        </button>
                        <button
                          onClick={() => handleCancel(creditNote.id)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(creditNote.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {creditNote.state === 'finalized' && (
                      <span className="text-gray-400">View</span>
                    )}
                    {creditNote.state === 'cancelled' && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCreditNotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No {filter !== "all" ? filter : ""} credit notes found.
          </div>
        )}
      </div>
    </div>
  );
}