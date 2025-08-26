import React from "react";
import { Link } from "@inertiajs/react";
import InvoicingLayout from "../lib/components/InvoicingLayout";
import { getI18n } from "../lib/i18n";

interface IndexProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

export default function Index({ locale }: IndexProps) {
  const { t } = getI18n(locale);
  return (
    <InvoicingLayout locale={locale}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">{t("invoicing.systemTitle")}</h1>
          <p className="text-lg text-gray-600 text-center mb-8">
            {t("invoicing.systemDescription")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              href="/companies"
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">C</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t("invoicing.companies")}</h3>
                  <p className="text-sm text-gray-600">{t("invoicing.manageSenderCompanies")}</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/customers"
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">U</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t("invoicing.customers")}</h3>
                  <p className="text-sm text-gray-600">{t("invoicing.manageYourCustomers")}</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/invoices"
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-orange-500"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">I</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t("invoicing.invoices")}</h3>
                  <p className="text-sm text-gray-600">{t("invoicing.createAndManageInvoices")}</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/credit-notes"
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">N</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t("invoicing.creditNotes")}</h3>
                  <p className="text-sm text-gray-600">{t("invoicing.issueCreditNotes")}</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t("invoicing.quickActions")}</h2>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/invoices/new"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
              >
                {t("invoicing.createInvoice")}
              </Link>
              <Link 
                href="/credit-notes/new"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
              >
                {t("invoicing.createCreditNote")}
              </Link>
              <Link 
                href="/companies"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
              >
                {t("invoicing.addCompany")}
              </Link>
              <Link 
                href="/customers"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
              >
                {t("invoicing.addCustomer")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </InvoicingLayout>
  );
}
