defmodule AshTypescriptReactExampleWeb.PageControllerTest do
  use AshTypescriptReactExampleWeb.ConnCase

  test "GET / redirects to sign-in when not authenticated", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert redirected_to(conn, 302) == "/sign-in"
  end
end
