import React, { useState, useEffect } from "react";
import { useAshRpcForm } from "../useAshRpcForm";
import {
  createCreditNote,
  createCreditNoteZodschema,
  validateCreateCreditNote,
  buildCSRFHeaders,
  CreateCreditNoteInput,
} from "../../ash_rpc";

export interface CreditNoteLine {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
}

export interface CompanyType {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  vatNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  isDefault: boolean;
}

export interface CustomerType {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  vatNumber?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface InvoiceType {
  id: string;
  serialNumber: string | null;
  customerName: string;
  companyName: string;
  currency: string;
  issueDate: string;
}

interface CreditNoteFormProps {
  companies: CompanyType[];
  customers: CustomerType[];
  invoices: InvoiceType[];
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<CreateCreditNoteInput>;
}

export default function CreditNoteForm({
  companies,
  customers,
  invoices,
  onSuccess,
  onCancel,
  initialData,
}: CreditNoteFormProps) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyType | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>(null);
  const [lines, setLines] = useState<CreditNoteLine[]>([
    { description: "", quantity: "1", unitPrice: "", taxRate: "25" }
  ]);

  const { formData, fieldErrors, handleChange, handleSubmit, isSubmitting, error } =
    useAshRpcForm<CreateCreditNoteInput, CreateCreditNoteInput>({
      initialData: {
        issueDate: new Date().toISOString().split('T')[0],
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
        ...initialData,
      },
      zodSchema: createCreditNoteZodschema,
      serverValidation: async (data) => {
        return validateCreateCreditNote({
          input: data,
          headers: buildCSRFHeaders(),
        });
      },
      onSubmit: async (data) => {
        return createCreditNote({
          input: data,
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });
      },
      onSuccess,
    });

  // Auto-select default company on mount
  useEffect(() => {
    const defaultCompany = companies.find(c => c.isDefault);
    if (defaultCompany && !selectedCompany) {
      handleCompanySelect(defaultCompany.id);
    }
  }, [companies]);

  // Sync lines with form data
  useEffect(() => {
    const creditNoteLines = lines
      .filter(line => line.description && line.unitPrice)
      .map((line, index) => ({
        lineNumber: index + 1,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
      }));

    handleChange({
      ...formData,
      creditNoteLines,
    });
  }, [lines]);

  const handleCompanySelect = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      handleChange({
        ...formData,
        companyName: company.name,
        companyAddressLine1: company.addressLine1,
        companyAddressLine2: company.addressLine2 || "",
        companyCity: company.city,
        companyPostalCode: company.postalCode,
        companyCountry: company.country,
        companyVatNumber: company.vatNumber || "",
        companyEmail: company.email || "",
        companyPhone: company.phone || "",
      });
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      handleChange({
        ...formData,
        customerName: customer.name,
        customerAddressLine1: customer.addressLine1,
        customerAddressLine2: customer.addressLine2 || "",
        customerCity: customer.city,
        customerPostalCode: customer.postalCode,
        customerCountry: customer.country,
        customerVatNumber: customer.vatNumber || "",
        customerEmail: customer.email || "",
        customerPhone: customer.phone || "",
      });
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      // Auto-select matching customer and company
      const matchingCustomer = customers.find(c => c.name === invoice.customerName);
      const matchingCompany = companies.find(c => c.name === invoice.companyName);
      
      if (matchingCustomer) {
        setSelectedCustomer(matchingCustomer);
        handleChange({
          ...formData,
          originalInvoiceId: invoice.id,
          currency: invoice.currency,
          customerName: matchingCustomer.name,
          customerAddressLine1: matchingCustomer.addressLine1,
          customerAddressLine2: matchingCustomer.addressLine2 || "",
          customerCity: matchingCustomer.city,
          customerPostalCode: matchingCustomer.postalCode,
          customerCountry: matchingCustomer.country,
          customerVatNumber: matchingCustomer.vatNumber || "",
          customerEmail: matchingCustomer.email || "",
          customerPhone: matchingCustomer.phone || "",
        });
      }
      if (matchingCompany) {
        setSelectedCompany(matchingCompany);
        handleChange({
          ...formData,
          originalInvoiceId: invoice.id,
          currency: invoice.currency,
          companyName: matchingCompany.name,
          companyAddressLine1: matchingCompany.addressLine1,
          companyAddressLine2: matchingCompany.addressLine2 || "",
          companyCity: matchingCompany.city,
          companyPostalCode: matchingCompany.postalCode,
          companyCountry: matchingCompany.country,
          companyVatNumber: matchingCompany.vatNumber || "",
          companyEmail: matchingCompany.email || "",
          companyPhone: matchingCompany.phone || "",
        });
      }
    } else {
      setSelectedInvoice(null);
      handleChange({
        ...formData,
        originalInvoiceId: null,
      });
    }
  };

  const addLine = () => {
    setLines([...lines, { description: "", quantity: "1", unitPrice: "", taxRate: "25" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof CreditNoteLine, value: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    
    lines.forEach(line => {
      const quantity = parseFloat(line.quantity) || 0;
      const unitPrice = parseFloat(line.unitPrice) || 0;
      const taxRate = parseFloat(line.taxRate) || 0;
      const lineSubtotal = quantity * unitPrice;
      subtotal += lineSubtotal;
      tax += lineSubtotal * (taxRate / 100);
    });
    
    return { subtotal, tax, total: subtotal + tax };
  };

  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">New Credit Note</h1>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Credit Notes
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Credit Note Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => handleChange({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors?.issueDate && fieldErrors.issueDate.length > 0 && (
                <div className="mt-1">
                  {fieldErrors.issueDate.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                required
                value={formData.currency}
                onChange={(e) => handleChange({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NOK">NOK</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="SEK">SEK</option>
                <option value="DKK">DKK</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Invoice (Optional)
            </label>
            <select
              value={selectedInvoice?.id || ""}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an invoice to credit...</option>
              {invoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.serialNumber || 'N/A'} - {invoice.customerName} ({invoice.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Reason *
            </label>
            <textarea
              required
              rows={3}
              value={formData.creditReason}
              onChange={(e) => handleChange({ ...formData, creditReason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please describe the reason for this credit note..."
            />
            {fieldErrors?.creditReason && fieldErrors.creditReason.length > 0 && (
              <div className="mt-1">
                {fieldErrors.creditReason.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">From (Company) *</h2>
            <select
              required
              value={selectedCompany?.id || ""}
              onChange={(e) => handleCompanySelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            >
              <option value="">Select a company...</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} {company.isDefault && "(Default)"}
                </option>
              ))}
            </select>
            
            {selectedCompany && (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold">{selectedCompany.name}</p>
                <p>{selectedCompany.addressLine1}</p>
                {selectedCompany.addressLine2 && <p>{selectedCompany.addressLine2}</p>}
                <p>{selectedCompany.city} {selectedCompany.postalCode}</p>
                <p>{selectedCompany.country}</p>
                {selectedCompany.vatNumber && <p>VAT: {selectedCompany.vatNumber}</p>}
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">To (Customer) *</h2>
            <select
              required
              value={selectedCustomer?.id || ""}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            >
              <option value="">Select a customer...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            
            {selectedCustomer && (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold">{selectedCustomer.name}</p>
                <p>{selectedCustomer.addressLine1}</p>
                {selectedCustomer.addressLine2 && <p>{selectedCustomer.addressLine2}</p>}
                <p>{selectedCustomer.city} {selectedCustomer.postalCode}</p>
                <p>{selectedCustomer.country}</p>
                {selectedCustomer.vatNumber && <p>VAT: {selectedCustomer.vatNumber}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Credit Note Lines</h2>
            <button
              type="button"
              onClick={addLine}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Add Line
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2 w-24">Quantity</th>
                  <th className="text-left py-2 w-32">Unit Price</th>
                  <th className="text-left py-2 w-24">Tax %</th>
                  <th className="text-right py-2 w-32">Total</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="Description"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(index, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.taxRate}
                        onChange={(e) => updateLine(index, 'taxRate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-2 text-right pr-2">
                      {formData.currency} {((parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0) * (1 + (parseFloat(line.taxRate) || 0) / 100)).toFixed(2)}
                    </td>
                    <td className="py-2">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="text-right space-y-1">
              <div>Subtotal: {formData.currency} {totals.subtotal.toFixed(2)}</div>
              <div>Tax: {formData.currency} {totals.tax.toFixed(2)}</div>
              <div className="font-bold text-lg">Total: {formData.currency} {totals.total.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Credit Note"}
          </button>
        </div>
      </form>
    </div>
  );
}