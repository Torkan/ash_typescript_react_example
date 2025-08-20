import React from "react";
import { router } from "@inertiajs/react";

interface Props {
  locale: string;
  children: React.ReactNode;
}

export default function MagicLinkLayout({ locale, children }: Props) {
  const handleLocaleChange = (newLocale: string) => {
    const currentUrl = window.location.pathname + window.location.search;
    router.get(`/session/set_locale?locale=${newLocale}&return_to=${encodeURIComponent(currentUrl)}`);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-base-100 border-b border-base-300 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-end">
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