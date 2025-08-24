defmodule AshTypescriptReactExample.Invoicing.Customer do
  @moduledoc """
  Customer resource for storing recipient details.

  Customers represent the recipient information that appears on invoices and credit notes.
  Customer details are captured at invoice creation time for immutability.
  Customers can be marked as inactive to hide them from selection lists.
  """

  use Ash.Resource,
    domain: AshTypescriptReactExample.Invoicing,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "customers"
    repo AshTypescriptReactExample.Repo

    custom_indexes do
      index [:user_id]
      index [:user_id, :is_active]
    end
  end

  # Clean TypeScript type name
  typescript do
    type_name "Customer"
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true

      accept [
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

      change relate_actor(:user)
      change set_attribute(:user_id, actor(:id))
    end

    update :update do
      primary? true

      accept [
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

    read :list_active do
      # Will be used for listing active customers for a user
      filter expr(is_active == true)
    end

    update :deactivate do
      # Soft delete by marking as inactive
      accept []
      change set_attribute(:is_active, false)
    end

    update :activate do
      # Reactivate a customer
      accept []
      change set_attribute(:is_active, true)
    end
  end

  policies do
    # Only allow users to access their own customers
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
    validate match(:email, ~r/.+@.+\..+/),
      message: "must be a valid email address",
      on: [:create, :update]
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

    # Customer details
    attribute :name, :string, allow_nil?: false, public?: true
    attribute :address_line_1, :string, allow_nil?: false, public?: true
    attribute :address_line_2, :string, allow_nil?: true, public?: true
    attribute :city, :string, allow_nil?: false, public?: true
    attribute :postal_code, :string, allow_nil?: false, public?: true
    attribute :country, :string, allow_nil?: false, public?: true
    attribute :vat_number, :string, allow_nil?: true, public?: true
    attribute :email, :string, allow_nil?: true, public?: true
    attribute :phone, :string, allow_nil?: true, public?: true
    attribute :is_active, :boolean, default: true, allow_nil?: false, public?: true

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
end
