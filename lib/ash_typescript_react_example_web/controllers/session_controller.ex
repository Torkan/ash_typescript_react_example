defmodule AshTypescriptReactExampleWeb.SessionController do
  use AshTypescriptReactExampleWeb, :controller

  @supported_locales ["en", "no"]

  def set_locale(conn, %{"locale" => locale} = params) do
    if locale in @supported_locales do
      conn
      |> put_session("locale", locale)
      |> redirect_to_return_url(params)
    else
      conn
      |> put_flash(:error, "Unsupported locale: #{locale}")
      |> redirect_to_return_url(params)
    end
  end

  defp redirect_to_return_url(conn, %{"return_to" => return_to}) when is_binary(return_to) do
    # Validate that return_to is a safe internal path
    if String.starts_with?(return_to, "/") and not String.contains?(return_to, "//") do
      redirect(conn, to: return_to)
    else
      redirect(conn, to: "/")
    end
  end

  defp redirect_to_return_url(conn, _params) do
    redirect(conn, to: "/")
  end
end
