defmodule AshTypescriptReactExample.Invoicing.CreditNote do
  @moduledoc """
  CreditNote resource representing credit note documents.

  Credit notes mirror the invoice structure but are used for corrections or refunds.
  They follow the same state management: draft -> finalized -> (terminal)
  May reference an original invoice for correction tracking.

  Company and customer details are duplicated for immutability.
  """

  use Ash.Resource,
    domain: AshTypescriptReactExample.Invoicing,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource, AshStateMachine],
    authorizers: [Ash.Policy.Authorizer]

  require Ash.Query

  postgres do
    table "credit_notes"
    repo AshTypescriptReactExample.Repo

    custom_indexes do
      # Performance indexes
      index [:user_id]
      index [:state]
      index [:serial_number]
      index [:issue_date]
      index [:original_invoice_id]

      # Unique constraint for serial numbers per user (only when not null)
      index [:serial_number, :user_id], unique: true, where: "serial_number IS NOT NULL"
    end
  end

  # Clean TypeScript type name
  typescript do
    type_name "CreditNote"
  end

  # State machine will be implemented in task 13
  state_machine do
    initial_states([:draft])
    default_initial_state(:draft)

    transitions do
      # Draft can be finalized or cancelled
      transition(:finalize, from: :draft, to: :finalized)
      transition(:cancel, from: :draft, to: :cancelled)
    end
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true

      accept [
        :issue_date,
        :original_invoice_id,
        :credit_reason,
        :currency,
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
        :customer_phone
      ]

      argument :credit_note_lines, {:array, :map}, default: []

      change relate_actor(:user)
      change set_attribute(:user_id, actor(:id))

      change manage_relationship(:credit_note_lines, type: :direct_control)
    end

    create :create_from_invoice do
      # Create credit note from existing invoice
      argument :invoice_id, :uuid, allow_nil?: false
      argument :credit_reason, :string, allow_nil?: false

      change relate_actor(:user)
      change set_attribute(:user_id, actor(:id))
      change set_attribute(:original_invoice_id, arg(:invoice_id))
      change set_attribute(:credit_reason, arg(:credit_reason))

      # Logic to copy invoice details will be implemented
    end

    update :update do
      primary? true
      require_atomic? false
      # State validation ensures only draft credit notes can be updated

      accept [
        :issue_date,
        :original_invoice_id,
        :credit_reason,
        :currency,
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
        :customer_phone
      ]

      argument :credit_note_lines, {:array, :map}, default: []

      change manage_relationship(:credit_note_lines, type: :direct_control)
    end

    read :list do
      # Will be used for listing credit notes for a user
    end

    read :list_by_state do
      # Filter credit notes by state
      argument :state, :atom, allow_nil?: false
      filter expr(state == ^arg(:state))
    end

    read :list_for_invoice do
      # Get credit notes for a specific invoice
      argument :invoice_id, :uuid, allow_nil?: false
      filter expr(original_invoice_id == ^arg(:invoice_id))
    end

    read :get_by_id do
      get_by [:id]
    end

    update :finalize do
      # Transition credit note to finalized state and assign serial number
      accept []
      require_atomic? false

      change fn changeset, _context ->
        user_id = Ash.Changeset.get_attribute(changeset, :user_id)

        # Get or create sequence number for this user and document type
        sequence_result =
          case AshTypescriptReactExample.Invoicing.SequenceNumber
               |> Ash.Query.filter(expr(user_id == ^user_id and document_type == :credit_note))
               |> Ash.read_one() do
            {:ok, nil} ->
              # Create new sequence starting at 1
              AshTypescriptReactExample.Invoicing.SequenceNumber
              |> Ash.Changeset.for_create(:create, %{
                user_id: user_id,
                document_type: :credit_note,
                next_number: 1
              })
              |> Ash.create()

            {:ok, sequence} ->
              # Increment existing sequence
              sequence
              |> Ash.Changeset.for_update(:increment_next_number)
              |> Ash.update()

            error ->
              error
          end

        case sequence_result do
          {:ok, sequence} ->
            # Format serial number: CN-YYYY-NNNN
            current_year = Date.utc_today().year

            serial_number =
              "CN-#{current_year}-#{String.pad_leading(to_string(sequence.next_number), 4, "0")}"

            changeset
            |> Ash.Changeset.change_attribute(:serial_number, serial_number)

          {:error, error} ->
            Ash.Changeset.add_error(
              changeset,
              "Failed to assign serial number: #{inspect(error)}"
            )
        end
      end
    end

    update :cancel do
      # Transition credit note to cancelled state
      accept []
      require_atomic? false

      # State machine will handle the state transition automatically
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_present()
    end

    policy action_type([:create, :update, :destroy]) do
      authorize_if actor_present()
    end
  end

  validations do
    validate attribute_in(:state, [:draft]),
      message: "can only update draft credit notes",
      on: [:update]

    validate string_length(:credit_reason, min: 1),
      message: "cannot be empty"
  end

  # Multi-tenant by user_id
  multitenancy do
    strategy :attribute
    attribute :user_id
  end

  attributes do
    uuid_primary_key :id

    # Tenant attribute
    attribute :user_id, :uuid, allow_nil?: false, public?: true

    # Credit note metadata

    # Only set when finalized
    attribute :serial_number, :string, allow_nil?: true, public?: true

    attribute :state, :atom,
      constraints: [one_of: [:draft, :finalized, :cancelled]],
      default: :draft,
      allow_nil?: false,
      public?: true

    attribute :issue_date, :date, allow_nil?: false, public?: true

    # Reference to original invoice if this is a correction
    attribute :original_invoice_id, :uuid, allow_nil?: true, public?: true

    # Reason for the credit note

    attribute :credit_reason, :string, allow_nil?: false, public?: true

    attribute :company_name, :string, allow_nil?: false, public?: true
    attribute :company_address_line_1, :string, allow_nil?: false, public?: true
    attribute :company_address_line_2, :string, allow_nil?: true, public?: true
    attribute :company_city, :string, allow_nil?: false, public?: true
    attribute :company_postal_code, :string, allow_nil?: false, public?: true
    attribute :company_country, :string, allow_nil?: false, public?: true
    attribute :company_vat_number, :string, allow_nil?: true, public?: true
    attribute :company_email, :string, allow_nil?: true, public?: true
    attribute :company_phone, :string, allow_nil?: true, public?: true

    attribute :customer_name, :string, allow_nil?: false, public?: true
    attribute :customer_address_line_1, :string, allow_nil?: false, public?: true
    attribute :customer_address_line_2, :string, allow_nil?: true, public?: true
    attribute :customer_city, :string, allow_nil?: false, public?: true
    attribute :customer_postal_code, :string, allow_nil?: false, public?: true
    attribute :customer_country, :string, allow_nil?: false, public?: true
    attribute :customer_vat_number, :string, allow_nil?: true, public?: true
    attribute :customer_email, :string, allow_nil?: true, public?: true
    attribute :customer_phone, :string, allow_nil?: true, public?: true

    # Currency
    attribute :currency, :string, default: "NOK", allow_nil?: false, public?: true

    # Timestamps
    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :user, AshTypescriptReactExample.Accounts.User do
      allow_nil? false
      attribute_writable? false
    end

    belongs_to :original_invoice, AshTypescriptReactExample.Invoicing.Invoice do
      allow_nil? true
      attribute_writable? true
      source_attribute :original_invoice_id
      destination_attribute :id
    end

    has_many :credit_note_lines, AshTypescriptReactExample.Invoicing.CreditNoteLine
  end

  calculations do
    calculate :total_amount, :decimal, expr(subtotal_amount + tax_amount)
  end

  aggregates do
    sum :subtotal_amount, :credit_note_lines, :line_total do
      default Decimal.new(0)
    end

    sum :tax_amount, :credit_note_lines, :tax_amount do
      default Decimal.new(0)
    end
  end
end
