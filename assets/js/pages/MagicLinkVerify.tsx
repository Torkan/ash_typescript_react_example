import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { getI18n } from '$lib/i18n';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("auth.verifyTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("auth.verifyInstructions")}
          </p>
        </div>

        {flash.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {flash.error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              {t("auth.magicLinkCode")}
            </label>
            <div className="mt-1">
              <input
                id="token"
                name="token"
                type="text"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.magicLinkCodePlaceholder")}
                disabled={processing}
              />
              {errors.token && (
                <p className="mt-2 text-sm text-red-600">{errors.token}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={processing || !tokenInput}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? t("auth.verifying") : t("auth.verifyAndSignIn")}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/sign-in"
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              {t("auth.requestNewLink")}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}