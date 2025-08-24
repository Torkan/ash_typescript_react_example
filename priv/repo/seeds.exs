# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     AshTypescriptReactExample.Repo.insert!(%AshTypescriptReactExample.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

import Ecto.Query

# Helper function to create a user with magic link without sending email
defmodule SeedHelpers do
  def create_or_get_user(email) do
    # Try to find existing user first
    case AshTypescriptReactExample.Repo.get_by(AshTypescriptReactExample.Accounts.User,
           email: email
         ) do
      nil ->
        # Create user directly in the database
        AshTypescriptReactExample.Repo.insert!(%AshTypescriptReactExample.Accounts.User{
          id: Ecto.UUID.generate(),
          email: email
        })

      user ->
        user
    end
  end
end

# Clear existing invoicing data for clean re-seeding
IO.puts("🧹 Clearing existing invoicing data...")
AshTypescriptReactExample.Repo.delete_all("invoice_lines")
AshTypescriptReactExample.Repo.delete_all("credit_note_lines")
AshTypescriptReactExample.Repo.delete_all("invoices")
AshTypescriptReactExample.Repo.delete_all("credit_notes")
AshTypescriptReactExample.Repo.delete_all("customers")
AshTypescriptReactExample.Repo.delete_all("companies")
AshTypescriptReactExample.Repo.delete_all("sequence_numbers")
IO.puts("✅ Cleared existing data")

IO.puts("🌱 Creating seed data...")

# Create test user
user = SeedHelpers.create_or_get_user("test@example.com")
IO.puts("✅ Got user: #{user.email}")

# Create companies using Ash actions
{:ok, default_company} =
  AshTypescriptReactExample.Invoicing.Company
  |> Ash.Changeset.for_create(
    :create,
    %{
      name: "Acme Corporation Ltd",
      address_line_1: "123 Business Street",
      address_line_2: "Suite 100",
      city: "Oslo",
      postal_code: "0150",
      country: "Norway",
      vat_number: "NO123456789MVA",
      email: "billing@acme.com",
      phone: "+47 22 00 00 00",
      is_default: true
    }, tenant: user.id, actor: user)
  |> Ash.create()

{:ok, second_company} =
  AshTypescriptReactExample.Invoicing.Company
  |> Ash.Changeset.for_create(
    :create,
    %{
      name: "Nordic Tech Solutions AS",
      address_line_1: "456 Innovation Drive",
      city: "Bergen",
      postal_code: "5020",
      country: "Norway",
      vat_number: "NO987654321MVA",
      email: "invoices@nordictechsolutions.com",
      phone: "+47 55 00 00 00",
      is_default: false
    }, tenant: user.id, actor: user)
  |> Ash.create()

IO.puts("✅ Created companies: #{default_company.name}, #{second_company.name}")

# Create customers
{:ok, customer1} =
  AshTypescriptReactExample.Invoicing.Customer
  |> Ash.Changeset.for_create(
    :create,
    %{
      name: "TechStart Solutions AB",
      address_line_1: "789 Startup Avenue",
      city: "Stockholm",
      postal_code: "11122",
      country: "Sweden",
      vat_number: "SE556123456701",
      email: "accounts@techstart.se",
      phone: "+46 8 123 456 78"
    }, tenant: user.id, actor: user)
  |> Ash.create()

{:ok, customer2} =
  AshTypescriptReactExample.Invoicing.Customer
  |> Ash.Changeset.for_create(
    :create,
    %{
      name: "FinanceFlow Danmark ApS",
      address_line_1: "321 Business Park",
      address_line_2: "Building C",
      city: "Copenhagen",
      postal_code: "1234",
      country: "Denmark",
      vat_number: "DK12345678",
      email: "billing@financeflow.dk",
      phone: "+45 33 12 34 56"
    }, tenant: user.id, actor: user)
  |> Ash.create()

{:ok, customer3} =
  AshTypescriptReactExample.Invoicing.Customer
  |> Ash.Changeset.for_create(
    :create,
    %{
      name: "Individual Consultant",
      address_line_1: "456 Freelance Street",
      city: "Trondheim",
      postal_code: "7010",
      country: "Norway",
      email: "consultant@individual.no",
      phone: "+47 73 00 00 00"
    }, tenant: user.id, actor: user)
  |> Ash.create()

IO.puts("✅ Created customers: #{customer1.name}, #{customer2.name}, #{customer3.name}")

# Create draft invoice with lines
{:ok, draft_invoice} =
  AshTypescriptReactExample.Invoicing.Invoice
  |> Ash.Changeset.for_create(
    :create,
    %{
      issue_date: Date.utc_today(),
      due_date: Date.add(Date.utc_today(), 30),
      company_name: default_company.name,
      company_address_line_1: default_company.address_line_1,
      company_address_line_2: default_company.address_line_2,
      company_city: default_company.city,
      company_postal_code: default_company.postal_code,
      company_country: default_company.country,
      company_vat_number: default_company.vat_number,
      company_email: default_company.email,
      company_phone: default_company.phone,
      customer_name: customer1.name,
      customer_address_line_1: customer1.address_line_1,
      customer_address_line_2: customer1.address_line_2,
      customer_city: customer1.city,
      customer_postal_code: customer1.postal_code,
      customer_country: customer1.country,
      customer_vat_number: customer1.vat_number,
      customer_email: customer1.email,
      customer_phone: customer1.phone,
      currency: "NOK"
    }, tenant: user.id, actor: user)
  |> Ash.create()

# Add lines to draft invoice
{:ok, _line1} =
  AshTypescriptReactExample.Invoicing.InvoiceLine
  |> Ash.Changeset.for_create(
    :create,
    %{
      invoice_id: draft_invoice.id,
      line_number: 1,
      description: "Web Development Services - Frontend Implementation",
      quantity: Decimal.new("40.0"),
      unit_price: Decimal.new("1250.00"),
      tax_rate: Decimal.new("25.0")
    }, actor: user)
  |> Ash.create()

{:ok, _line2} =
  AshTypescriptReactExample.Invoicing.InvoiceLine
  |> Ash.Changeset.for_create(
    :create,
    %{
      invoice_id: draft_invoice.id,
      line_number: 2,
      description: "Backend API Development",
      quantity: Decimal.new("32.0"),
      unit_price: Decimal.new("1400.00"),
      tax_rate: Decimal.new("25.0")
    }, actor: user)
  |> Ash.create()

{:ok, _line3} =
  AshTypescriptReactExample.Invoicing.InvoiceLine
  |> Ash.Changeset.for_create(
    :create,
    %{
      invoice_id: draft_invoice.id,
      line_number: 3,
      description: "Database Design and Migration",
      quantity: Decimal.new("8.0"),
      unit_price: Decimal.new("1600.00"),
      tax_rate: Decimal.new("25.0")
    }, actor: user)
  |> Ash.create()

IO.puts("✅ Created draft invoice with 3 lines")

# Create and finalize another invoice
{:ok, finalized_invoice} =
  AshTypescriptReactExample.Invoicing.Invoice
  |> Ash.Changeset.for_create(
    :create,
    %{
      issue_date: Date.add(Date.utc_today(), -7),
      due_date: Date.add(Date.utc_today(), 23),
      company_name: default_company.name,
      company_address_line_1: default_company.address_line_1,
      company_address_line_2: default_company.address_line_2,
      company_city: default_company.city,
      company_postal_code: default_company.postal_code,
      company_country: default_company.country,
      company_vat_number: default_company.vat_number,
      company_email: default_company.email,
      company_phone: default_company.phone,
      customer_name: customer2.name,
      customer_address_line_1: customer2.address_line_1,
      customer_address_line_2: customer2.address_line_2,
      customer_city: customer2.city,
      customer_postal_code: customer2.postal_code,
      customer_country: customer2.country,
      customer_vat_number: customer2.vat_number,
      customer_email: customer2.email,
      customer_phone: customer2.phone,
      currency: "NOK"
    }, tenant: user.id, actor: user)
  |> Ash.create()

# Add lines to finalized invoice
{:ok, _line1} =
  AshTypescriptReactExample.Invoicing.InvoiceLine
  |> Ash.Changeset.for_create(
    :create,
    %{
      invoice_id: finalized_invoice.id,
      line_number: 1,
      description: "Consulting Services - Technical Architecture Review",
      quantity: Decimal.new("16.0"),
      unit_price: Decimal.new("1800.00"),
      tax_rate: Decimal.new("25.0")
    }, actor: user)
  |> Ash.create()

{:ok, _line2} =
  AshTypescriptReactExample.Invoicing.InvoiceLine
  |> Ash.Changeset.for_create(
    :create,
    %{
      invoice_id: finalized_invoice.id,
      line_number: 2,
      description: "Project Management and Documentation",
      quantity: Decimal.new("12.0"),
      unit_price: Decimal.new("1200.00"),
      tax_rate: Decimal.new("25.0")
    }, actor: user)
  |> Ash.create()

# Finalize the invoice (this should assign a serial number)
{:ok, finalized_invoice} =
  finalized_invoice
  |> Ash.Changeset.for_update(:finalize, %{}, tenant: user.id, actor: user)
  |> Ash.update()

IO.puts("✅ Created and finalized invoice: #{finalized_invoice.serial_number}")

# Create a credit note for the finalized invoice
{:ok, credit_note} =
  AshTypescriptReactExample.Invoicing.CreditNote
  |> Ash.Changeset.for_create(
    :create,
    %{
      issue_date: Date.utc_today(),
      original_invoice_id: finalized_invoice.id,
      credit_reason: "Partial refund due to scope reduction",
      company_name: finalized_invoice.company_name,
      company_address_line_1: finalized_invoice.company_address_line_1,
      company_address_line_2: finalized_invoice.company_address_line_2,
      company_city: finalized_invoice.company_city,
      company_postal_code: finalized_invoice.company_postal_code,
      company_country: finalized_invoice.company_country,
      company_vat_number: finalized_invoice.company_vat_number,
      company_email: finalized_invoice.company_email,
      company_phone: finalized_invoice.company_phone,
      customer_name: finalized_invoice.customer_name,
      customer_address_line_1: finalized_invoice.customer_address_line_1,
      customer_address_line_2: finalized_invoice.customer_address_line_2,
      customer_city: finalized_invoice.customer_city,
      customer_postal_code: finalized_invoice.customer_postal_code,
      customer_country: finalized_invoice.customer_country,
      customer_vat_number: finalized_invoice.customer_vat_number,
      customer_email: finalized_invoice.customer_email,
      customer_phone: finalized_invoice.customer_phone,
      currency: finalized_invoice.currency
    }, tenant: user.id, actor: user)
  |> Ash.create()

# Add line to credit note (partial credit)
{:ok, _credit_line} =
  AshTypescriptReactExample.Invoicing.CreditNoteLine
  |> Ash.Changeset.for_create(
    :create,
    %{
      credit_note_id: credit_note.id,
      line_number: 1,
      description: "Credit for reduced project management hours",
      quantity: Decimal.new("4.0"),
      unit_price: Decimal.new("1200.00"),
      tax_rate: Decimal.new("25.0")
    }, actor: user)
  |> Ash.create()

# Finalize the credit note
{:ok, credit_note} =
  credit_note
  |> Ash.Changeset.for_update(:finalize, %{}, tenant: user.id, actor: user)
  |> Ash.update()

IO.puts("✅ Created and finalized credit note: #{credit_note.serial_number}")

# Create simple invoice for individual consultant  
{:ok, simple_invoice} =
  AshTypescriptReactExample.Invoicing.Invoice
  |> Ash.Changeset.for_create(
    :create,
    %{
      issue_date: Date.add(Date.utc_today(), -3),
      due_date: Date.add(Date.utc_today(), 14),
      company_name: second_company.name,
      company_address_line_1: second_company.address_line_1,
      company_city: second_company.city,
      company_postal_code: second_company.postal_code,
      company_country: second_company.country,
      company_vat_number: second_company.vat_number,
      company_email: second_company.email,
      company_phone: second_company.phone,
      customer_name: customer3.name,
      customer_address_line_1: customer3.address_line_1,
      customer_city: customer3.city,
      customer_postal_code: customer3.postal_code,
      customer_country: customer3.country,
      customer_email: customer3.email,
      customer_phone: customer3.phone,
      currency: "NOK"
    }, tenant: user.id, actor: user)
  |> Ash.create()

# Add single line
{:ok, _simple_line} =
  AshTypescriptReactExample.Invoicing.InvoiceLine
  |> Ash.Changeset.for_create(
    :create,
    %{
      invoice_id: simple_invoice.id,
      line_number: 1,
      description: "Software Development Consultation - 1 day",
      quantity: Decimal.new("8.0"),
      unit_price: Decimal.new("1500.00"),
      tax_rate: Decimal.new("25.0")
    }, actor: user)
  |> Ash.create()

IO.puts("✅ Created simple invoice for individual consultant")

IO.puts("\n🎉 Seed data creation completed successfully!")
IO.puts("📊 Summary:")
IO.puts("  • 1 test user (#{user.email})")
IO.puts("  • 2 companies (1 default, 1 secondary)")
IO.puts("  • 3 customers")
IO.puts("  • 3 invoices (1 draft, 1 finalized, 1 simple)")
IO.puts("  • 1 finalized credit note")
IO.puts("  • Multiple invoice/credit note lines")
IO.puts("\n💡 You can now test the system with realistic data!")
IO.puts("🔍 Access with: user_id = \"#{user.id}\"")
