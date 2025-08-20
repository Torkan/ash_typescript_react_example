defmodule AshTypescriptReactExample.Accounts do
  use Ash.Domain,
    otp_app: :ash_typescript_react_example

  resources do
    resource AshTypescriptReactExample.Accounts.Token
    resource AshTypescriptReactExample.Accounts.User
  end
end
