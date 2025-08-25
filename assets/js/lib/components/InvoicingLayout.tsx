import React from "react";
import { router } from "@inertiajs/react";

interface Props {
  locale: string;
  children: React.ReactNode;
}

export default function InvoicingLayout({ locale, children }: Props) {
  const handleLocaleChange = (newLocale: string) => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname + window.location.search;
      router.get(`/session/set_locale?locale=${newLocale}&return_to=${encodeURIComponent(currentUrl)}`);
    }
  };

  const navigationItems = [
    { href: "/companies", label: "Companies" },
    { href: "/customers", label: "Customers" },
    { href: "/invoices", label: "Invoices" },
    { href: "/credit-notes", label: "Credit Notes" },
  ];

  const isActive = (href: string) => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-base-100 border-b border-base-300 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Navigation Menu */}
            <nav className="flex space-x-1">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`btn btn-sm ${
                    isActive(item.href) ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Locale Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleLocaleChange("en")}
                className={`btn btn-sm ${
                  locale === "en" ? "btn-primary" : "btn-ghost"
                }`}
                title="English"
              >
                🇬🇧
              </button>
              <button
                onClick={() => handleLocaleChange("no")}
                className={`btn btn-sm ${
                  locale === "no" ? "btn-primary" : "btn-ghost"
                }`}
                title="Norsk"
              >
                🇳🇴
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}