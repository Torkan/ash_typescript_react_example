import React from "react";

interface IndexProps {
  current_user_id: string;
  locale: string;
  page_title: string;
}

export default function Index({ current_user_id }: IndexProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Invoice Management System</h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          Manage your companies, customers, invoices, and credit notes efficiently.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a 
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
                <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
                <p className="text-sm text-gray-600">Manage sender companies</p>
              </div>
            </div>
          </a>

          <a 
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
                <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
                <p className="text-sm text-gray-600">Manage your customers</p>
              </div>
            </div>
          </a>

          <a 
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
                <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
                <p className="text-sm text-gray-600">Create and manage invoices</p>
              </div>
            </div>
          </a>

          <a 
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
                <h3 className="text-lg font-semibold text-gray-900">Credit Notes</h3>
                <p className="text-sm text-gray-600">Issue credit notes</p>
              </div>
            </div>
          </a>
        </div>

        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a 
              href="/invoices/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
            >
              Create Invoice
            </a>
            <a 
              href="/credit-notes/new"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
            >
              Create Credit Note
            </a>
            <a 
              href="/companies"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
            >
              Add Company
            </a>
            <a 
              href="/customers"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
            >
              Add Customer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
