defmodule AshTypescriptReactExample.Accounts.User.Senders.SendMagicLinkEmail do
  @moduledoc """
  Sends a magic link email
  """

  use AshAuthentication.Sender
  use AshTypescriptReactExampleWeb, :verified_routes

  import Swoosh.Email
  alias AshTypescriptReactExample.Mailer

  @impl true
  def send(user_or_email, token, _) do
    # if you get a user, its for a user that already exists.
    # if you get an email, then the user does not yet exist.

    email =
      case user_or_email do
        %{email: email} -> email
        email -> email
      end

    new()
    # TODO: Replace with your email
    |> from({"noreply", "noreply@example.com"})
    |> to(to_string(email))
    |> subject("Your login link")
    |> html_body(body(token: token, email: email))
    |> Mailer.deliver!()
  end

  defp body(params) do
    # The link goes to our verify page which will auto-submit the token
    sign_in_url = "http://localhost:5173/sign-in/verify?token=#{params[:token]}"

    """
    <p>Hello, #{params[:email]}!</p>
    <p>Click this link to sign in to your account:</p>
    <p><a href="#{sign_in_url}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Sign In</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all;">#{sign_in_url}</p>
    <p>If you didn't request this email, you can safely ignore it.</p>
    """
  end
end
