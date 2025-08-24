defmodule AshTypescriptReactExampleWeb.RpcController do
  use AshTypescriptReactExampleWeb, :controller

  plug AshTypescriptReactExampleWeb.Plugs.SetAshTenant

  def run(conn, params) do
    conn = Ash.PlugHelpers.set_actor(conn, conn.assigns[:current_user])
    result = AshTypescript.Rpc.run_action(:invoicing, conn, params)
    json(conn, result)
  end

  def validate(conn, params) do
    conn = Ash.PlugHelpers.set_actor(conn, conn.assigns[:current_user])
    result = AshTypescript.Rpc.validate_action(:invoicing, conn, params)
    json(conn, result)
  end
end
