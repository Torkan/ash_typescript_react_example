defmodule AshTypescriptReactExampleWeb.Router do
  use AshTypescriptReactExampleWeb, :router

  use AshAuthentication.Phoenix.Router

  import AshAuthentication.Plug.Helpers

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug Inertia.Plug
    plug :put_root_layout, html: {AshTypescriptReactExampleWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :load_from_session
    plug AshTypescriptReactExampleWeb.Plugs.Locale
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :load_from_bearer
    plug :set_actor, :user
  end

  pipeline :user do
    plug :browser
    plug AshTypescriptReactExampleWeb.Plugs.RequireUser
    plug AshTypescriptReactExampleWeb.Plugs.SetAshTenant
  end

  scope "/", AshTypescriptReactExampleWeb do
    pipe_through :browser

    ash_authentication_live_session :authenticated_routes do
      # in each liveview, add one of the following at the top of the module:
      #
      # If an authenticated user must be present:
      # on_mount {AshTypescriptReactExampleWeb.LiveUserAuth, :live_user_required}
      #
      # If an authenticated user *may* be present:
      # on_mount {AshTypescriptReactExampleWeb.LiveUserAuth, :live_user_optional}
      #
      # If an authenticated user must *not* be present:
      # on_mount {AshTypescriptReactExampleWeb.LiveUserAuth, :live_no_user}
    end
  end

  scope "/", AshTypescriptReactExampleWeb do
    pipe_through :user

    get "/", PageController, :index
    post "/rpc/run", RpcController, :run
    post "/rpc/validate", RpcController, :validate

    # Invoicing routes
    get "/companies", InvoicingController, :companies
    get "/customers", InvoicingController, :customers
    get "/invoices", InvoicingController, :invoices
    get "/invoices/new", InvoicingController, :new_invoice
    get "/invoices/:id/edit", InvoicingController, :edit_invoice
    get "/credit-notes", InvoicingController, :credit_notes
    get "/credit-notes/new", InvoicingController, :new_credit_note
    get "/credit-notes/:id/edit", InvoicingController, :edit_credit_note
  end

  scope "/", AshTypescriptReactExampleWeb do
    pipe_through :browser

    # Session/locale routes
    get "/session/set_locale", SessionController, :set_locale

    # Magic link authentication routes
    get "/sign-in", MagicLinkController, :new
    post "/sign-in", MagicLinkController, :create
    get "/sign-in/check-email", MagicLinkController, :check_email
    get "/sign-in/verify", MagicLinkController, :verify
    post "/sign-in/verify", MagicLinkController, :verify_token

    auth_routes AuthController, AshTypescriptReactExample.Accounts.User, path: "/auth"
  end

  # Other scopes may use custom stacks.
  # scope "/api", AshTypescriptReactExampleWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:ash_typescript_react_example, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: AshTypescriptReactExampleWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
