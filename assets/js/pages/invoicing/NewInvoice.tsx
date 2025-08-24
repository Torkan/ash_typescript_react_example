import React, { useState, useEffect } from "react";
import { 
  createInvoice,
  createInvoiceLine,
  listCompanies,
  listActiveCustomers,
  buildCSRFHeaders,
  type CompanyResourceSchema,
  type CustomerResourceSchema
} from "../../ash_rpc";

interface NewInvoicePageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

interface InvoiceLine {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
}

export default function NewInvoice({ current_user_id }: NewInvoicePageProps) {
  const [companies, setCompanies] = useState<CompanyResourceSchema[]>([]);
  const [customers, setCustomers] = useState<CustomerResourceSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCompany, setSelectedCompany] = useState<CompanyResourceSchema | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResourceSchema | null>(null);
  
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: "NOK"
  });
  
  const [lines, setLines] = useState<InvoiceLine[]>([
    { description: "", quantity: "1", unitPrice: "", taxRate: "25" }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesResult, customersResult] = await Promise.all([
        listCompanies({
          fields: ['id', 'name', 'addressLine1', 'addressLine2', 'city', 
                   'postalCode', 'country', 'vatNumber', 'email', 'phone', 'isDefault'],
          headers: buildCSRFHeaders(),
        }),
        listActiveCustomers({
          fields: ['id', 'name', 'addressLine1', 'addressLine2', 'city', 
                   'postalCode', 'country', 'vatNumber', 'email', 'phone'],
          headers: buildCSRFHeaders(),
        })
      ]);
      
      if (!companiesResult.success) {
        throw new Error(companiesResult.errors.map(e => e.message).join(', '));
      }
      if (!customersResult.success) {
        throw new Error(customersResult.errors.map(e => e.message).join(', '));
      }
      
      setCompanies(companiesResult.data);
      setCustomers(customersResult.data);
      
      // Auto-select default company if exists
      const defaultCompany = companiesResult.data.find(c => c.isDefault);
      if (defaultCompany) {
        setSelectedCompany(defaultCompany);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany || !selectedCustomer) {
      setError("Please select both a company and a customer");
      return;
    }
    
    try {
      setSaving(true);
      
      // Create the invoice
      const invoiceResult = await createInvoice({
        input: {
          issueDate: formData.issueDate,
          dueDate: formData.dueDate,
          currency: formData.currency,
          companyName: selectedCompany.name,
          companyAddressLine1: selectedCompany.addressLine1,
          companyAddressLine2: selectedCompany.addressLine2,
          companyCity: selectedCompany.city,
          companyPostalCode: selectedCompany.postalCode,
          companyCountry: selectedCompany.country,
          companyVatNumber: selectedCompany.vatNumber,
          companyEmail: selectedCompany.email,
          companyPhone: selectedCompany.phone,
          customerName: selectedCustomer.name,
          customerAddressLine1: selectedCustomer.addressLine1,
          customerAddressLine2: selectedCustomer.addressLine2,
          customerCity: selectedCustomer.city,
          customerPostalCode: selectedCustomer.postalCode,
          customerCountry: selectedCustomer.country,
          customerVatNumber: selectedCustomer.vatNumber,
          customerEmail: selectedCustomer.email,
          customerPhone: selectedCustomer.phone
        },
        fields: ['id'],
        headers: buildCSRFHeaders(),
      });
      
      if (!invoiceResult.success) {
        throw new Error(invoiceResult.errors.map(e => e.message).join(', '));
      }
      
      // Create invoice lines
      const validLines = lines.filter(line => line.description && line.unitPrice);
      for (let i = 0; i < validLines.length; i++) {
        const line = validLines[i];
        const lineResult = await createInvoiceLine({
          input: {
            invoiceId: invoiceResult.data.id,
            lineNumber: i + 1,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate
          },
          fields: ['id'],
          headers: buildCSRFHeaders(),
        });
        
        if (!lineResult.success) {
          throw new Error(lineResult.errors.map(e => e.message).join(', '));
        }
      }
      
      // Redirect to invoices list
      window.location.href = '/invoices';
    } catch (err) {
      setError("Failed to create invoice");
      console.error(err);
      setSaving(false);
    }
  };

  const addLine = () => {
    setLines([...lines, { description: "", quantity: "1", unitPrice: "", taxRate: "25" }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof InvoiceLine, value: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const calculateLineTotal = (line: InvoiceLine) => {
    const quantity = parseFloat(line.quantity) || 0;
    const unitPrice = parseFloat(line.unitPrice) || 0;
    const taxRate = parseFloat(line.taxRate) || 0;
    const subtotal = quantity * unitPrice;
    const tax = subtotal * (taxRate / 100);
    return subtotal + tax;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">New Invoice</h1>
        <a href="/invoices" className="text-gray-600 hover:text-gray-800">
          Back to Invoices
        </a>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">From (Company) *</h2>
            <select
              required
              value={selectedCompany?.id || ""}
              onChange={(e) => setSelectedCompany(companies.find(c => c.id === e.target.value) || null)}
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
              onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
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
            <h2 className="text-xl font-semibold">Invoice Lines</h2>
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
                      {formData.currency} {calculateLineTotal(line).toFixed(2)}
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
          <a
            href="/invoices"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}