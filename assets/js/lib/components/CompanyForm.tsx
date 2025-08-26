import React from "react";
import InputField from "./InputField";
import CheckboxInput from "./CheckboxInput";
import { getI18n } from "../i18n";

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
  locale: string;
}

export default function CompanyForm({
  formData,
  fieldErrors,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  locale,
}: CompanyFormProps) {
  const { t } = getI18n(locale);
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? t("invoicing.editCompany") : t("invoicing.addCompany")}
      </h2>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <InputField
          label={t("invoicing.companyName")}
          value={formData.name}
          onChange={(value) => onChange({ ...formData, name: value })}
          errors={fieldErrors?.name}
          required
        />

        <InputField
          label={t("common.email")}
          type="email"
          value={formData.email}
          onChange={(value) => onChange({ ...formData, email: value })}
          errors={fieldErrors?.email}
        />

        <InputField
          label={t("invoicing.addressLine1")}
          value={formData.addressLine1}
          onChange={(value) => onChange({ ...formData, addressLine1: value })}
          errors={fieldErrors?.addressLine1}
          required
        />

        <InputField
          label={t("invoicing.addressLine2")}
          value={formData.addressLine2}
          onChange={(value) => onChange({ ...formData, addressLine2: value })}
          errors={fieldErrors?.addressLine2}
        />

        <InputField
          label={t("forms.city")}
          value={formData.city}
          onChange={(value) => onChange({ ...formData, city: value })}
          errors={fieldErrors?.city}
          required
        />

        <InputField
          label={t("forms.postalCode")}
          value={formData.postalCode}
          onChange={(value) => onChange({ ...formData, postalCode: value })}
          errors={fieldErrors?.postalCode}
          required
        />

        <InputField
          label={t("forms.country")}
          value={formData.country}
          onChange={(value) => onChange({ ...formData, country: value })}
          errors={fieldErrors?.country}
          required
        />

        <InputField
          label={t("invoicing.vatNumber")}
          value={formData.vatNumber}
          onChange={(value) => onChange({ ...formData, vatNumber: value })}
          errors={fieldErrors?.vatNumber}
        />

        <InputField
          label={t("invoicing.phone")}
          type="tel"
          value={formData.phone}
          onChange={(value) => onChange({ ...formData, phone: value })}
          errors={fieldErrors?.phone}
        />

        <CheckboxInput
          label={t("invoicing.isDefault")}
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
            {isEditing ? t("invoicing.updateCompany") : t("invoicing.createCompany")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
