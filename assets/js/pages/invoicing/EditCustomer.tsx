import React, { useState, useEffect } from "react";
import { useAshRpcForm } from "../../lib/useAshRpcForm";
import {
  getCustomer,
  updateCustomer,
  updateCustomerZodschema,
  buildCSRFHeaders,
} from "../../ash_rpc";
import InvoicingLayout from "../../lib/components/InvoicingLayout";

interface EditCustomerPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  customer_id: string;
}

const defaultCustomerData = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "Norway",
  vatNumber: "",
  email: "",
  phone: "",
};

export default function EditCustomer({
  customer_id,
  locale,
}: EditCustomerPageProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    formData,
    setFormData,
    fieldErrors,
    handleChange,
    handleSubmit,
    isSubmitting,
    error,
  } = useAshRpcForm({
    initialData: defaultCustomerData,
    zodSchema: updateCustomerZodschema,
    onSubmit: async (data) => {
      const result = await updateCustomer({
        primaryKey: customer_id,
        input: data,
        fields: ["id"],
        headers: buildCSRFHeaders(),
      });
      return result;
    },
    onSuccess: (_result) => {
      window.location.href = "/customers";
    },
  });

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true);
        const result = await getCustomer({
          input: { id: customer_id },
          fields: [
            "id",
            "name",
            "addressLine1",
            "addressLine2",
            "city",
            "postalCode",
            "country",
            "vatNumber",
            "email",
            "phone",
            "isActive",
          ],
          headers: buildCSRFHeaders(),
        });

        if (result.success) {
          if (result.data) {
            setFormData({
              name: result.data.name,
              addressLine1: result.data.addressLine1,
              addressLine2: result.data.addressLine2 || "",
              city: result.data.city,
              postalCode: result.data.postalCode,
              country: result.data.country,
              vatNumber: result.data.vatNumber || "",
              email: result.data.email || "",
              phone: result.data.phone || "",
            });
          }
        } else {
          throw new Error(result.errors.map((e) => e.message).join(", "));
        }
        setLoadError(null);
      } catch (err) {
        setLoadError("Failed to load customer");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [customer_id, setFormData]);

  const handleInputChange = (field: keyof typeof defaultCustomerData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleChange({
      ...formData,
      [field]: e.target.value,
    });
  };

  if (loading) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading customer...</div>
        </div>
      </InvoicingLayout>
    );
  }

  if (loadError) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {loadError}
          </div>
          <a
            href="/customers"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Customers
          </a>
        </div>
      </InvoicingLayout>
    );
  }

  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Customer</h1>
          <a
            href="/customers"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Back to Customers
          </a>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.name && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.name.join(", ")}
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
                onChange={handleInputChange("email")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.email && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.email.join(", ")}
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
                onChange={handleInputChange("addressLine1")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.addressLine1 && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.addressLine1.join(", ")}
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
                onChange={handleInputChange("addressLine2")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.addressLine2 && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.addressLine2.join(", ")}
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
                onChange={handleInputChange("city")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.city && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.city.join(", ")}
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
                onChange={handleInputChange("postalCode")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.postalCode && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.postalCode.join(", ")}
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
                onChange={handleInputChange("country")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.country && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.country.join(", ")}
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
                onChange={handleInputChange("vatNumber")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.vatNumber && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.vatNumber.join(", ")}
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
                onChange={handleInputChange("phone")}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.phone && (
                <div className="text-red-500 text-sm mt-1">
                  {fieldErrors.phone.join(", ")}
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded"
              >
                {isSubmitting ? "Updating..." : "Update Customer"}
              </button>
              <a
                href="/customers"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded inline-block text-center"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </InvoicingLayout>
  );
}