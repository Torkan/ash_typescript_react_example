defmodule AshTypescriptReactExampleWeb.Plugs.Locale do
  @moduledoc """
  Plug to manage locale setting from session.

  This plug reads the locale from the session and stores it in conn.assigns
  for use by the frontend i18n system. Falls back to "no" if no locale is set.
  Also passes the locale to Inertia as a prop for all pages.
  """

  import Plug.Conn
  import Inertia.Controller

  @default_locale "no"
  @supported_locales ["en", "no"]

  def init(opts), do: opts

  def call(conn, _opts) do
    locale = get_session_locale(conn)

    IO.inspect(locale, label: "LOCALE IS")

    conn
    |> assign(:locale, locale)
    |> assign_prop(:locale, locale)
  end

  defp get_session_locale(conn) do
    session_locale = get_session(conn, "locale")

    if is_valid_locale?(session_locale) do
      session_locale
    else
      @default_locale
    end
  end

  defp is_valid_locale?(locale) when is_binary(locale) do
    locale in @supported_locales
  end

  defp is_valid_locale?(_), do: false
end
