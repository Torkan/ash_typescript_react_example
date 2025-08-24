import React, { useState, useEffect } from "react";
import {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  buildCSRFHeaders,
  type CompanyResourceSchema,
} from "../../ash_rpc";

interface CompaniesPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

export default function Companies({ current_user_id }: CompaniesPageProps) {
  const [companies, setCompanies] = useState<CompanyResourceSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] =
    useState<CompanyResourceSchema | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "Norway",
    vatNumber: "",
    email: "",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await listCompanies({
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
          "isDefault",
        ],
        headers: buildCSRFHeaders(),
      });
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError("Failed to load companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateCompany({
          primaryKey: editingCompany.id,
          input: formData,
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });
      } else {
        await createCompany({
          input: formData,
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });
      }
      await loadCompanies();
      resetForm();
    } catch (err) {
      setError("Failed to save company");
      console.error(err);
    }
  };

  const handleEdit = (company: CompanyResourceSchema) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      addressLine1: company.addressLine1,
      addressLine2: company.addressLine2 || "",
      city: company.city,
      postalCode: company.postalCode,
      country: company.country,
      vatNumber: company.vatNumber || "",
      email: company.email || "",
      phone: company.phone || "",
      isDefault: company.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany({ id, headers: buildCSRFHeaders() });
        await loadCompanies();
      } catch (err) {
        setError("Failed to delete company");
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCompany(null);
    setFormData({
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "Norway",
      vatNumber: "",
      email: "",
      phone: "",
      isDefault: false,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Company
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
            {editingCompany ? "Edit Company" : "New Company"}
          </h2>
          <form
            onSubmit={handleSubmit}
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, addressLine1: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, addressLine2: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, vatNumber: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
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

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editingCompany ? "Update" : "Create"} Company
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
        {companies.map((company) => (
          <div key={company.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{company.name}</h3>
              {company.isDefault && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Default
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{company.addressLine1}</p>
              {company.addressLine2 && <p>{company.addressLine2}</p>}
              <p>
                {company.city} {company.postalCode}
              </p>
              <p>{company.country}</p>
              {company.vatNumber && <p>VAT: {company.vatNumber}</p>}
              {company.email && <p>Email: {company.email}</p>}
              {company.phone && <p>Phone: {company.phone}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(company)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(company.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          No companies found. Click "Add Company" to create your first company.
        </div>
      )}
    </div>
  );
}
