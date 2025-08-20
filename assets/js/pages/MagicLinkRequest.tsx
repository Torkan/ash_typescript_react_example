import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { getI18n } from "$lib/i18n";

interface Props {
  errors?: Record<string, any>;
  flash?: Record<string, any>;
  locale: string;
}

export default function MagicLinkRequest({ errors = {}, locale }: Props) {
  // Initialize i18n with page locale
  const { t } = getI18n(locale);

  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    router.post(
      "/sign-in",
      { email },
      {
        onFinish: () => {
          setProcessing(false);
        },
      },
    );
  }

  return (
    <div className="min-h-screen hero bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-base-content">
            {t("auth.signInTitle")}
          </h1>
          <p className="mt-4 text-base-content/70">
            {t("auth.signInSubtitle")}
          </p>
        </div>

        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="email-address">
                  <span className="label-text">{t("auth.emailAddress")}</span>
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered input-primary w-full"
                  placeholder={t("auth.emailPlaceholder")}
                  disabled={processing}
                />
                {errors.email && (
                  <div className="label">
                    <span className="label-text-alt text-error">
                      {errors.email}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  disabled={processing}
                  className={`btn btn-primary w-full ${processing ? "loading" : ""}`}
                >
                  {processing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {t("common.sending")}
                    </>
                  ) : (
                    t("auth.sendMagicLink")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
