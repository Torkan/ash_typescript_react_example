defmodule AshTypescriptReactExample.Invoicing.InvoiceLine do
  @moduledoc """
  InvoiceLine resource representing individual line items for invoices.

  Each line item has quantity, unit price, and tax rate.
  Financial totals are calculated using Ash calculations for consistency.
  Line items can only be modified when the parent invoice is in draft state.
  """

  use Ash.Resource,
    domain: AshTypescriptReactExample.Invoicing,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "invoice_lines"
    repo AshTypescriptReactExample.Repo

    custom_indexes do
      index [:invoice_id]
      index [:invoice_id, :line_number], unique: true
    end
  end

  # Clean TypeScript type name
  typescript do
    type_name "InvoiceLine"
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true
      accept [:invoice_id, :line_number, :description, :quantity, :unit_price, :tax_rate]
    end

    update :update do
      primary? true
      accept [:line_number, :description, :quantity, :unit_price, :tax_rate]
    end

    read :list_for_invoice do
      # Get all lines for a specific invoice, ordered by line_number
      argument :invoice_id, :uuid, allow_nil?: false
      filter expr(invoice_id == ^arg(:invoice_id))
      prepare build(sort: [:line_number])
    end

    read :get_by_invoice_and_line_number do
      # Get a specific line by invoice and line number
      argument :invoice_id, :uuid, allow_nil?: false
      argument :line_number, :integer, allow_nil?: false
      filter expr(invoice_id == ^arg(:invoice_id) and line_number == ^arg(:line_number))
    end
  end

  policies do
    # Lines inherit access control from their parent invoice
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy action_type(:read) do
      authorize_if actor_present()
    end

    policy action_type([:create, :update, :destroy]) do
      authorize_if actor_present()
      # Additional validation: only allow modifications when parent invoice is draft
      # This will be enforced through business logic in the domain
    end
  end

  validations do
    # Quantity must be positive
    validate compare(:quantity, greater_than: 0),
      message: "must be greater than 0"

    # Unit price must be non-negative (can be 0 for free items)
    validate compare(:unit_price, greater_than_or_equal_to: 0),
      message: "must be 0 or greater"

    # Tax rate must be non-negative (typically 0-100%)
    validate compare(:tax_rate, greater_than_or_equal_to: 0),
      message: "must be 0 or greater"

    # Tax rate should be reasonable (0-100%)
    validate compare(:tax_rate, less_than_or_equal_to: 100),
      message: "should not exceed 100%"

    # Line number must be positive
    validate compare(:line_number, greater_than: 0),
      message: "must be greater than 0"

    # Description cannot be empty
    validate string_length(:description, min: 1),
      message: "cannot be empty"
  end

  attributes do
    uuid_primary_key :id

    attribute :invoice_id, :uuid, allow_nil?: false, public?: true

    # For ordering
    attribute :line_number, :integer, allow_nil?: false, public?: true
    attribute :description, :string, allow_nil?: false, public?: true
    attribute :quantity, :decimal, default: Decimal.new("1"), allow_nil?: false, public?: true
    attribute :unit_price, :decimal, allow_nil?: false, public?: true

    # Tax percentage (e.g., 25.0 for 25%)

    attribute :tax_rate, :decimal, default: Decimal.new("0"), allow_nil?: false, public?: true

    # Timestamps
    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :invoice, AshTypescriptReactExample.Invoicing.Invoice do
      allow_nil? false
      attribute_writable? false
    end
  end

  # Financial calculations using Ash expressions
  calculations do
    calculate :line_total, :decimal, expr(quantity * unit_price)
    calculate :tax_amount, :decimal, expr(quantity * unit_price * (tax_rate / 100))

    calculate :line_total_with_tax,
              :decimal,
              expr(quantity * unit_price + quantity * unit_price * (tax_rate / 100))
  end

  identities do
    # Ensure unique line numbers per invoice
    identity :unique_invoice_line_number, [:invoice_id, :line_number]
  end
end
