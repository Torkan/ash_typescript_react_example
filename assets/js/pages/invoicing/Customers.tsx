import React, { useState, useEffect } from "react";
import {
  listActiveCustomers,
  deactivateCustomer,
  activateCustomer,
  buildCSRFHeaders,
  ListActiveCustomersResult,
  ListActiveCustomersFields,
} from "../../ash_rpc";
import InvoicingLayout from "../../lib/components/InvoicingLayout";

interface CustomersPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

const customerFields = [
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
] satisfies ListActiveCustomersFields;

// Helper function to fetch customers with proper typing
async function fetchCustomers() {
  return await listActiveCustomers({
    fields: customerFields,
    headers: buildCSRFHeaders(),
  });
}

export default function Customers({ locale }: CustomersPageProps) {
  const [customers, setCustomers] = useState<
    Extract<ListActiveCustomersResult<typeof customerFields>, { success: true }>["data"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const result = await fetchCustomers();
      if (result.success) {
        setCustomers(result.data);
      } else {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }
      setError(null);
    } catch (err) {
      setError("Failed to load customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleDeactivate = async (
    customer: Extract<
      ListActiveCustomersResult<typeof customerFields>,
      { success: true }
    >["data"][number]
  ) => {
    if (
      confirm(
        `Are you sure you want to ${customer.isActive ? "deactivate" : "activate"} this customer?`,
      )
    ) {
      try {
        if (customer.isActive) {
          const result = await deactivateCustomer({
            primaryKey: customer.id,
            fields: ["id"],
            headers: buildCSRFHeaders(),
          });
          if (!result.success) {
            throw new Error(result.errors.map((e) => e.message).join(", "));
          }
        } else {
          const result = await activateCustomer({
            primaryKey: customer.id,
            fields: ["id"],
            headers: buildCSRFHeaders(),
          });
          if (!result.success) {
            throw new Error(result.errors.map((e) => e.message).join(", "));
          }
        }
        await loadCustomers();
      } catch (err) {
        setError(
          `Failed to ${customer.isActive ? "deactivate" : "activate"} customer`,
        );
        console.error(err);
      }
    }
  };


  if (loading) {
    return (
      <InvoicingLayout locale={locale}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading customers...</div>
        </div>
      </InvoicingLayout>
    );
  }

  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <a
          href="/customers/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Customer
        </a>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  customer.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {customer.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{customer.addressLine1}</p>
              {customer.addressLine2 && <p>{customer.addressLine2}</p>}
              <p>
                {customer.city} {customer.postalCode}
              </p>
              <p>{customer.country}</p>
              {customer.vatNumber && <p>VAT: {customer.vatNumber}</p>}
              {customer.email && <p>Email: {customer.email}</p>}
              {customer.phone && <p>Phone: {customer.phone}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href={`/customers/${customer.id}/edit`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </a>
              <button
                onClick={() => handleDeactivate(customer)}
                className={`text-sm font-medium ${
                  customer.isActive
                    ? "text-orange-600 hover:text-orange-800"
                    : "text-green-600 hover:text-green-800"
                }`}
              >
                {customer.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No active customers found. Click "Add Customer" to create your first
          customer.
        </div>
      )}
      </div>
    </InvoicingLayout>
  );
}
