defmodule AshTypescriptReactExample.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      AshTypescriptReactExampleWeb.Telemetry,
      AshTypescriptReactExample.Repo,
      {DNSCluster,
       query: Application.get_env(:ash_typescript_react_example, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: AshTypescriptReactExample.PubSub},
      {AshAuthentication.Supervisor, [otp_app: :ash_typescript_react_example]},
      {Inertia.SSR,
       path: Path.join([Application.app_dir(:ash_typescript_react_example), "priv/ssr"])},
      AshTypescriptReactExampleWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: AshTypescriptReactExample.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    AshTypescriptReactExampleWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
