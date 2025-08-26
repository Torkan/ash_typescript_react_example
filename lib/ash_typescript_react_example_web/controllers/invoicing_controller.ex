defmodule AshTypescriptReactExampleWeb.InvoicingController do
  use AshTypescriptReactExampleWeb, :controller

  plug AshTypescriptReactExampleWeb.Plugs.SetAshTenant

  def companies(conn, _params) do
    conn
    |> assign_prop(:page_title, "Companies")
    |> render_inertia("invoicing/Companies")
  end

  def new_company(conn, _params) do
    # Fetch companies and customers using typed queries
    companies_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :companies_list_view,
        %{},
        conn
      )

    customers_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :customers_list_view,
        %{},
        conn
      )

    companies =
      case companies_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    customers =
      case customers_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    conn
    |> assign_prop(:page_title, "New Company")
    |> assign_prop(:companies, companies)
    |> assign_prop(:customers, customers)
    |> render_inertia("invoicing/NewCompany")
  end

  def edit_company(conn, %{"id" => id}) do
    # Fetch the company using typed query
    company_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :company_edit_view,
        %{input: %{id: id}},
        conn
      )

    company =
      case company_result do
        %{"success" => true, "data" => data} -> data
        _ -> nil
      end

    conn
    |> assign_prop(:company_id, id)
    |> assign_prop(:company, company)
    |> assign_prop(:page_title, "Edit Company")
    |> render_inertia("invoicing/EditCompany")
  end

  def customers(conn, _params) do
    # Fetch customers using typed query
    customers_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :customers_list_view,
        %{},
        conn
      )

    customers =
      case customers_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    conn
    |> assign_prop(:page_title, "Customers")
    |> assign_prop(:customers, customers)
    |> render_inertia("invoicing/Customers")
  end

  def new_customer(conn, _params) do
    conn
    |> assign_prop(:page_title, "New Customer")
    |> render_inertia("invoicing/NewCustomer")
  end

  def invoices(conn, params) do
    # Parse pagination parameters for keyset pagination
    limit = String.to_integer(params["limit"] || "10")
    filter_state = params["filter_state"] || "all"

    # Build pagination map
    page_params = %{limit: limit}

    page_params =
      cond do
        params["after"] -> Map.put(page_params, :after, params["after"])
        params["before"] -> Map.put(page_params, :before, params["before"])
        true -> page_params
      end

    # Build filter parameters
    filter_params =
      if filter_state != "all" do
        %{filter: %{state: %{eq: filter_state}}}
      else
        %{}
      end

    # Combine parameters
    query_params =
      Map.merge(
        %{
          page: page_params,
          # Most recent first for keyset pagination
          sort: "-issue_date"
        },
        filter_params
      )

    # Fetch invoices using typed query
    invoices_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :invoices_list_view,
        query_params,
        conn
      )

    invoices =
      case invoices_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    conn
    |> assign_prop(:page_title, "Invoices")
    |> assign_prop(:invoices, invoices)
    |> assign_prop(:after, params["after"])
    |> assign_prop(:before, params["before"])
    |> assign_prop(:limit, Integer.to_string(limit))
    |> assign_prop(:filter_state, filter_state)
    |> render_inertia("invoicing/Invoices")
  end

  def credit_notes(conn, _params) do
    # Fetch credit notes using typed query
    credit_notes_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :credit_notes_list_view,
        %{},
        conn
      )

    credit_notes =
      case credit_notes_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    conn
    |> assign_prop(:page_title, "Credit Notes")
    |> assign_prop(:credit_notes, credit_notes)
    |> render_inertia("invoicing/CreditNotes")
  end

  def new_invoice(conn, _params) do
    # Fetch companies and customers using typed queries
    companies_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :companies_list_view,
        %{},
        conn
      )

    customers_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :customers_list_view,
        %{},
        conn
      )

    companies =
      case companies_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    customers =
      case customers_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    conn
    |> assign_prop(:page_title, "New Invoice")
    |> assign_prop(:companies, companies)
    |> assign_prop(:customers, customers)
    |> render_inertia("invoicing/NewInvoice")
  end

  def edit_invoice(conn, %{"id" => id}) do
    # Fetch the invoice using typed query
    invoice_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :invoice_edit_view,
        %{input: %{id: id}},
        conn
      )

    invoice =
      case invoice_result do
        %{"success" => true, "data" => data} -> data
        _ -> nil
      end

    conn
    |> assign_prop(:invoice, invoice)
    |> assign_prop(:locale, conn.assigns[:locale] || "en")
    |> assign_prop(:page_title, "Edit Invoice")
    |> render_inertia("invoicing/EditInvoice")
  end

  def new_credit_note(conn, _params) do
    # Fetch companies and customers using typed queries
    companies_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :companies_list_view,
        %{},
        conn
      )

    customers_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :customers_list_view,
        %{},
        conn
      )

    companies =
      case companies_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    customers =
      case customers_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    conn
    |> assign_prop(:page_title, "New Credit Note")
    |> assign_prop(:companies, companies)
    |> assign_prop(:customers, customers)
    |> render_inertia("invoicing/NewCreditNote")
  end

  def edit_credit_note(conn, %{"id" => id}) do
    # Fetch the credit note using typed query
    credit_note_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :credit_note_edit_view,
        %{input: %{id: id}},
        conn
      )

    credit_note =
      case credit_note_result do
        %{"success" => true, "data" => data} -> data
        _ -> nil
      end

    conn
    |> assign_prop(:credit_note_id, id)
    |> assign_prop(:credit_note, credit_note)
    |> assign_prop(:page_title, "Edit Credit Note")
    |> render_inertia("invoicing/EditCreditNote")
  end

  def view_invoice(conn, %{"id" => id}) do
    # Fetch the invoice using typed query
    invoice_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :invoice_edit_view,
        %{input: %{id: id}},
        conn
      )

    invoice =
      case invoice_result do
        %{"success" => true, "data" => data} -> data
        _ -> nil
      end

    conn
    |> assign_prop(:invoice_id, id)
    |> assign_prop(:invoice, invoice)
    |> assign_prop(:page_title, "View Invoice")
    |> render_inertia("invoicing/ViewInvoice")
  end

  def invoices_offset(conn, params) do
    # Parse pagination parameters for offset pagination
    limit = String.to_integer(params["limit"] || "10")
    offset = String.to_integer(params["offset"] || "0")
    filter_state = params["filter_state"] || "all"

    # Build pagination map
    page_params = %{limit: limit, offset: offset, count: true}

    # Build filter parameters
    filter_params =
      if filter_state != "all" do
        %{filter: %{state: %{eq: filter_state}}}
      else
        %{}
      end

    # Combine parameters
    query_params =
      Map.merge(
        %{
          page: page_params,
          # Most recent first
          sort: "-issue_date"
        },
        filter_params
      )

    # Fetch invoices using typed query
    invoices_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :invoices_list_view,
        query_params,
        conn
      )

    invoices =
      case invoices_result do
        %{"success" => true, "data" => data} -> data
        _ -> []
      end

    # For offset pagination, we need to get total count
    # This is a simplified approach - in real apps you might want to optimize this
    total_count_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :invoices_list_view,
        filter_params,
        conn
      )

    total_count =
      case total_count_result do
        %{"success" => true, "data" => data} when is_list(data) -> length(data)
        _ -> 0
      end

    conn
    |> assign_prop(:page_title, "Invoices (Offset Pagination)")
    |> assign_prop(:invoices, invoices)
    |> assign_prop(:offset, Integer.to_string(offset))
    |> assign_prop(:limit, Integer.to_string(limit))
    |> assign_prop(:filter_state, filter_state)
    |> assign_prop(:total_count, total_count)
    |> render_inertia("invoicing/InvoicesOffset")
  end

  def view_credit_note(conn, %{"id" => id}) do
    # Fetch the credit note using typed query
    credit_note_result =
      AshTypescript.Rpc.run_typed_query(
        :ash_typescript_react_example,
        :credit_note_edit_view,
        %{input: %{id: id}},
        conn
      )

    credit_note =
      case credit_note_result do
        %{"success" => true, "data" => data} -> data
        _ -> nil
      end

    conn
    |> assign_prop(:credit_note_id, id)
    |> assign_prop(:credit_note, credit_note)
    |> assign_prop(:page_title, "View Credit Note")
    |> render_inertia("invoicing/ViewCreditNote")
  end
end
