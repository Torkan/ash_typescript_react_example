defmodule AshTypescriptReactExample.Invoicing do
  @moduledoc """
  The Invoicing domain for managing invoices, credit notes, customers, and companies.

  This domain handles all business logic related to:
  - Company management
  - Customer management
  - Invoice creation and lifecycle management
  - Credit note creation and lifecycle management
  - Serial number generation for finalized documents

  All resources in this domain are multi-tenant, scoped by user_id.
  """

  use Ash.Domain,
    otp_app: :ash_typescript_react_example,
    extensions: [AshTypescript.Rpc]

  rpc do
    # Company management
    resource AshTypescriptReactExample.Invoicing.Company do
      rpc_action :create_company, :create
      rpc_action :get_company, :get_by_id
      rpc_action :update_company, :update
      rpc_action :delete_company, :destroy
      rpc_action :list_companies, :read
      rpc_action :get_default_company, :get_default

      # Typed query for listing companies with basic info
      typed_query :companies_list_view, :read do
        ts_result_type_name "CompaniesListView"
        ts_fields_const_name "companiesListFields"

        fields [
          :id,
          :name,
          :address_line_1,
          :address_line_2,
          :city,
          :postal_code,
          :country,
          :vat_number,
          :email,
          :phone,
          :is_default
        ]
      end

      # Typed query for getting a company for editing
      typed_query :company_edit_view, :get_by_id do
        ts_result_type_name "CompanyEditView"
        ts_fields_const_name "companyEditFields"

        fields [
          :id,
          :name,
          :address_line_1,
          :address_line_2,
          :city,
          :postal_code,
          :country,
          :vat_number,
          :email,
          :phone,
          :is_default
        ]
      end
    end

    # Customer management
    resource AshTypescriptReactExample.Invoicing.Customer do
      rpc_action :create_customer, :create
      rpc_action :get_customer, :get_by_id
      rpc_action :update_customer, :update
      rpc_action :delete_customer, :destroy
      rpc_action :list_active_customers, :list_active
      rpc_action :deactivate_customer, :deactivate
      rpc_action :activate_customer, :activate

      # Typed query for listing active customers with basic info
      typed_query :customers_list_view, :list_active do
        ts_result_type_name "CustomersListView"
        ts_fields_const_name "customersListFields"

        fields [
          :id,
          :name,
          :address_line_1,
          :address_line_2,
          :city,
          :postal_code,
          :country,
          :vat_number,
          :email,
          :phone,
          :is_active
        ]
      end
    end

    # Invoice management
    resource AshTypescriptReactExample.Invoicing.Invoice do
      rpc_action :create_invoice, :create
      rpc_action :get_invoice, :get_by_id
      rpc_action :update_invoice, :update
      rpc_action :delete_invoice, :destroy
      rpc_action :list_invoices, :read
      rpc_action :list_invoices_by_state, :list_by_state
      rpc_action :finalize_invoice, :finalize
      rpc_action :cancel_invoice, :cancel

      # Typed query for listing invoices
      typed_query :invoices_list_view, :read do
        ts_result_type_name "InvoicesListView"
        ts_fields_const_name "invoicesListFields"

        fields [
          :id,
          :serial_number,
          :state,
          :issue_date,
          :due_date,
          :company_name,
          :customer_name,
          :currency
        ]
      end

      # Typed query for getting an invoice for editing
      typed_query :invoice_edit_view, :get_by_id do
        ts_result_type_name "InvoiceEditView"
        ts_fields_const_name "invoiceEditFields"

        fields [
          :id,
          :serial_number,
          :state,
          :issue_date,
          :due_date,
          :company_name,
          :company_address_line_1,
          :company_address_line_2,
          :company_city,
          :company_postal_code,
          :company_country,
          :company_vat_number,
          :company_email,
          :company_phone,
          :customer_name,
          :customer_address_line_1,
          :customer_address_line_2,
          :customer_city,
          :customer_postal_code,
          :customer_country,
          :customer_vat_number,
          :customer_email,
          :customer_phone,
          :currency
        ]
      end
    end

    # Invoice line management
    resource AshTypescriptReactExample.Invoicing.InvoiceLine do
      rpc_action :create_invoice_line, :create
      rpc_action :get_invoice_line, :get_by_id
      rpc_action :update_invoice_line, :update
      rpc_action :delete_invoice_line, :destroy
      rpc_action :list_invoice_lines, :list_for_invoice
      rpc_action :get_invoice_line_by_number, :get_by_invoice_and_line_number
    end

    # Credit note management
    resource AshTypescriptReactExample.Invoicing.CreditNote do
      rpc_action :create_credit_note, :create
      rpc_action :create_credit_note_from_invoice, :create_from_invoice
      rpc_action :get_credit_note, :get_by_id
      rpc_action :update_credit_note, :update
      rpc_action :delete_credit_note, :destroy
      rpc_action :list_credit_notes, :list
      rpc_action :list_credit_notes_by_state, :list_by_state
      rpc_action :list_credit_notes_for_invoice, :list_for_invoice
      rpc_action :finalize_credit_note, :finalize
      rpc_action :cancel_credit_note, :cancel

      # Typed query for listing credit notes
      typed_query :credit_notes_list_view, :list do
        ts_result_type_name "CreditNotesListView"
        ts_fields_const_name "creditNotesListFields"

        fields [
          :id,
          :serial_number,
          :state,
          :issue_date,
          :company_name,
          :customer_name,
          :currency,
          :credit_reason
        ]
      end

      # Typed query for getting a credit note for editing
      typed_query :credit_note_edit_view, :get_by_id do
        ts_result_type_name "CreditNoteEditView"
        ts_fields_const_name "creditNoteEditFields"

        fields [
          :id,
          :serial_number,
          :state,
          :issue_date,
          :company_name,
          :company_address_line_1,
          :company_address_line_2,
          :company_city,
          :company_postal_code,
          :company_country,
          :company_vat_number,
          :company_email,
          :company_phone,
          :customer_name,
          :customer_address_line_1,
          :customer_address_line_2,
          :customer_city,
          :customer_postal_code,
          :customer_country,
          :customer_vat_number,
          :customer_email,
          :customer_phone,
          :currency
        ]
      end
    end

    # Credit note line management
    resource AshTypescriptReactExample.Invoicing.CreditNoteLine do
      rpc_action :create_credit_note_line, :create
      rpc_action :get_credit_note_line, :get_by_id
      rpc_action :update_credit_note_line, :update
      rpc_action :delete_credit_note_line, :destroy
      rpc_action :list_credit_note_lines, :list_for_credit_note
      rpc_action :get_credit_note_line_by_number, :get_by_credit_note_and_line_number
    end

    # Sequence number management (mostly internal, but expose read access)
    resource AshTypescriptReactExample.Invoicing.SequenceNumber do
      rpc_action :get_sequence_number, :get_by_id
      rpc_action :get_sequence_for_user_and_type, :get_for_user_and_type
    end
  end

  resources do
    resource AshTypescriptReactExample.Invoicing.Company
    resource AshTypescriptReactExample.Invoicing.Customer
    resource AshTypescriptReactExample.Invoicing.SequenceNumber
    resource AshTypescriptReactExample.Invoicing.Invoice
    resource AshTypescriptReactExample.Invoicing.InvoiceLine
    resource AshTypescriptReactExample.Invoicing.CreditNote
    resource AshTypescriptReactExample.Invoicing.CreditNoteLine
  end
end
