defmodule AshTypescriptReactExampleWeb.InvoicingController do
  use AshTypescriptReactExampleWeb, :controller
  
  plug AshTypescriptReactExampleWeb.Plugs.SetAshTenant

  def companies(conn, _params) do
    conn
    |> assign_prop(:current_user_id, conn.assigns.current_user.id)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "Companies")
    |> render_inertia("invoicing/Companies")
  end

  def customers(conn, _params) do
    conn
    |> assign_prop(:current_user_id, conn.assigns.current_user.id)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "Customers")
    |> render_inertia("invoicing/Customers")
  end

  def invoices(conn, _params) do
    conn
    |> assign_prop(:current_user_id, conn.assigns.current_user.id)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "Invoices")
    |> render_inertia("invoicing/Invoices")
  end

  def credit_notes(conn, _params) do
    conn
    |> assign_prop(:current_user_id, conn.assigns.current_user.id)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "Credit Notes")
    |> render_inertia("invoicing/CreditNotes")
  end

  def new_invoice(conn, _params) do
    conn
    |> assign_prop(:current_user_id, conn.assigns.current_user.id)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "New Invoice")
    |> render_inertia("invoicing/NewInvoice")
  end

  def edit_invoice(conn, %{"id" => id}) do
    conn
    |> assign_prop(:current_user_id, conn.assigns.current_user.id)
    |> assign_prop(:invoice_id, id)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "Edit Invoice")
    |> render_inertia("invoicing/EditInvoice")
  end

  def new_credit_note(conn, _params) do
    conn
    |> assign_prop(:current_user_id, conn.assigns.current_user.id)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "New Credit Note")
    |> render_inertia("invoicing/NewCreditNote")
  end

  def edit_credit_note(conn, %{"id" => id}) do
    conn
    |> assign_prop(:current_user_id, conn.assigns.current_user.id)
    |> assign_prop(:credit_note_id, id)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "Edit Credit Note")
    |> render_inertia("invoicing/EditCreditNote")
  end
end
