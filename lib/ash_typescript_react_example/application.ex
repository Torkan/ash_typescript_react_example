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
      {DNSCluster, query: Application.get_env(:ash_typescript_react_example, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: AshTypescriptReactExample.PubSub},
      # Start a worker by calling: AshTypescriptReactExample.Worker.start_link(arg)
      # {AshTypescriptReactExample.Worker, arg},
      # Start to serve requests, typically the last entry
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
