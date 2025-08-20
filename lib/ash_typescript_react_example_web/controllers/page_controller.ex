defmodule AshTypescriptReactExampleWeb.PageController do
  use AshTypescriptReactExampleWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
