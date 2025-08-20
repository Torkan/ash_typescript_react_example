defmodule AshTypescriptReactExampleWeb.Plugs.RequireSuperAdmin do
  import Plug.Conn
  import Phoenix.Controller
  use AshTypescriptReactExampleWeb, :verified_routes

  def init(default), do: default

  def call(conn, _default) do
    current_user = conn.assigns[:current_user]

    case current_user do
      %{super_admin: true} ->
        Ash.PlugHelpers.set_actor(conn, current_user)

      _ ->
        conn
        |> put_flash(:error, "Access denied. You must be a super admin to access this page.")
        |> redirect(to: ~p"/")
        |> halt()
    end
  end
end
