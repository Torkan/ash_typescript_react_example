defmodule AshTypescriptReactExample.Invoicing.SequenceNumber do
  @moduledoc """
  SequenceNumber resource for managing serial number sequences per user.

  This resource ensures atomic increment of sequence numbers and prevents race conditions.
  Each user has separate sequences for different document types (invoice, credit_note).
  """

  use Ash.Resource,
    domain: AshTypescriptReactExample.Invoicing,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "sequence_numbers"
    repo AshTypescriptReactExample.Repo

    custom_indexes do
      # Unique constraint per user and document type
      index [:user_id, :document_type], unique: true
    end
  end

  # Clean TypeScript type name
  typescript do
    type_name "SequenceNumber"
  end

  actions do
    defaults [:read]

    create :create do
      primary? true
      accept [:user_id, :document_type, :next_number]
    end

    read :get_for_user_and_type do
      # Get sequence for specific user and document type
      argument :user_id, :uuid, allow_nil?: false
      argument :document_type, :atom, allow_nil?: false

      filter expr(user_id == ^arg(:user_id) and document_type == ^arg(:document_type))
    end

    update :increment_next_number do
      # Atomically increment the next number
      accept []
      change atomic_update(:next_number, expr(next_number + 1))
    end

    read :get_by_id do
      get_by [:id]
    end
  end

  policies do
    # Only allow system/internal access - users don't directly manage sequences
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy action_type([:read, :create, :update]) do
      # This will be used internally by the system
      authorize_if always()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :user_id, :uuid, allow_nil?: false, public?: true

    attribute :document_type, :atom,
      constraints: [one_of: [:invoice, :credit_note]],
      allow_nil?: false,
      public?: true

    attribute :next_number, :integer, default: 1, allow_nil?: false, public?: true

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

  identities do
    # Ensure only one sequence per user per document type
    identity :unique_user_document_type, [:user_id, :document_type]
  end
end
