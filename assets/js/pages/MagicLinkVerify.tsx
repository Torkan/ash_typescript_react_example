import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { getI18n } from '$lib/i18n';
import MagicLinkLayout from '$lib/components/MagicLinkLayout';

interface Props {
  token?: string;
  errors?: Record<string, any>;
  flash?: Record<string, any>;
  locale: string;
}

export default function MagicLinkVerify({ token = "", errors = {}, flash = {}, locale }: Props) {
  // Initialize i18n with page locale
  const { t } = getI18n(locale);

  const [tokenInput, setTokenInput] = useState(token);
  const [processing, setProcessing] = useState(false);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!tokenInput || tokenInput.trim().length === 0) {
      return;
    }

    setProcessing(true);

    router.post(
      "/auth/user/magic_link",
      { token: tokenInput },
      {
        onFinish: () => {
          setProcessing(false);
        },
      },
    );
  }

  return (
    <MagicLinkLayout locale={locale}>
      <div className="hero">
        <div className="hero-content flex-col">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-base-content">
              {t("auth.verifyTitle")}
            </h1>
            <p className="mt-4 text-base-content/70">
              {t("auth.verifyInstructions")}
            </p>
          </div>

          <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body">
              {flash.error && (
                <div className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{flash.error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label" htmlFor="token">
                    <span className="label-text">{t("auth.magicLinkCode")}</span>
                  </label>
                  <input
                    id="token"
                    name="token"
                    type="text"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="input input-bordered input-primary w-full"
                    placeholder={t("auth.magicLinkCodePlaceholder")}
                    disabled={processing}
                  />
                  {errors.token && (
                    <div className="label">
                      <span className="label-text-alt text-error">
                        {errors.token}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-control mt-6">
                  <button
                    type="submit"
                    disabled={processing || !tokenInput}
                    className={`btn btn-primary w-full ${processing ? "loading" : ""}`}
                  >
                    {processing ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        {t("auth.verifying")}
                      </>
                    ) : (
                      t("auth.verifyAndSignIn")
                    )}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <a
                    href="/sign-in"
                    className="link link-primary text-sm"
                  >
                    {t("auth.requestNewLink")}
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MagicLinkLayout>
  );
}