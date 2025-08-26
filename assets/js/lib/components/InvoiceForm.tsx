import React, { useState, useEffect } from "react";
import { getI18n } from "../i18n";

export interface InvoiceLine {
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

export interface InvoiceFormData {
  issueDate: string;
  dueDate: string;
  currency: string;
  companyName: string;
  companyAddressLine1: string;
  companyAddressLine2: string;
  companyCity: string;
  companyPostalCode: string;
  companyCountry: string;
  companyVatNumber: string;
  companyEmail: string;
  companyPhone: string;
  customerName: string;
  customerAddressLine1: string;
  customerAddressLine2: string;
  customerCity: string;
  customerPostalCode: string;
  customerCountry: string;
  customerVatNumber: string;
  customerEmail: string;
  customerPhone: string;
  invoiceLines: Array<{
    lineNumber: number;
    description: string;
    quantity: string;
    unitPrice: string;
    taxRate: string;
  }>;
}

export interface InvoiceFormFieldErrors {
  issueDate?: string[];
  dueDate?: string[];
  currency?: string[];
  companyName?: string[];
  companyAddressLine1?: string[];
  companyAddressLine2?: string[];
  companyCity?: string[];
  companyPostalCode?: string[];
  companyCountry?: string[];
  companyVatNumber?: string[];
  companyEmail?: string[];
  companyPhone?: string[];
  customerName?: string[];
  customerAddressLine1?: string[];
  customerAddressLine2?: string[];
  customerCity?: string[];
  customerPostalCode?: string[];
  customerCountry?: string[];
  customerVatNumber?: string[];
  customerEmail?: string[];
  customerPhone?: string[];
  invoiceLines?: string[];
}

interface InvoiceFormProps {
  companies: CompanyType[];
  customers: CustomerType[];
  formData: InvoiceFormData;
  fieldErrors?: InvoiceFormFieldErrors;
  onChange: (data: InvoiceFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  locale: string;
}

export default function InvoiceForm({
  companies,
  customers,
  formData,
  fieldErrors,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  locale,
}: InvoiceFormProps) {
  const { t } = getI18n(locale);
  const [selectedCompany, setSelectedCompany] = useState<CompanyType | null>(
    null,
  );
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(
    null,
  );
  const [lines, setLines] = useState<InvoiceLine[]>([
    { description: "", quantity: "1", unitPrice: "", taxRate: "25" },
  ]);

  // Auto-select default company on mount
  useEffect(() => {
    const defaultCompany = companies.find((c) => c.isDefault);
    if (defaultCompany && !selectedCompany) {
      handleCompanySelect(defaultCompany.id);
    }
  }, [companies, selectedCompany]);

  // Sync lines with form data when lines change
  useEffect(() => {
    const invoiceLines = lines
      .filter((line) => line.description && line.unitPrice)
      .map((line, index) => ({
        lineNumber: index + 1,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
      }));

    // Only update if the invoice lines actually changed
    const currentLines = formData.invoiceLines || [];
    const hasChanged = JSON.stringify(currentLines) !== JSON.stringify(invoiceLines);
    
    if (hasChanged) {
      onChange({
        ...formData,
        invoiceLines,
      });
    }
  }, [lines]);

  // Initialize lines from formData.invoiceLines
  useEffect(() => {
    if (formData.invoiceLines && formData.invoiceLines.length > 0) {
      const initialLines = formData.invoiceLines.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
      }));
      setLines(initialLines);
    }
  }, []);

  const handleCompanySelect = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      onChange({
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
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      onChange({
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

  const addLine = () => {
    setLines([
      ...lines,
      { description: "", quantity: "1", unitPrice: "", taxRate: "25" },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (
    index: number,
    field: keyof InvoiceLine,
    value: string,
  ) => {
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

    lines.forEach((line) => {
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
        <h1 className="text-3xl font-bold">
          {isEditing ? t("invoicing.editInvoice") : t("invoicing.newInvoice")}
        </h1>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          {t("invoicing.backToInvoices")}
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{t("invoicing.invoiceDetails")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invoicing.issueDate")} *
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) =>
                  onChange({ ...formData, issueDate: e.target.value })
                }
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
                {t("invoicing.dueDate")} *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  onChange({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors?.dueDate && fieldErrors.dueDate.length > 0 && (
                <div className="mt-1">
                  {fieldErrors.dueDate.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invoicing.currency")} *
              </label>
              <select
                required
                value={formData.currency}
                onChange={(e) =>
                  onChange({ ...formData, currency: e.target.value })
                }
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
            <h2 className="text-xl font-semibold mb-4">{t("invoicing.fromCompany")} *</h2>
            <select
              required
              value={selectedCompany?.id || ""}
              onChange={(e) => handleCompanySelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            >
              <option value="">{t("invoicing.selectCompany")}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} {company.isDefault && t("invoicing.defaultLabel")}
                </option>
              ))}
            </select>

            {selectedCompany && (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold">{selectedCompany.name}</p>
                <p>{selectedCompany.addressLine1}</p>
                {selectedCompany.addressLine2 && (
                  <p>{selectedCompany.addressLine2}</p>
                )}
                <p>
                  {selectedCompany.city} {selectedCompany.postalCode}
                </p>
                <p>{selectedCompany.country}</p>
                {selectedCompany.vatNumber && (
                  <p>{t("invoicing.vatNumber")}: {selectedCompany.vatNumber}</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t("invoicing.toCustomer")} *</h2>
            <select
              required
              value={selectedCustomer?.id || ""}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            >
              <option value="">{t("invoicing.selectCustomer")}</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold">{selectedCustomer.name}</p>
                <p>{selectedCustomer.addressLine1}</p>
                {selectedCustomer.addressLine2 && (
                  <p>{selectedCustomer.addressLine2}</p>
                )}
                <p>
                  {selectedCustomer.city} {selectedCustomer.postalCode}
                </p>
                <p>{selectedCustomer.country}</p>
                {selectedCustomer.vatNumber && (
                  <p>{t("invoicing.vatNumber")}: {selectedCustomer.vatNumber}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t("invoicing.invoiceLines")}</h2>
            <button
              type="button"
              onClick={addLine}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              {t("invoicing.addLine")}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">{t("invoicing.description")}</th>
                  <th className="text-left py-2 w-24">{t("invoicing.quantity")}</th>
                  <th className="text-left py-2 w-32">{t("invoicing.unitPrice")}</th>
                  <th className="text-left py-2 w-24">{t("invoicing.taxRate")}</th>
                  <th className="text-right py-2 w-32">{t("invoicing.total")}</th>
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
                        onChange={(e) =>
                          updateLine(index, "description", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="Description"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(index, "quantity", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) =>
                          updateLine(index, "unitPrice", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.taxRate}
                        onChange={(e) =>
                          updateLine(index, "taxRate", e.target.value)
                        }
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
              <div>
                {t("invoicing.subtotal")}: {formData.currency} {totals.subtotal.toFixed(2)}
              </div>
              <div>
                {t("invoicing.tax")}: {formData.currency} {totals.tax.toFixed(2)}
              </div>
              <div className="font-bold text-lg">
                {t("invoicing.total")}: {formData.currency} {totals.total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isEditing ? t("invoicing.updateInvoice") : t("invoicing.createInvoice")}
          </button>
        </div>
      </form>
    </div>
  );
}
