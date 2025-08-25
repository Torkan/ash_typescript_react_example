defmodule AshTypescriptReactExampleWeb.Plugs.RequireUser do
  import Plug.Conn
  import Phoenix.Controller
  import Inertia.Controller
  use AshTypescriptReactExampleWeb, :verified_routes

  def init(default), do: default

  def call(conn, _default) do
    current_user = conn.assigns[:current_user]

    case current_user do
      nil ->
        conn
        |> put_flash(:error, "Access denied. You must be logged in to access this page.")
        |> redirect(to: ~p"/sign-in")
        |> halt()

      _ ->
        Ash.PlugHelpers.set_actor(conn, current_user)
        |> assign_prop(:currentUserId, current_user.id)
    end
  end
end
