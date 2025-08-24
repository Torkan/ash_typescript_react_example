import React, { useState, useEffect } from "react";
import { 
  listActiveCustomers, 
  createCustomer, 
  updateCustomer, 
  deactivateCustomer,
  activateCustomer,
  buildCSRFHeaders,
  type CustomerResourceSchema 
} from "../../ash_rpc";

interface CustomersPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

export default function Customers({ current_user_id }: CustomersPageProps) {
  const [customers, setCustomers] = useState<CustomerResourceSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerResourceSchema | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "Norway",
    vatNumber: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await listActiveCustomers({
        fields: ['id', 'name', 'addressLine1', 'addressLine2', 'city', 'postalCode', 
                 'country', 'vatNumber', 'email', 'phone', 'isActive'],
        headers: buildCSRFHeaders(),
      });
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError("Failed to load customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer({
          id: editingCustomer.id,
          params: formData,
          fields: ['id'],
          headers: buildCSRFHeaders(),
        });
      } else {
        await createCustomer({
          params: formData,
          fields: ['id'],
          headers: buildCSRFHeaders(),
        });
      }
      await loadCustomers();
      resetForm();
    } catch (err) {
      setError("Failed to save customer");
      console.error(err);
    }
  };

  const handleEdit = (customer: CustomerResourceSchema) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      addressLine1: customer.addressLine1,
      addressLine2: customer.addressLine2 || "",
      city: customer.city,
      postalCode: customer.postalCode,
      country: customer.country,
      vatNumber: customer.vatNumber || "",
      email: customer.email || "",
      phone: customer.phone || ""
    });
    setShowForm(true);
  };

  const handleDeactivate = async (customer: CustomerResourceSchema) => {
    if (confirm(`Are you sure you want to ${customer.isActive ? 'deactivate' : 'activate'} this customer?`)) {
      try {
        if (customer.isActive) {
          await deactivateCustomer({
            id: customer.id,
            fields: ['id'],
            headers: buildCSRFHeaders(),
          });
        } else {
          await activateCustomer({
            id: customer.id,
            fields: ['id'],
            headers: buildCSRFHeaders(),
          });
        }
        await loadCustomers();
      } catch (err) {
        setError(`Failed to ${customer.isActive ? 'deactivate' : 'activate'} customer`);
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "Norway",
      vatNumber: "",
      email: "",
      phone: ""
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Customer
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCustomer ? "Edit Customer" : "New Customer"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VAT Number
              </label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editingCustomer ? "Update" : "Create"} Customer
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                customer.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{customer.addressLine1}</p>
              {customer.addressLine2 && <p>{customer.addressLine2}</p>}
              <p>{customer.city} {customer.postalCode}</p>
              <p>{customer.country}</p>
              {customer.vatNumber && <p>VAT: {customer.vatNumber}</p>}
              {customer.email && <p>Email: {customer.email}</p>}
              {customer.phone && <p>Phone: {customer.phone}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(customer)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeactivate(customer)}
                className={`text-sm font-medium ${
                  customer.isActive 
                    ? 'text-orange-600 hover:text-orange-800' 
                    : 'text-green-600 hover:text-green-800'
                }`}
              >
                {customer.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {customers.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          No active customers found. Click "Add Customer" to create your first customer.
        </div>
      )}
    </div>
  );
}