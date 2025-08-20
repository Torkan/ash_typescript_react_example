defmodule AshTypescriptReactExample.Secrets do
  use AshAuthentication.Secret

  def secret_for(
        [:authentication, :tokens, :signing_secret],
        AshTypescriptReactExample.Accounts.User,
        _opts,
        _context
      ) do
    Application.fetch_env(:ash_typescript_react_example, :token_signing_secret)
  end
end
