import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
  deactivateCustomer,
  activateCustomer,
  buildCSRFHeaders,
  CustomersListView,
} from "../../ash_rpc";
import InvoicingLayout from "../../lib/components/InvoicingLayout";
import { getI18n } from "../../lib/i18n";

interface CustomersPageProps {
  current_user_id: string;
  locale: string;
  page_title: string;
  customers: CustomersListView;
}

export default function Customers({
  customers: initialCustomers,
  locale,
}: CustomersPageProps) {
  const { t } = getI18n(locale);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async (customer: CustomersListView[number]) => {
    if (
      confirm(
        customer.isActive 
          ? t("invoicing.confirmDeactivateCustomer")
          : t("invoicing.confirmActivateCustomer")
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
        // Refresh the page to show updated customer status
        window.location.reload();
      } catch (err) {
        setError(
          customer.isActive 
            ? t("invoicing.failedToDeactivateCustomer")
            : t("invoicing.failedToActivateCustomer")
        );
        console.error(err);
      }
    }
  };

  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t("invoicing.customers")}</h1>
          <Link
            href="/customers/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {t("invoicing.addCustomer")}
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialCustomers.map((customer) => (
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
                  {customer.isActive ? t("common.active") : t("common.inactive")}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{customer.addressLine1}</p>
                {customer.addressLine2 && <p>{customer.addressLine2}</p>}
                <p>
                  {customer.city} {customer.postalCode}
                </p>
                <p>{customer.country}</p>
                {customer.vatNumber && <p>{t("invoicing.vatNumber")}: {customer.vatNumber}</p>}
                {customer.email && <p>{t("common.email")}: {customer.email}</p>}
                {customer.phone && <p>{t("invoicing.phone")}: {customer.phone}</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/customers/${customer.id}/edit`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {t("common.edit")}
                </Link>
                <button
                  onClick={() => handleDeactivate(customer)}
                  className={`text-sm font-medium ${
                    customer.isActive
                      ? "text-orange-600 hover:text-orange-800"
                      : "text-green-600 hover:text-green-800"
                  }`}
                >
                  {customer.isActive ? t("invoicing.deactivate") : t("invoicing.activate")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {initialCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t("invoicing.noCustomersFound")}
          </div>
        )}
      </div>
    </InvoicingLayout>
  );
}
