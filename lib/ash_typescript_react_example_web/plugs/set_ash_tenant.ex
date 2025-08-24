defmodule AshTypescriptReactExampleWeb.Plugs.SetAshTenant do
  @moduledoc """
  Plug to set the Ash tenant based on the current authenticated user.
  """
  
  import Plug.Conn
  import Phoenix.Controller, only: [redirect: 2, put_flash: 3]
  
  alias Ash.PlugHelpers

  def init(opts), do: opts

  def call(conn, _opts) do
    current_user = conn.assigns[:current_user]

    case current_user do
      nil ->
        # No authenticated user, should not happen with :user pipeline but handle gracefully
        conn
        |> put_flash(:error, "Authentication required")
        |> redirect(to: "/sign-in")
        |> halt()

      user ->
        # Set the Ash tenant to the current user's ID
        conn
        |> PlugHelpers.set_tenant(user.id)
    end
  end
end