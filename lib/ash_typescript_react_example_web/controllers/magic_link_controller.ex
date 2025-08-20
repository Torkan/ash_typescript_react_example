defmodule AshTypescriptReactExampleWeb.MagicLinkController do
  use AshTypescriptReactExampleWeb, :controller
  alias AshTypescriptReactExample.Accounts.User
  alias AshTypescriptReactExampleWeb.Helpers.EventMetadata

  # GET /sign-in - Show the magic link request form
  def new(conn, _params) do
    conn
    |> assign_prop(:page_title, "Sign In")
    |> render_inertia("MagicLinkRequest")
  end

  # POST /sign-in - Handle magic link request
  def create(conn, %{"email" => email}) do
    # Add event metadata for magic link requests
    metadata =
      EventMetadata.build_metadata(conn, %{
        action_type: "magic_link_request",
        email: email
      })

    # Call the action directly on the User resource, bypassing authorization for magic link requests
    case User
         |> Ash.ActionInput.for_action(:request_magic_link, %{email: email},
           context: %{ash_events_metadata: metadata}
         )
         |> Ash.run_action(authorize?: false) do
      :ok ->
        conn
        |> put_flash(
          :info,
          "If an account exists with that email, you will receive a magic link shortly."
        )
        |> redirect(to: ~p"/sign-in/check-email?email=#{email}")

      {:error, _} ->
        # Don't reveal whether the email exists or not
        conn
        |> put_flash(
          :info,
          "If an account exists with that email, you will receive a magic link shortly."
        )
        |> redirect(to: ~p"/sign-in/check-email?email=#{email}")
    end
  end

  # GET /sign-in/check-email - Show "check your email" page
  def check_email(conn, %{"email" => email}) do
    conn
    |> assign_prop(:page_title, "Check Your Email")
    |> assign_prop(:email, email)
    |> render_inertia("CheckEmail")
  end

  # GET /sign-in/verify - Show token input form (if user lost the email or wants to enter manually)
  def verify(conn, params) do
    token = Map.get(params, "token", "")

    conn
    |> assign_prop(:page_title, "Verify Magic Link")
    |> assign_prop(:token, token)
    |> render_inertia("MagicLinkVerify")
  end
end
