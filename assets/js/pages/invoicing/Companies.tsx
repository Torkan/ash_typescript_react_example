import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import {
  listCompanies,
  deleteCompany,
  buildCSRFHeaders,
  ListCompaniesResult,
  ListCompaniesFields,
} from "../../ash_rpc";

interface CompaniesPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

const companyFields = [
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
] satisfies ListCompaniesFields;

// Helper function to fetch companies with proper typing
async function fetchCompanies() {
  return await listCompanies({
    fields: companyFields,
    headers: buildCSRFHeaders(),
  });
}

export default function Companies({}: CompaniesPageProps) {
  const [companies, setCompanies] = useState<
    Extract<ListCompaniesResult<typeof companyFields>, { success: true }>["data"]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const result = await fetchCompanies();
      if (result.success) {
        setCompanies(result.data);
      } else {
        throw new Error(result.errors.map((e) => e.message).join(", "));
      }
      setError(null);
    } catch (err) {
      setError("Failed to load companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        const result = await deleteCompany({
          primaryKey: id,
          headers: buildCSRFHeaders(),
        });
        if (!result.success) {
          throw new Error(result.errors.map((e) => e.message).join(", "));
        }
        await loadCompanies();
      } catch (err) {
        setError("Failed to delete company");
        console.error(err);
      }
    }
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
        <Link
          href="/companies/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
        >
          Add Company
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
              <Link
                href={`/companies/${company.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </Link>
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

      {companies.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No companies found. Click "Add Company" to create your first company.
        </div>
      )}
    </div>
  );
}
