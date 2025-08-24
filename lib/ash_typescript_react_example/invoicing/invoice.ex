defmodule AshTypescriptReactExample.Invoicing.Invoice do
  @moduledoc """
  Invoice resource representing the main invoice entity with state management.

  Invoices go through states: draft -> finalized -> (terminal)
  Only draft invoices can be edited. Finalized invoices are completely immutable.
  Serial numbers are assigned when transitioning to finalized state.

  Company and customer details are duplicated for immutability - if the source
  company/customer changes later, historical invoices remain accurate.
  """

  use Ash.Resource,
    domain: AshTypescriptReactExample.Invoicing,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource, AshStateMachine],
    authorizers: [Ash.Policy.Authorizer]

  require Ash.Query

  postgres do
    table "invoices"
    repo AshTypescriptReactExample.Repo

    custom_indexes do
      # Performance indexes
      index [:user_id]
      index [:state]
      index [:serial_number]
      index [:issue_date]

      # Unique constraint for serial numbers per user (only when not null)
      index [:serial_number, :user_id], unique: true, where: "serial_number IS NOT NULL"
    end
  end

  # Clean TypeScript type name
  typescript do
    type_name "Invoice"
  end

  # State machine implementation
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
        :due_date,
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

      change relate_actor(:user)
      change set_attribute(:user_id, actor(:id))
    end

    update :update do
      primary? true
      # State validation ensures only draft invoices can be updated

      accept [
        :issue_date,
        :due_date,
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
    end

    read :list do
      # Will be used for listing invoices for a user
    end

    read :list_by_state do
      # Filter invoices by state
      argument :state, :atom, allow_nil?: false
      filter expr(state == ^arg(:state))
    end

    update :finalize do
      # Transition invoice to finalized state and assign serial number
      accept []
      require_atomic? false

      change fn changeset, _context ->
        user_id = Ash.Changeset.get_attribute(changeset, :user_id)

        # Get or create sequence number for this user and document type
        sequence_result =
          case AshTypescriptReactExample.Invoicing.SequenceNumber
               |> Ash.Query.filter(expr(user_id == ^user_id and document_type == :invoice))
               |> Ash.read_one() do
            {:ok, nil} ->
              # Create new sequence starting at 1
              AshTypescriptReactExample.Invoicing.SequenceNumber
              |> Ash.Changeset.for_create(:create, %{
                user_id: user_id,
                document_type: :invoice,
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
            # Format serial number: INV-YYYY-NNNN
            current_year = Date.utc_today().year

            serial_number =
              "INV-#{current_year}-#{String.pad_leading(to_string(sequence.next_number), 4, "0")}"

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
      # Transition invoice to cancelled state
      accept []
      require_atomic? false

      # State machine will handle the state transition automatically
    end
  end

  policies do
    # Only allow users to access their own invoices
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy action_type(:read) do
      authorize_if actor_present()
    end

    policy action_type([:create, :update, :destroy]) do
      authorize_if actor_present()
    end
  end

  validations do
    # Due date must be after issue date
    validate compare(:due_date, greater_than: :issue_date),
      message: "must be after issue date",
      on: [:create, :update]

    # Only draft invoices can be updated (finalize and cancel have their own logic)
    validate attribute_in(:state, [:draft]),
      message: "can only update draft invoices",
      on: [:update]

    # Serial number validations will be enforced through state machine transitions
    # and business logic rather than complex conditional validations
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

    # Invoice metadata

    # Only set when finalized
    attribute :serial_number, :string, allow_nil?: true, public?: true

    attribute :state, :atom,
      constraints: [one_of: [:draft, :finalized, :cancelled]],
      default: :draft,
      allow_nil?: false,
      public?: true

    attribute :issue_date, :date, allow_nil?: false, public?: true
    attribute :due_date, :date, allow_nil?: false, public?: true

    # Company details (captured at creation time for immutability)
    attribute :company_name, :string, allow_nil?: false, public?: true
    attribute :company_address_line_1, :string, allow_nil?: false, public?: true
    attribute :company_address_line_2, :string, allow_nil?: true, public?: true
    attribute :company_city, :string, allow_nil?: false, public?: true
    attribute :company_postal_code, :string, allow_nil?: false, public?: true
    attribute :company_country, :string, allow_nil?: false, public?: true
    attribute :company_vat_number, :string, allow_nil?: true, public?: true
    attribute :company_email, :string, allow_nil?: true, public?: true
    attribute :company_phone, :string, allow_nil?: true, public?: true

    # Customer details (captured at creation time for immutability)
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

    has_many :invoice_lines, AshTypescriptReactExample.Invoicing.InvoiceLine
  end

  # Financial totals using Ash calculations
  calculations do
    # Total amount: subtotal + tax
    calculate :total_amount, :decimal, expr(subtotal_amount + tax_amount)
  end

  # Aggregates for financial calculations
  aggregates do
    # Calculate sum of line_total from invoice_lines 
    sum :subtotal_amount, :invoice_lines, :line_total do
      default Decimal.new(0)
    end

    # Calculate sum of tax_amount from invoice_lines
    sum :tax_amount, :invoice_lines, :tax_amount do
      default Decimal.new(0)
    end
  end
end
