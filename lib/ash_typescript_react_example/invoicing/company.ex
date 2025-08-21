defmodule AshTypescriptReactExample.Invoicing.Company do
  @moduledoc """
  Company resource for storing sender company details.
  
  Companies represent the sender information that appears on invoices and credit notes.
  Each user can have multiple companies, with one marked as default.
  Company details are captured at invoice creation time for immutability.
  """

  use Ash.Resource,
    otp_app: :ash_typescript_react_example,
    domain: AshTypescriptReactExample.Invoicing,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  # Clean TypeScript type name
  typescript do
    type_name "Company"
  end

  postgres do
    table "companies"
    repo AshTypescriptReactExample.Repo

    custom_indexes do
      index [:user_id]
      index [:user_id, :is_default]
    end
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

    # Company details
    attribute :name, :string, allow_nil?: false, public?: true
    attribute :address_line_1, :string, allow_nil?: false, public?: true
    attribute :address_line_2, :string, allow_nil?: true, public?: true
    attribute :city, :string, allow_nil?: false, public?: true
    attribute :postal_code, :string, allow_nil?: false, public?: true
    attribute :country, :string, allow_nil?: false, public?: true
    attribute :vat_number, :string, allow_nil?: true, public?: true
    attribute :email, :string, allow_nil?: true, public?: true
    attribute :phone, :string, allow_nil?: true, public?: true
    attribute :is_default, :boolean, default: false, allow_nil?: false, public?: true

    # Timestamps
    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :user, AshTypescriptReactExample.Accounts.User do
      allow_nil? false
      attribute_writable? false
    end
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true
      accept [:name, :address_line_1, :address_line_2, :city, :postal_code, :country, :vat_number, :email, :phone, :is_default]

      change relate_actor(:user)
      change set_attribute(:user_id, actor(:id))
    end

    update :update do
      primary? true
      accept [:name, :address_line_1, :address_line_2, :city, :postal_code, :country, :vat_number, :email, :phone, :is_default]
    end

    read :list do
      # Will be used for listing companies for a user
    end

    read :get_default do
      # Get the default company for a user
      filter expr(is_default == true)
    end
  end

  policies do
    # Only allow users to access their own companies
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
    validate match(:email, ~r/.+@.+\..+/), message: "must be a valid email address", on: [:create, :update]
  end
end