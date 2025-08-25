import React from "react";
import InputField from "./InputField";
import CheckboxInput from "./CheckboxInput";

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
        <InputField
          label="Company Name"
          value={formData.name}
          onChange={(value) => onChange({ ...formData, name: value })}
          errors={fieldErrors?.name}
          required
        />

        <InputField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => onChange({ ...formData, email: value })}
          errors={fieldErrors?.email}
        />

        <InputField
          label="Address Line 1"
          value={formData.addressLine1}
          onChange={(value) => onChange({ ...formData, addressLine1: value })}
          errors={fieldErrors?.addressLine1}
          required
        />

        <InputField
          label="Address Line 2"
          value={formData.addressLine2}
          onChange={(value) => onChange({ ...formData, addressLine2: value })}
          errors={fieldErrors?.addressLine2}
        />

        <InputField
          label="City"
          value={formData.city}
          onChange={(value) => onChange({ ...formData, city: value })}
          errors={fieldErrors?.city}
          required
        />

        <InputField
          label="Postal Code"
          value={formData.postalCode}
          onChange={(value) => onChange({ ...formData, postalCode: value })}
          errors={fieldErrors?.postalCode}
          required
        />

        <InputField
          label="Country"
          value={formData.country}
          onChange={(value) => onChange({ ...formData, country: value })}
          errors={fieldErrors?.country}
          required
        />

        <InputField
          label="VAT Number"
          value={formData.vatNumber}
          onChange={(value) => onChange({ ...formData, vatNumber: value })}
          errors={fieldErrors?.vatNumber}
        />

        <InputField
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(value) => onChange({ ...formData, phone: value })}
          errors={fieldErrors?.phone}
        />

        <CheckboxInput
          label="Set as default company"
          checked={formData.isDefault}
          onChange={(checked) => onChange({ ...formData, isDefault: checked })}
          errors={fieldErrors?.isDefault}
          id="isDefault"
        />

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
