import React from "react";
import { router } from "@inertiajs/react";
import { getI18n } from "$lib/i18n";
import MagicLinkLayout from "$lib/components/MagicLinkLayout";

interface Props {
  email?: string;
  locale: string;
}

export default function MagicLinkCheckEmail({ email, locale }: Props) {
  const { t } = getI18n(locale);

  function handleResendEmail() {
    if (email) {
      router.post("/sign-in", { email });
    }
  }

  function handleBackToLogin() {
    router.get("/auth/magic-link-request");
  }

  return (
    <MagicLinkLayout locale={locale}>
      <div className="hero">
        <div className="hero-content flex-col">
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-base-content">
              {t("auth.checkEmailTitle")}
            </h1>
            <p className="mt-4 text-base-content/70 max-w-md">
              {email
                ? t("auth.checkEmailSubtitleWithEmail", { email })
                : t("auth.checkEmailSubtitle")}
            </p>
          </div>

          <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body text-center space-y-4">
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{t("auth.checkSpamFolder")}</span>
              </div>

              <div className="divider">{t("common.or")}</div>

              <div className="space-y-2">
                {email && (
                  <button
                    onClick={handleResendEmail}
                    className="btn btn-outline btn-primary w-full"
                  >
                    {t("auth.resendEmail")}
                  </button>
                )}

                <button
                  onClick={handleBackToLogin}
                  className="btn btn-ghost w-full"
                >
                  {t("auth.backToLogin")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MagicLinkLayout>
  );
}
