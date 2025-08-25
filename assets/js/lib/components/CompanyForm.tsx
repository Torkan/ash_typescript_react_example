import React from "react";

export interface CompanyFormData {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  vatNumber: string;
  email: string;
  phone: string;
  isDefault: boolean;
}

export interface CompanyFormFieldErrors {
  name?: string[];
  addressLine1?: string[];
  addressLine2?: string[];
  city?: string[];
  postalCode?: string[];
  country?: string[];
  vatNumber?: string[];
  email?: string[];
  phone?: string[];
  isDefault?: string[];
}

interface CompanyFormProps {
  formData: CompanyFormData;
  fieldErrors?: CompanyFormFieldErrors;
  onChange: (data: CompanyFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function CompanyForm({
  formData,
  fieldErrors,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
}: CompanyFormProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? "Edit Company" : "New Company"}
      </h2>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.name && fieldErrors.name.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.name && fieldErrors.name.length > 0 && (
            <div className="mt-1">
              {fieldErrors.name.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.email && fieldErrors.email.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.email && fieldErrors.email.length > 0 && (
            <div className="mt-1">
              {fieldErrors.email.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            required
            value={formData.addressLine1}
            onChange={(e) =>
              onChange({ ...formData, addressLine1: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.addressLine1 && fieldErrors.addressLine1.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.addressLine1 && fieldErrors.addressLine1.length > 0 && (
            <div className="mt-1">
              {fieldErrors.addressLine1.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) =>
              onChange({ ...formData, addressLine2: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.addressLine2 && fieldErrors.addressLine2.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.addressLine2 && fieldErrors.addressLine2.length > 0 && (
            <div className="mt-1">
              {fieldErrors.addressLine2.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => onChange({ ...formData, city: e.target.value })}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.city && fieldErrors.city.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.city && fieldErrors.city.length > 0 && (
            <div className="mt-1">
              {fieldErrors.city.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code *
          </label>
          <input
            type="text"
            required
            value={formData.postalCode}
            onChange={(e) =>
              onChange({ ...formData, postalCode: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.postalCode && fieldErrors.postalCode.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.postalCode && fieldErrors.postalCode.length > 0 && (
            <div className="mt-1">
              {fieldErrors.postalCode.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <input
            type="text"
            required
            value={formData.country}
            onChange={(e) => onChange({ ...formData, country: e.target.value })}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.country && fieldErrors.country.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.country && fieldErrors.country.length > 0 && (
            <div className="mt-1">
              {fieldErrors.country.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VAT Number
          </label>
          <input
            type="text"
            value={formData.vatNumber}
            onChange={(e) =>
              onChange({ ...formData, vatNumber: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.vatNumber && fieldErrors.vatNumber.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.vatNumber && fieldErrors.vatNumber.length > 0 && (
            <div className="mt-1">
              {fieldErrors.vatNumber.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              fieldErrors?.phone && fieldErrors.phone.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {fieldErrors?.phone && fieldErrors.phone.length > 0 && (
            <div className="mt-1">
              {fieldErrors.phone.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) =>
                onChange({ ...formData, isDefault: e.target.checked })
              }
              className="mr-2"
            />
            <label
              htmlFor="isDefault"
              className="text-sm font-medium text-gray-700"
            >
              Set as default company
            </label>
          </div>
          {fieldErrors?.isDefault && fieldErrors.isDefault.length > 0 && (
            <div className="mt-1">
              {fieldErrors.isDefault.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isEditing ? "Update" : "Create"} Company
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
