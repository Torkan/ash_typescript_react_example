defmodule AshTypescriptReactExampleWeb.PageController do
  use AshTypescriptReactExampleWeb, :controller

  def index(conn, _params) do
    case conn.assigns[:current_user] do
      nil ->
        # No user logged in, redirect to sign-in
        conn
        |> redirect(to: ~p"/sign-in")

      current_user ->
        # User is logged in, pass minimal data - let client fetch the rest
        conn
        |> assign_prop(:current_user_id, current_user.id)
        |> assign_prop(:locale, conn.assigns[:locale] || "en")
        |> assign_prop(:page_title, "Invoice Management System")
        |> render_inertia("Index")
    end
  end
end
